import argon2 from "argon2";
import { randomUUID } from "crypto";

import { logger } from "../../utils/logger";
import {
  FacilityOption,
  LabAreaOption,
  LoginServiceInput,
  LoginServiceResult,
  SessionState,
} from "./login.types";
import { LoginRepository, LoginRepositoryPort } from "./login.repository";

const INVALID_CREDENTIALS_MESSAGE = "Invalid username or password";
const UNAUTHORIZED_SCOPE_MESSAGE = "Unauthorized facility or lab area access";
const DATABASE_ERROR_MESSAGE = "Database error";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type PasswordVerifier = (hash: string, password: string) => Promise<boolean>;

export interface LoginServiceDeps {
  repository: LoginRepositoryPort;
  passwordVerifier: PasswordVerifier;
  tokenFactory: () => string;
  nowFactory: () => Date;
}

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function mapSessionRowToState(row: {
  SESSION_TOKEN: string;
  FACILITY_ID: string;
  LAB_AREA_ID: string;
  WORK_DATE: Date | string;
  ISSUED_AT: Date | string;
  EXPIRES_AT: Date | string;
}): SessionState {
  return {
    sessionToken: row.SESSION_TOKEN,
    reauthRequired: false,
    issuedAt: toIsoString(row.ISSUED_AT),
    expiresAt: toIsoString(row.EXPIRES_AT),
    facilityId: row.FACILITY_ID,
    labAreaId: row.LAB_AREA_ID,
    workDate: toIsoString(row.WORK_DATE).slice(0, 10),
  };
}

async function logSubmitErrorBestEffort(
  repository: LoginServiceDeps["repository"],
  username: string,
  facilityId: string,
  labAreaId: string,
  errorCode: string
): Promise<void> {
  try {
    await repository.logSubmitError(username, facilityId, labAreaId, errorCode);
  } catch (error) {
    logger.warn("login.submit.error.log_failed", "Best-effort audit log failed", {
      errorCode,
      username,
      facilityId,
      labAreaId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const defaultDeps: LoginServiceDeps = {
  repository: new LoginRepository(),
  passwordVerifier: argon2.verify,
  tokenFactory: randomUUID,
  nowFactory: () => new Date(),
};

export function createLoginService(deps: LoginServiceDeps = defaultDeps) {
  return {
    async loadFacilities(): Promise<FacilityOption[]> {
      const rows = await deps.repository.loadFacilities();
      return rows.map((row) => ({ id: row.ID, code: row.CODE, name: row.NAME }));
    },

    async loadLabAreas(facilityId: string): Promise<LabAreaOption[]> {
      const rows = await deps.repository.loadLabAreas(facilityId);
      return rows.map((row) => ({ id: row.ID, code: row.CODE, name: row.NAME }));
    },

    async submitLogin(input: LoginServiceInput): Promise<LoginServiceResult> {
      try {
        const userRow = await deps.repository.findUserByUsername(input.username);

        if (!userRow) {
          await logSubmitErrorBestEffort(
            deps.repository,
            input.username,
            input.facilityId,
            input.labAreaId,
            "USER_NOT_FOUND"
          );
          return {
            status: "error",
            message: INVALID_CREDENTIALS_MESSAGE,
            session: null,
          };
        }

        if (userRow.IS_ACTIVE !== "Y" || Number(userRow.FAILED_ATTEMPTS) >= 5) {
          await logSubmitErrorBestEffort(
            deps.repository,
            input.username,
            input.facilityId,
            input.labAreaId,
            "ACCOUNT_INACTIVE"
          );
          return {
            status: "error",
            message: INVALID_CREDENTIALS_MESSAGE,
            session: null,
          };
        }

        const passwordValid = await deps.passwordVerifier(
          userRow.PASSWORD_HASH,
          input.password
        );

        if (!passwordValid) {
          await deps.repository.incrementFailedAttempts(userRow.ID);
          await logSubmitErrorBestEffort(
            deps.repository,
            input.username,
            input.facilityId,
            input.labAreaId,
            "INVALID_PASSWORD"
          );

          return {
            status: "error",
            message: INVALID_CREDENTIALS_MESSAGE,
            session: null,
          };
        }

        const hasScopeAccess = await deps.repository.hasScopeAccess(
          userRow.ID,
          input.facilityId,
          input.labAreaId
        );

        if (!hasScopeAccess) {
          await logSubmitErrorBestEffort(
            deps.repository,
            input.username,
            input.facilityId,
            input.labAreaId,
            "UNAUTHORIZED_SCOPE"
          );
          return {
            status: "error",
            message: UNAUTHORIZED_SCOPE_MESSAGE,
            session: null,
          };
        }

        const sessionToken = deps.tokenFactory();
        const issuedAt = deps.nowFactory();
        const expiresAt = new Date(issuedAt.getTime() + SESSION_DURATION_MS);

        // Policy: critical login write path is executed by stored procedure transaction.
        const sessionId = await deps.repository.submitLoginTransactionViaProcedure({
          sessionToken,
          userId: userRow.ID,
          facilityId: input.facilityId,
          labAreaId: input.labAreaId,
          workDate: input.workDate,
          username: input.username,
          issuedAt,
          expiresAt,
        });

        if (!sessionId) {
          throw new Error("LOGIN_SUBMIT_TXN_FAILED");
        }

        const session: SessionState = {
          sessionToken,
          reauthRequired: false,
          issuedAt: issuedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          facilityId: input.facilityId,
          labAreaId: input.labAreaId,
          workDate: input.workDate,
        };

        logger.info("login.submit.success", "Login session created", {
          username: input.username,
          facilityId: input.facilityId,
          labAreaId: input.labAreaId,
          sessionId,
        });

        return {
          status: "success",
          message: "Login successful",
          session,
        };
      } catch (error) {
        logger.error("login.submit.failure", "Login submit failed", {
          username: input.username,
          facilityId: input.facilityId,
          labAreaId: input.labAreaId,
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          status: "error",
          message: DATABASE_ERROR_MESSAGE,
          session: null,
        };
      }
    },

    async refreshSession(sessionToken: string): Promise<SessionState | null> {
      const refreshed = await deps.repository.refreshSession(sessionToken);
      if (!refreshed) {
        logger.warn(
          "login.refresh.expired",
          "Refresh session failed: token invalid or expired",
          {
            sessionToken,
          }
        );
        return null;
      }

      logger.info("login.refresh.success", "Session refreshed", {
        sessionToken,
        facilityId: refreshed.FACILITY_ID,
        labAreaId: refreshed.LAB_AREA_ID,
      });

      return mapSessionRowToState(refreshed);
    },
  };
}

export const loginService = createLoginService();

export const loadFacilities = (): Promise<FacilityOption[]> =>
  loginService.loadFacilities();

export const loadLabAreas = (facilityId: string): Promise<LabAreaOption[]> =>
  loginService.loadLabAreas(facilityId);

export const submitLogin = (input: LoginServiceInput): Promise<LoginServiceResult> =>
  loginService.submitLogin(input);

export const refreshSession = (sessionToken: string): Promise<SessionState | null> =>
  loginService.refreshSession(sessionToken);

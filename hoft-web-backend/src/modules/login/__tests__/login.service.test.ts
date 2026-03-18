import assert from "node:assert/strict";
import test from "node:test";

import { createLoginService } from "../login.service";
import type {
  FacilityRow,
  LoginRepositoryPort,
  SessionDbRow,
  UserAccountDbRow,
} from "../login.repository";

function buildRepo(overrides: Partial<LoginRepositoryPort> = {}): LoginRepositoryPort {
  return {
    loadFacilities: async (): Promise<FacilityRow[]> => [],
    loadLabAreas: async (): Promise<FacilityRow[]> => [],
    findUserByUsername: async (): Promise<UserAccountDbRow | null> => null,
    incrementFailedAttempts: async (): Promise<void> => undefined,
    hasScopeAccess: async (): Promise<boolean> => false,
    logSubmitError: async (): Promise<void> => undefined,
    submitLoginTransactionViaProcedure: async (): Promise<string> => "",
    refreshSession: async (): Promise<SessionDbRow | null> => null,
    ...overrides,
  };
}

test("createLoginService uses dependency injection for successful login path", async () => {
  const fixedNow = new Date("2026-03-18T10:00:00.000Z");
  let submitProcCalled = false;

  const service = createLoginService({
    repository: buildRepo({
      findUserByUsername: async () => ({
        ID: "u1",
        PASSWORD_HASH: "hash",
        IS_ACTIVE: "Y",
        FAILED_ATTEMPTS: 0,
      }),
      hasScopeAccess: async () => true,
      submitLoginTransactionViaProcedure: async (input) => {
        submitProcCalled = true;
        assert.equal(input.sessionToken, "token-fixed");
        assert.equal(input.workDate, "2026-03-18");
        return "session-1";
      },
    }),
    passwordVerifier: async () => true,
    tokenFactory: () => "token-fixed",
    nowFactory: () => fixedNow,
  });

  const result = await service.submitLogin({
    username: "demo",
    password: "secret",
    facilityId: "f1",
    labAreaId: "l1",
    workDate: "2026-03-18",
  });

  assert.equal(submitProcCalled, true);
  assert.equal(result.status, "success");
  assert.equal(result.session?.sessionToken, "token-fixed");
  assert.equal(result.session?.issuedAt, fixedNow.toISOString());
});

test("createLoginService increments failed attempts for invalid password", async () => {
  let failedAttemptCount = 0;
  let loggedErrorCode = "";

  const service = createLoginService({
    repository: buildRepo({
      findUserByUsername: async () => ({
        ID: "u2",
        PASSWORD_HASH: "hash",
        IS_ACTIVE: "Y",
        FAILED_ATTEMPTS: 0,
      }),
      incrementFailedAttempts: async () => {
        failedAttemptCount += 1;
      },
      logSubmitError: async (_username, _facilityId, _labAreaId, errorCode) => {
        loggedErrorCode = errorCode;
      },
    }),
    passwordVerifier: async () => false,
    tokenFactory: () => "unused",
    nowFactory: () => new Date("2026-03-18T00:00:00.000Z"),
  });

  const result = await service.submitLogin({
    username: "demo",
    password: "wrong",
    facilityId: "f1",
    labAreaId: "l1",
    workDate: "2026-03-18",
  });

  assert.equal(result.status, "error");
  assert.equal(failedAttemptCount, 1);
  assert.equal(loggedErrorCode, "INVALID_PASSWORD");
});

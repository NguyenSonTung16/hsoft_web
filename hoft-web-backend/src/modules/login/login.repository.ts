import oracledb from "oracledb";

import { getConnection } from "../../database/oracle";

export interface FacilityRow {
  ID: string;
  CODE: string;
  NAME: string;
}

export interface UserAccountDbRow {
  ID: string;
  PASSWORD_HASH: string;
  IS_ACTIVE: string;
  FAILED_ATTEMPTS: number;
}

export interface SessionDbRow {
  SESSION_TOKEN: string;
  FACILITY_ID: string;
  LAB_AREA_ID: string;
  WORK_DATE: Date | string;
  ISSUED_AT: Date | string;
  EXPIRES_AT: Date | string;
}

export class LoginRepository {
  async loadFacilities(): Promise<FacilityRow[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();
      const result = await connection.execute<FacilityRow>(
        `
          SELECT ID, CODE, NAME
          FROM LIS_FACILITY
          WHERE IS_ACTIVE = 'Y'
          ORDER BY NAME
        `,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return (result.rows as FacilityRow[] | undefined) ?? [];
    } finally {
      await connection?.close();
    }
  }

  async loadLabAreas(facilityId: string): Promise<FacilityRow[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();
      const result = await connection.execute<FacilityRow>(
        `
          SELECT ID, CODE, NAME
          FROM LIS_LAB_AREA
          WHERE FACILITY_ID = :facilityId
            AND IS_ACTIVE = 'Y'
          ORDER BY NAME
        `,
        { facilityId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return (result.rows as FacilityRow[] | undefined) ?? [];
    } finally {
      await connection?.close();
    }
  }

  async findUserByUsername(username: string): Promise<UserAccountDbRow | null> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();
      const result = await connection.execute<UserAccountDbRow>(
        `
          SELECT ID, PASSWORD_HASH, IS_ACTIVE, NVL(FAILED_ATTEMPTS, 0) AS FAILED_ATTEMPTS
          FROM LIS_USER_ACCOUNT
          WHERE USERNAME = :username
        `,
        { username },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return ((result.rows as UserAccountDbRow[] | undefined)?.[0] ?? null);
    } finally {
      await connection?.close();
    }
  }

  async incrementFailedAttempts(userId: string): Promise<void> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();
      await connection.execute(
        `
          UPDATE LIS_USER_ACCOUNT
          SET
            FAILED_ATTEMPTS = NVL(FAILED_ATTEMPTS, 0) + 1,
            IS_ACTIVE = CASE
              WHEN NVL(FAILED_ATTEMPTS, 0) + 1 >= 5 THEN 'N'
              ELSE IS_ACTIVE
            END
          WHERE ID = :userId
        `,
        { userId },
        { autoCommit: true }
      );
    } finally {
      await connection?.close();
    }
  }

  async hasScopeAccess(
    userId: string,
    facilityId: string,
    labAreaId: string
  ): Promise<boolean> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();
      const result = await connection.execute<{ SCOPE_COUNT: number }>(
        `
          SELECT COUNT(*) AS SCOPE_COUNT
          FROM LIS_USER_SCOPE
          WHERE USER_ID = :userId
            AND FACILITY_ID = :facilityId
            AND LAB_AREA_ID = :labAreaId
            AND IS_ACTIVE = 'Y'
        `,
        { userId, facilityId, labAreaId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const row = ((result.rows as { SCOPE_COUNT: number }[] | undefined)?.[0] ?? {
        SCOPE_COUNT: 0,
      });

      return Number(row.SCOPE_COUNT ?? 0) > 0;
    } finally {
      await connection?.close();
    }
  }

  async logSubmitError(
    username: string,
    facilityId: string,
    labAreaId: string,
    errorCode: string
  ): Promise<void> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();
      await connection.execute(
        `
          INSERT INTO LIS_LOGIN_ATTEMPT_LOG (
            EVENT_TYPE,
            USERNAME,
            FACILITY_ID,
            LAB_AREA_ID,
            ERROR_CODE,
            OCCURRED_AT
          ) VALUES (
            'submit_error',
            :username,
            :facilityId,
            :labAreaId,
            :errorCode,
            SYSTIMESTAMP
          )
        `,
        { username, facilityId, labAreaId, errorCode },
        { autoCommit: true }
      );
    } finally {
      await connection?.close();
    }
  }

  async submitLoginTransactionViaProcedure(input: {
    sessionToken: string;
    userId: string;
    facilityId: string;
    labAreaId: string;
    workDate: string;
    username: string;
    issuedAt: Date;
    expiresAt: Date;
  }): Promise<string> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();
      const result = await connection.execute(
        `
          BEGIN
            pkg_xetnghiem.LIS_SUBMIT_LOGIN_TXN(
              :sessionToken,
              :userId,
              :facilityId,
              :labAreaId,
              :workDate,
              :username,
              :issuedAt,
              :expiresAt,
              :sessionId
            );
          END;
        `,
        {
          sessionToken: input.sessionToken,
          userId: input.userId,
          facilityId: input.facilityId,
          labAreaId: input.labAreaId,
          workDate: input.workDate,
          username: input.username,
          issuedAt: input.issuedAt,
          expiresAt: input.expiresAt,
          sessionId: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 64,
          },
        },
        { autoCommit: true }
      );

      const outBinds = result.outBinds as { sessionId?: string } | undefined;
      return outBinds?.sessionId ?? "";
    } finally {
      await connection?.close();
    }
  }

  async refreshSession(sessionToken: string): Promise<SessionDbRow | null> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();

      const updateResult = await connection.execute(
        `
          UPDATE LIS_SESSION
          SET EXPIRES_AT = SYSTIMESTAMP + INTERVAL '7' DAY
          WHERE SESSION_TOKEN = :sessionToken
            AND STATUS = 'success'
            AND EXPIRES_AT > SYSTIMESTAMP
        `,
        { sessionToken },
        { autoCommit: true }
      );

      if ((updateResult.rowsAffected ?? 0) < 1) {
        return null;
      }

      const refreshed = await connection.execute<SessionDbRow>(
        `
          SELECT
            SESSION_TOKEN,
            FACILITY_ID,
            LAB_AREA_ID,
            WORK_DATE,
            ISSUED_AT,
            EXPIRES_AT
          FROM LIS_SESSION
          WHERE SESSION_TOKEN = :sessionToken
        `,
        { sessionToken },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return (refreshed.rows as SessionDbRow[] | undefined)?.[0] ?? null;
    } finally {
      await connection?.close();
    }
  }
}

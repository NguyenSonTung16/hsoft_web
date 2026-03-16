import oracledb from "oracledb";

import { getConnection } from "./oracle";

interface SessionContextRow {
  ID: string;
  USER_ID: string;
  FACILITY_ID: string;
  LAB_AREA_ID: string;
}

interface RoleCodeRow {
  CODE: string;
}

export interface GraphQLAuthContext {
  sessionToken?: string;
  sessionId?: string;
  userId?: string;
  roleCodes: string[];
  facilityScope?: {
    facilityId: string;
    labAreaId: string;
  };
}

export interface AuthContextDataAccess {
  resolveServerAuthContext(sessionToken?: string): Promise<GraphQLAuthContext>;
}

export class OracleAuthContextAdapter implements AuthContextDataAccess {
  async resolveServerAuthContext(
    sessionToken?: string
  ): Promise<GraphQLAuthContext> {
    if (!sessionToken) {
      return { roleCodes: [] };
    }

    let connection: oracledb.Connection | undefined;
    try {
      connection = await getConnection();

      const sessionResult = await connection.execute<SessionContextRow>(
        `
          SELECT ID, USER_ID, FACILITY_ID, LAB_AREA_ID
          FROM LIS_SESSION
          WHERE SESSION_TOKEN = :sessionToken
            AND STATUS = 'success'
            AND EXPIRES_AT > SYSTIMESTAMP
        `,
        { sessionToken },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const sessionRow =
        (sessionResult.rows as SessionContextRow[] | undefined)?.[0] ?? null;

      if (!sessionRow) {
        return { roleCodes: [] };
      }

      const roleResult = await connection.execute<RoleCodeRow>(
        `
          SELECT LOWER(R.CODE) AS CODE
          FROM LIS_USER_ROLE UR
          JOIN LIS_ROLE R ON R.ID = UR.ROLE_ID
          WHERE UR.USER_ID = :userId
            AND R.IS_ACTIVE = 'Y'
        `,
        { userId: sessionRow.USER_ID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const roleCodes = ((roleResult.rows as RoleCodeRow[] | undefined) ?? []).map(
        (row) => row.CODE
      );

      return {
        sessionToken,
        sessionId: sessionRow.ID,
        userId: sessionRow.USER_ID,
        roleCodes,
        facilityScope: {
          facilityId: sessionRow.FACILITY_ID,
          labAreaId: sessionRow.LAB_AREA_ID,
        },
      };
    } finally {
      await connection?.close();
    }
  }
}

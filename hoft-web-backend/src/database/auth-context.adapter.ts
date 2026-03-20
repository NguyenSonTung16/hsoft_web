import oracledb from "oracledb";

import { getConnection } from "./oracle";

interface SessionContextRow {
  ID: string;
  USER_ID: string;
  FACILITY_ID: string;
  LAB_AREA_ID: string;
  FACILITY_NAME: string;
  LAB_AREA_NAME: string;
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
    facilityName?: string;
    labAreaName?: string;
  };
}

export interface MainScreenResolvedContext extends GraphQLAuthContext {
  isContextValid: boolean;
  invalidReason?: string;
}

export interface AuthContextDataAccess {
  resolveServerAuthContext(sessionToken?: string): Promise<GraphQLAuthContext>;
  resolveMainScreenContext(sessionToken?: string): Promise<MainScreenResolvedContext>;
}

export class OracleAuthContextAdapter implements AuthContextDataAccess {
  async resolveMainScreenContext(
    sessionToken?: string
  ): Promise<MainScreenResolvedContext> {
    if (!sessionToken) {
      return {
        roleCodes: [],
        isContextValid: false,
        invalidReason: "Missing session token",
      };
    }

    let connection: oracledb.Connection | undefined;
    try {
      connection = await getConnection();

      const sessionResult = await connection.execute<SessionContextRow>(
        `
          SELECT
            S.ID,
            S.USER_ID,
            S.FACILITY_ID,
            S.LAB_AREA_ID,
            F.NAME AS FACILITY_NAME,
            A.NAME AS LAB_AREA_NAME
          FROM LIS_SESSION S
          JOIN LIS_FACILITY F ON F.ID = S.FACILITY_ID AND F.IS_ACTIVE = 'Y'
          JOIN LIS_LAB_AREA A ON A.ID = S.LAB_AREA_ID AND A.IS_ACTIVE = 'Y'
          WHERE S.SESSION_TOKEN = :sessionToken
            AND S.STATUS = 'success'
            AND S.EXPIRES_AT > SYSTIMESTAMP
        `,
        { sessionToken },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const sessionRow =
        (sessionResult.rows as SessionContextRow[] | undefined)?.[0] ?? null;

      if (!sessionRow) {
        return {
          roleCodes: [],
          isContextValid: false,
          invalidReason: "Selected facility/lab context is invalid. Please login again.",
        };
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
          facilityName: sessionRow.FACILITY_NAME,
          labAreaName: sessionRow.LAB_AREA_NAME,
        },
        isContextValid: true,
      };
    } finally {
      await connection?.close();
    }
  }

  async resolveServerAuthContext(
    sessionToken?: string
  ): Promise<GraphQLAuthContext> {
    const resolved = await this.resolveMainScreenContext(sessionToken);
    if (!resolved.isContextValid) {
      return { roleCodes: [] };
    }

    return {
      sessionToken: resolved.sessionToken,
      sessionId: resolved.sessionId,
      userId: resolved.userId,
      roleCodes: resolved.roleCodes,
      facilityScope: resolved.facilityScope,
    };
  }
}

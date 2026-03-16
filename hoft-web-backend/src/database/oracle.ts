import oracledb from "oracledb";

export async function getConnection() {
  const user = process.env.ORACLE_USER?.trim();
  const password = process.env.ORACLE_PASSWORD?.trim();
  const connectString =
    process.env.ORACLE_CONNECT?.trim() ||
    process.env.ORACLE_CONNECT_STRING?.trim() ||
    process.env.DB_CONNECT_STRING?.trim();

  if (!user || !password || !connectString) {
    throw new Error(
      "Missing Oracle environment variables. Required: ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECT (or ORACLE_CONNECT_STRING)."
    );
  }

  return await oracledb.getConnection({
    user,
    password,
    connectString
  });
}
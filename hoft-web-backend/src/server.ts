import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupApolloGraphQL } from './graphql';
import { getConnection } from './database/oracle';

dotenv.config();

const app = express();
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
  'ionic://localhost',
  'http://10.0.2.2:5173',
  'http://10.0.2.2',
  'https://10.0.2.2',
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      // Accept localhost origins used by WebView and local development.
      if (/^(https?:\/\/|capacitor:\/\/|ionic:\/\/)localhost(?::\d+)?$/i.test(origin)) {
        callback(null, true);
        return;
      }

      if (/^https?:\/\/10\.0\.2\.2(?::\d+)?$/i.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
const PORT = process.env.PORT || 3000;

app.use(express.json());

(async () => {
  // Quick check to confirm which Oracle user/schema this backend is connected to.
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute<{ USER: string }>('SELECT USER FROM dual');
    const firstRow = result.rows?.[0] as unknown;
    const dbUser =
      (typeof firstRow === 'object' && firstRow !== null && 'USER' in firstRow
        ? (firstRow as { USER?: string }).USER
        : Array.isArray(firstRow)
          ? (firstRow[0] as string | undefined)
          : undefined) ?? 'UNKNOWN_USER';
  } catch (error) {
    console.error('Oracle connection check failed (SELECT USER FROM dual):', error);
  } finally {
    await connection?.close();
  }

  await setupApolloGraphQL(app);
})();

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

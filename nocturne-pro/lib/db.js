import { Pool } from "pg";

const globalForPg = globalThis;
export const pool = globalForPg.pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});
if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

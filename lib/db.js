import { Pool } from 'pg';
const g = globalThis;
export const pool = g.__pgPool ?? (g.__pgPool = new Pool({ connectionString: process.env.DATABASE_URL }));
export async function query(text, params = []) {
  const r = await pool.query(text, params);
  return r.rows;
}
export async function withTx(fn) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const r = await fn((t, p = []) => c.query(t, p).then((x) => x.rows));
    await c.query('COMMIT');
    return r;
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}

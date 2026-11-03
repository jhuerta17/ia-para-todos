import assert from 'node:assert/strict';
import { NetlifyDB } from '@netlify/database-dev';
import { getDatabase } from '@netlify/database';
import { fileURLToPath } from 'node:url';
const local = new NetlifyDB({ logger: () => {} });
let pool;
try {
  const url = await local.start();
  await local.applyMigrations(fileURLToPath(new URL('../netlify/database/migrations', import.meta.url)));
  pool = getDatabase({ connectionString: url }).pool;
  await pool.query("INSERT INTO portal_profiles(user_id) VALUES ('fixture-A'),('fixture-B')");
  await pool.query("INSERT INTO portal_enrollments(user_id,course_id) VALUES ('fixture-A','first-prompt')");
  await assert.rejects(pool.query("INSERT INTO portal_lesson_progress(user_id,course_id,lesson_id) VALUES ('fixture-B','first-prompt','clear-request')"));
  await pool.query("INSERT INTO portal_lesson_progress(user_id,course_id,lesson_id) VALUES ('fixture-A','first-prompt','clear-request')");
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM portal_lesson_progress')).rows[0].n, 1);
  console.log('verify:portal:db: migrations and enrollment ownership constraints passed');
} finally { await pool?.end(); await local.stop(); }

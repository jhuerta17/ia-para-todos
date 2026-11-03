import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createPortalPool } from '../../netlify/lib/portal-db.mts';

/** Versioned migrations for standalone PostgreSQL. Never print connection strings. */
export async function migratePortal({ connectionString, directory, dryRun = false }) {
  const url=new URL(connectionString);
  if (url.hostname.includes('-pooler.')) throw new Error('Migrations require the direct, unpooled database URL');
  const files=(await readdir(directory)).filter(file=>/^\d+_[a-z0-9_-]+\.sql$/.test(file)).sort();
  const migrations=await Promise.all(files.map(async name=>{
    const sql=await readFile(join(directory,name),'utf8');
    return {name,sql,checksum:createHash('sha256').update(sql).digest('hex')};
  }));
  const pool=createPortalPool(connectionString,1);
  const db=await pool.connect();
  let locked=false;
  try {
    await db.query('SELECT pg_advisory_lock(1810003)');locked=true;
    await db.query('CREATE TABLE IF NOT EXISTS portal_schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const applied=(await db.query('SELECT name,checksum FROM portal_schema_migrations ORDER BY name')).rows;
    for (const row of applied) {
      const migration=migrations.find(item=>item.name===row.name);
      if (!migration||migration.checksum!==row.checksum) throw new Error(`Applied migration missing or changed: ${row.name}`);
    }
    const pending=migrations.filter(item=>!applied.some(row=>row.name===item.name));
    if (pending.some(item=>applied.length&&item.name<=applied.at(-1).name)) throw new Error('Out-of-order migration detected');
    if (!dryRun) for (const migration of pending) {
      await db.query('BEGIN');
      try {
        await db.query(migration.sql);
        await db.query('INSERT INTO portal_schema_migrations(name,checksum) VALUES($1,$2)',[migration.name,migration.checksum]);
        await db.query('COMMIT');
      } catch(error) {await db.query('ROLLBACK');throw error;}
    }
    return pending.map(item=>item.name);
  } finally {
    if(locked)await db.query('SELECT pg_advisory_unlock(1810003)');
    db.release();await pool.end();
  }
}

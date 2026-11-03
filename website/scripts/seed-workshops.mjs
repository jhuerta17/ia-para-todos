// Fictional workshop seed for staging/local review. Inserts the same
// six-month story as demo mode: six past sessions plus five upcoming
// sessions with partial fictional bookings. Every person is fictional;
// contacts use @example.com and 555 numbers only, enforced below.
//
// Usage (staging direct URL, never production):
//   WORKSHOP_SEED_DATABASE_URL=<staging-direct-url> npm run db:seed:workshops -- --confirm
//
// Idempotent: fixed session ids are inserted once, and sessions that
// already hold reservations are skipped. Prints counts only, never contacts.
import { randomBytes, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { migratePortal } from './lib/portal-migrations.mjs';
import { createPortalPool } from '../netlify/lib/portal-db.mts';
import { DEMO_SESSION_DEFS, demoHistory, demoSessions, demoStudents } from '../src/app/workshops/workshop-demo.ts';

const scripts = dirname(fileURLToPath(import.meta.url));
const fictionalContact = (contact) => contact.endsWith('@example.com') || /^\(555\) \d{3}-\d{4}$/.test(contact);

async function main() {
  const url = process.env.WORKSHOP_SEED_DATABASE_URL;
  if (!url) {
    console.error('Set WORKSHOP_SEED_DATABASE_URL to a staging/local direct URL. Never seed production.');
    process.exit(1);
  }
  if (!process.argv.includes('--confirm')) {
    console.error('Refusing to seed without --confirm. Double-check the target is staging, then re-run with --confirm.');
    process.exit(1);
  }
  let host = '(unparseable url)';
  try { host = new URL(url).host; } catch { /* redacted below */ }
  console.log(`Seeding fictional workshops on ${host} ...`);

  await migratePortal({ connectionString: url, directory: join(scripts, '..', 'db', 'migrations') });
  const pool = createPortalPool(url, 5);
  const now = Date.now();
  const sessions = [...demoHistory(now), ...demoSessions(now)];
  const students = demoStudents();
  if (!students.every((student) => fictionalContact(student.contact))) throw new Error('seed contacts must stay fictional');
  const byId = new Map(sessions.map((session) => [session.id, session]));
  let insertedSessions = 0, skippedSessions = 0, insertedReservations = 0;

  try {
    for (const [index, def] of DEMO_SESSION_DEFS.entries()) {
      const session = byId.get(def.id);
      // Fixed synthetic ids (d000…): clearly fake, stable across re-runs.
      const uuid = `d0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
      const inserted = await pool.query(
        `INSERT INTO workshop_sessions(id,topic,title_es,title_en,language,starts_at,ends_at,time_zone,venue,address,
          accessibility_es,accessibility_en,bring_es,bring_en,capacity,status,total_reservations)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'published',$16)
         ON CONFLICT(id) DO NOTHING RETURNING id`,
        [uuid, session.topic, session.titleEs, session.titleEn, session.language, session.startsAt, session.endsAt,
          session.timeZone, session.venue, session.address, session.accessibilityEs, session.accessibilityEn,
          session.bringEs, session.bringEn, session.capacity, def.booked]);
      if (inserted.rows.length) insertedSessions++; else skippedSessions++;
      // Reservations older than the 30-day retention window are denied on
      // reads and purged by maintenance, so only retained sessions keep
      // rows; older sessions keep their anonymous totals above.
      const retained = Date.parse(session.endsAt) > now - 30 * 86_400_000;
      if (!retained) continue;
      const existing = Number((await pool.query('SELECT count(*)::int AS n FROM workshop_reservations WHERE session_id=$1', [uuid])).rows[0].n);
      const past = Date.parse(session.startsAt) <= now;
      const windowStart = past ? Date.parse(session.startsAt) - 21 * 86_400_000 : now - 14 * 86_400_000;
      const windowEnd = past ? Date.parse(session.startsAt) - 86_400_000 : now - 3_600_000;
      // Top-up only: re-runs finish an interrupted seed without duplicates.
      for (let i = existing; i < def.booked; i++) {
        const student = students[(index * 7 + i) % students.length];
        const createdAt = new Date(windowStart + ((windowEnd - windowStart) * (i + 1)) / (def.booked + 1)).toISOString();
        const cancelled = i % 12 === 11;
        const followUpNeeded = past ? i % 5 === 4 : i % 10 < 7;
        const cancelledAt = cancelled
          ? new Date(Math.min(Date.parse(createdAt) + 2 * 86_400_000, past ? Date.parse(session.startsAt) - 86_400_000 : now)).toISOString()
          : null;
        await pool.query(
          `INSERT INTO workshop_reservations(id,session_id,token_hash,request_hash,name,contact,contact_type,status,
            follow_up_needed,created_at,cancelled_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [randomUUID(), uuid, randomBytes(32).toString('hex'), randomBytes(32).toString('hex'), student.name,
            student.contact, student.contactType, cancelled ? 'cancelled' : 'confirmed', followUpNeeded, createdAt,
            cancelledAt]);
        insertedReservations++;
      }
    }
  } finally {
    await pool.end();
  }
  console.log(`seed:workshops: ${insertedSessions} sessions inserted, ${skippedSessions} already present, ${insertedReservations} fictional reservations inserted.`);
}

await main();

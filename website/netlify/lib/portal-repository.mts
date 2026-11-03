import { createHmac, randomUUID } from 'node:crypto';
import { HttpError, env } from './ai-security.mts';
import { transaction, type PortalPool, type Queryable } from './portal-db.mts';

export const PRIVACY_VERSION = '2026-11-03-meta-contributor-v1';
export interface Student { id: string; email?: string; confirmedAt?: string; roles?: string[] }
export function emailHash(email: string): string {
  const secret = env('PORTAL_EMAIL_HASH_SECRET');
  if (secret.length < 32) throw new HttpError(503, 'signup_unavailable');
  return createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('hex');
}
export async function reserveAdmission(db: Queryable, hash: string, userId?: string, confirmed = false): Promise<void> {
  await db.query('SELECT pg_advisory_xact_lock(1810001)');
  await db.query('DELETE FROM portal_admissions WHERE NOT confirmed AND expires_at <= now()');
  const existing = (await db.query('SELECT * FROM portal_admissions WHERE email_hash=$1 OR user_id=$2', [hash, userId ?? null])).rows[0];
  if (!existing) {
    const count = Number((await db.query('SELECT count(*) AS n FROM portal_admissions')).rows[0].n);
    if (count >= 25) throw new HttpError(409, 'pilot_full');
  }
  await db.query(`INSERT INTO portal_admissions(email_hash,user_id,expires_at,confirmed) VALUES($1,$2,now()+interval '24 hours',$3)
    ON CONFLICT(email_hash) DO UPDATE SET user_id=COALESCE(EXCLUDED.user_id,portal_admissions.user_id),
    confirmed=portal_admissions.confirmed OR EXCLUDED.confirmed, expires_at=CASE WHEN portal_admissions.confirmed OR EXCLUDED.confirmed THEN NULL ELSE EXCLUDED.expires_at END`,
  [existing?.email_hash ?? hash, userId ?? null, confirmed]);
}
export async function ensureProfile(db: Queryable, user: Student, consentRequired = true): Promise<Record<string, any>> {
  if (!user.confirmedAt) throw new HttpError(403, 'email_confirmation_required');
  await db.query('INSERT INTO portal_profiles(user_id) VALUES($1) ON CONFLICT DO NOTHING', [user.id]);
  const profile = (await db.query('SELECT * FROM portal_profiles WHERE user_id=$1 FOR UPDATE', [user.id])).rows[0];
  if (profile.state !== 'active') throw new HttpError(403, 'account_deleting');
  if (consentRequired && (!profile.adult_attested_at || profile.privacy_version !== PRIVACY_VERSION)) throw new HttpError(428, 'consent_required');
  return profile;
}
export const chatView = (row: Record<string, any>) => ({ id: row.id, title: row.title, createdAt: new Date(row.created_at).toISOString(), expiresAt: new Date(row.expires_at).toISOString() });
export const messageView = (row: Record<string, any>) => ({ role: row.role, content: row.content, demo: row.demo });
export async function recoverInterrupted(db: Queryable, userId: string, chatId: string): Promise<void> {
  const stale = (await db.query("UPDATE portal_requests SET state='done',demo=true,reason='request_interrupted' WHERE user_id=$1 AND chat_id=$2 AND state='pending' AND created_at<now()-interval '2 minutes' RETURNING id",[userId,chatId])).rows;
  for (const row of stale) await db.query("INSERT INTO portal_messages(user_id,chat_id,request_id,role,content,demo) VALUES($1,$2,$3,'assistant',$4,true) ON CONFLICT DO NOTHING",[userId,chatId,row.id,'Sample reply / Respuesta de ejemplo: include task, context, and format. Incluye tarea, contexto y formato.']);
}
export class PortalRepository {
  readonly pool: PortalPool;
  constructor(pool: PortalPool) { this.pool = pool; }
  async profile(user: Student) {
    return transaction(this.pool, async db => {
      const profile = await ensureProfile(db, user, false);
      return { consented: !!profile.adult_attested_at && profile.privacy_version === PRIVACY_VERSION, privacyVersion: PRIVACY_VERSION };
    });
  }
  async consent(user: Student) {
    return transaction(this.pool, async db => {
      await ensureProfile(db, user, false);
      if (!user.roles?.includes('admin')) {
        if (!user.email) throw new HttpError(403, 'email_required');
        await reserveAdmission(db, emailHash(user.email), user.id, true);
      }
      await db.query('UPDATE portal_profiles SET adult_attested_at=now(),privacy_version=$2 WHERE user_id=$1', [user.id, PRIVACY_VERSION]);
      return { consented: true, privacyVersion: PRIVACY_VERSION };
    });
  }
  async progress(user: Student, action: 'read' | 'enroll' | 'complete', lesson?: string) {
    return transaction(this.pool, async db => {
      await ensureProfile(db, user);
      if (action === 'enroll') await db.query("INSERT INTO portal_enrollments(user_id,course_id) VALUES($1,'first-prompt') ON CONFLICT DO NOTHING", [user.id]);
      const enrolled = (await db.query("SELECT 1 FROM portal_enrollments WHERE user_id=$1 AND course_id='first-prompt'", [user.id])).rows.length > 0;
      if (action === 'complete') {
        if (!enrolled) throw new HttpError(409, 'not_enrolled');
        await db.query("INSERT INTO portal_lesson_progress(user_id,course_id,lesson_id) VALUES($1,'first-prompt',$2) ON CONFLICT DO NOTHING", [user.id, lesson]);
      }
      const rows = (await db.query("SELECT lesson_id FROM portal_lesson_progress WHERE user_id=$1 AND course_id='first-prompt' ORDER BY lesson_id", [user.id])).rows;
      return { enrolled, completed: rows.map(row => row.lesson_id) };
    });
  }
  async chats(user: Student) {
    return transaction(this.pool, async db => {
      await ensureProfile(db, user);
      return (await db.query('SELECT * FROM portal_chats WHERE user_id=$1 AND expires_at>now() ORDER BY created_at DESC,id LIMIT 50', [user.id])).rows.map(chatView);
    });
  }
  async createChat(user: Student) {
    return transaction(this.pool, async db => {
      await ensureProfile(db, user);
      await db.query('SELECT user_id FROM portal_profiles WHERE user_id=$1 FOR UPDATE', [user.id]);
      if (Number((await db.query('SELECT count(*) AS n FROM portal_chats WHERE user_id=$1 AND expires_at>now()', [user.id])).rows[0].n) >= 50) throw new HttpError(409, 'chat_limit');
      return chatView((await db.query('INSERT INTO portal_chats(id,user_id) VALUES($1,$2) RETURNING *', [randomUUID(), user.id])).rows[0]);
    });
  }
  async chat(user: Student, id: string, remove = false) {
    return transaction(this.pool, async db => {
      await ensureProfile(db, user);
      const row = (await db.query('SELECT * FROM portal_chats WHERE id=$1 AND user_id=$2 AND expires_at>now() FOR UPDATE', [id, user.id])).rows[0];
      if (!row) throw new HttpError(404, 'not_found');
      if (remove) { await db.query('DELETE FROM portal_chats WHERE id=$1 AND user_id=$2', [id, user.id]); return { deleted: true }; }
      await recoverInterrupted(db,user.id,id);
      const messages = (await db.query('SELECT * FROM portal_messages WHERE chat_id=$1 AND user_id=$2 ORDER BY sequence LIMIT 200', [id, user.id])).rows.map(messageView);
      return { ...chatView(row), messages };
    });
  }
  async requestDeletion(user: Student) {
    if (user.roles?.includes('admin')) throw new HttpError(403, 'admin_account_requires_dashboard');
    return transaction(this.pool, async db => {
      await db.query("INSERT INTO portal_profiles(user_id,state) VALUES($1,'deleting') ON CONFLICT(user_id) DO UPDATE SET state='deleting'", [user.id]);
      await db.query('INSERT INTO portal_deletion_jobs(user_id) VALUES($1) ON CONFLICT DO NOTHING', [user.id]);
      await db.query('DELETE FROM portal_chats WHERE user_id=$1', [user.id]);
      await db.query('DELETE FROM portal_enrollments WHERE user_id=$1', [user.id]);
      await db.query('DELETE FROM portal_daily_usage WHERE user_id=$1', [user.id]);
      return { deleting: true };
    });
  }
  async purge() {
    // Use the same chat -> request lock order as reads/generation.
    const stale = (await this.pool.query("SELECT DISTINCT user_id,chat_id FROM portal_requests WHERE state='pending' AND created_at<now()-interval '2 minutes'")).rows;
    for (const row of stale) await transaction(this.pool,async db=>{
      await db.query('SELECT id FROM portal_chats WHERE id=$1 AND user_id=$2 FOR UPDATE',[row.chat_id,row.user_id]);
      await recoverInterrupted(db,row.user_id,row.chat_id);
    });
    await this.pool.query('DELETE FROM portal_chats WHERE expires_at<=now()');
    await this.pool.query("DELETE FROM portal_daily_usage WHERE day < (now() AT TIME ZONE 'UTC')::date - 32");
    await this.pool.query('DELETE FROM portal_admissions WHERE NOT confirmed AND expires_at<=now()');
  }
  async retryDeletions(deleteIdentity: (id: string) => Promise<void>) {
    const jobs = (await this.pool.query('SELECT user_id FROM portal_deletion_jobs WHERE completed_at IS NULL ORDER BY requested_at LIMIT 25')).rows;
    for (const job of jobs) {
      await this.pool.query('UPDATE portal_deletion_jobs SET attempts=attempts+1 WHERE user_id=$1', [job.user_id]);
      try { await deleteIdentity(job.user_id); } catch { continue; }
      await transaction(this.pool, async db => {
        await db.query('DELETE FROM portal_admissions WHERE user_id=$1', [job.user_id]);
        await db.query("UPDATE portal_profiles SET state='deleted',adult_attested_at=NULL,privacy_version=NULL WHERE user_id=$1", [job.user_id]);
        await db.query('UPDATE portal_deletion_jobs SET completed_at=now() WHERE user_id=$1', [job.user_id]);
      });
    }
  }
}

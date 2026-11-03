import { createHash, randomUUID } from 'node:crypto';
import { HttpError } from './ai-security.mts';
import { ensureProfile, type Student } from './portal-repository.mts';
import { transaction, type PortalPool, type Queryable } from './portal-db.mts';
import { TOPICS, type WorkshopSession, type BookingInput, type Reservation } from '../../src/app/workshops/workshop-types.ts';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export const validToken = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const uuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const text = (v: unknown, max = 500): string => {
  if (typeof v !== 'string' || !v.trim() || v.trim().length > max || /[\u0000-\u001f]/.test(v)) throw new HttpError(400,'invalid_fields');
  return v.trim();
};
export function sessionInput(b: Record<string, unknown>) {
  const startsAt = text(b['startsAt'],40), endsAt = text(b['endsAt'],40), timeZone = text(b['timeZone'],80);
  // Require explicit offsets; browser-local dates must never become venue times silently.
  if (![startsAt,endsAt].every(v => /T.*(?:Z|[+-]\d\d:\d\d)$/.test(v) && Number.isFinite(Date.parse(v))) || Date.parse(endsAt) <= Date.parse(startsAt)) throw new HttpError(400,'invalid_dates');
  try { new Intl.DateTimeFormat('en',{timeZone}).format(); } catch { throw new HttpError(400,'invalid_timezone'); }
  if (!TOPICS.includes(b['topic'] as any) || !['es','en'].includes(b['language'] as string) || !['draft','published','cancelled'].includes(b['status'] as string) || !Number.isInteger(b['capacity']) || Number(b['capacity']) < 1 || Number(b['capacity']) > 500) throw new HttpError(400,'invalid_fields');
  return { topic:b['topic'],titleEs:text(b['titleEs'],150),titleEn:text(b['titleEn'],150),language:b['language'],startsAt,endsAt,timeZone,venue:text(b['venue'],200),address:text(b['address']),accessibilityEs:text(b['accessibilityEs']),accessibilityEn:text(b['accessibilityEn']),bringEs:text(b['bringEs']),bringEn:text(b['bringEn']),capacity:b['capacity'],status:b['status'] };
}
export function bookingInput(b: Record<string, unknown>): BookingInput {
  if (!uuid(b['sessionId']) || !validToken(b['token']) || b['adult'] !== true || b['privacy'] !== true || b['website']) throw new HttpError(400,'invalid_booking');
  const contactType = b['contactType'], contact = text(b['contact'],200), name = text(b['name'],100);
  if (contactType === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) : contactType !== 'phone' || !/^[+()\d .-]{7,40}$/.test(contact) || contact.replace(/\D/g,'').length < 7) throw new HttpError(400,'invalid_contact');
  return {sessionId:b['sessionId'],token:b['token'],name,contact:contactType === 'email' ? contact.toLowerCase() : contact,contactType:contactType as 'email'|'phone',adult:true,privacy:true};
}
const availableSQL = `(SELECT count(*)::int FROM workshop_reservations r WHERE r.session_id=s.id AND r.status='confirmed')`;
const sessionView = (r: Record<string,any>): WorkshopSession => ({id:r.id,topic:r.topic,titleEs:r.title_es,titleEn:r.title_en,language:r.language,startsAt:new Date(r.starts_at).toISOString(),endsAt:new Date(r.ends_at).toISOString(),timeZone:r.time_zone,venue:r.venue,address:r.address,accessibilityEs:r.accessibility_es,accessibilityEn:r.accessibility_en,bringEs:r.bring_es,bringEn:r.bring_en,status:r.status,capacity:r.capacity,available:Math.max(0,r.capacity-Number(r.booked ?? 0))});
// Retention is enforced on reads immediately, even if scheduled deletion is delayed.
const retained = `LEAST(s.ends_at,COALESCE(s.cancelled_at,s.ends_at)) > now()-interval '30 days' AND (r.cancelled_at IS NULL OR r.cancelled_at > now()-interval '30 days')`;
export class WorkshopRepository {
  readonly pool: PortalPool;
  constructor(pool: PortalPool) { this.pool = pool; }
  async schedule(admin = false) {
    const rows = (await this.pool.query(`SELECT s.*,${availableSQL} AS booked FROM workshop_sessions s ${admin ? '' : "WHERE s.status='published' AND s.starts_at>now()"} ORDER BY s.starts_at,s.id`)).rows;
    return rows.map(r => ({...sessionView(r),...(admin ? {totalReservations:r.total_reservations} : {})}));
  }
  async save(b: Record<string,unknown>, id?: string) {
    if (id && !uuid(id)) throw new HttpError(404,'not_found');
    const v = sessionInput(b);
    return transaction(this.pool,async db => {
      const old = id ? (await db.query('SELECT * FROM workshop_sessions WHERE id=$1 FOR UPDATE',[id])).rows[0] : null;
      if (id && !old) throw new HttpError(404,'not_found');
      if (old?.status === 'cancelled' && v.status !== 'cancelled') throw new HttpError(409,'cancelled_session');
      const count = id ? Number((await db.query("SELECT count(*)::int AS n FROM workshop_reservations WHERE session_id=$1 AND status='confirmed'",[id])).rows[0].n) : 0;
      if (Number(v.capacity) < count) throw new HttpError(409,'capacity_below_bookings');
      if (old?.status === 'published' && v.status === 'draft' && count) throw new HttpError(409,'use_cancellation');
      if (v.status === 'published' && Date.parse(v.startsAt) <= Date.now()) throw new HttpError(400,'past_session');
      const sessionId = id ?? randomUUID();
      const values = [sessionId,...Object.values(v)];
      await db.query(`INSERT INTO workshop_sessions(id,topic,title_es,title_en,language,starts_at,ends_at,time_zone,venue,address,accessibility_es,accessibility_en,bring_es,bring_en,capacity,status)
        VALUES(${values.map((_,i)=>'$'+(i+1)).join(',')}) ON CONFLICT(id) DO UPDATE SET
        topic=EXCLUDED.topic,title_es=EXCLUDED.title_es,title_en=EXCLUDED.title_en,language=EXCLUDED.language,starts_at=EXCLUDED.starts_at,ends_at=EXCLUDED.ends_at,time_zone=EXCLUDED.time_zone,venue=EXCLUDED.venue,address=EXCLUDED.address,accessibility_es=EXCLUDED.accessibility_es,accessibility_en=EXCLUDED.accessibility_en,bring_es=EXCLUDED.bring_es,bring_en=EXCLUDED.bring_en,capacity=EXCLUDED.capacity,status=EXCLUDED.status,updated_at=now()`,values);
      if (v.status === 'cancelled') await db.query('UPDATE workshop_sessions SET cancelled_at=COALESCE(cancelled_at,now()) WHERE id=$1',[sessionId]);
      if (old) {
        const keys = ['topic','title_es','title_en','language','starts_at','ends_at','time_zone','venue','address','accessibility_es','accessibility_en','bring_es','bring_en','capacity','status'];
        const changed = keys.some((key,i) => ['starts_at','ends_at'].includes(key) ? new Date(old[key]).toISOString() !== new Date(Object.values(v)[i] as string).toISOString() : old[key] !== Object.values(v)[i]);
        if (changed) await db.query("UPDATE workshop_reservations SET follow_up_needed=true WHERE session_id=$1 AND status='confirmed'",[sessionId]);
      }
      return {id:sessionId};
    });
  }
  private async view(db: Queryable, condition: string, args: unknown[], admin = false): Promise<Reservation[]> {
    const rows = (await db.query(`SELECT r.*,row_to_json(s) AS session,${availableSQL} AS booked FROM workshop_reservations r JOIN workshop_sessions s ON s.id=r.session_id WHERE ${condition} AND ${retained} ORDER BY s.starts_at,r.created_at`,args)).rows;
    return rows.map(r => ({id:r.id,reference:r.id,status:r.status,linked:!!r.user_id,session:sessionView({...r.session,booked:r.booked}),...(admin ? {name:r.name,contact:r.contact,contactType:r.contact_type,followUpNeeded:r.follow_up_needed} : {})}));
  }
  async book(b: BookingInput, user: Student | null, assisted = false) {
    return transaction(this.pool,async db => {
      if (user && !assisted) await ensureProfile(db,user,false);
      // Lock the session before checking capacity: concurrent last-seat requests serialize.
      const s = (await db.query('SELECT * FROM workshop_sessions WHERE id=$1 FOR UPDATE',[b.sessionId])).rows[0];
      const tokenHash = hash(b.token), requestHash = hash(JSON.stringify({...b,token:undefined,user:assisted ? null : user?.id ?? null}));
      const replay = (await db.query('SELECT * FROM workshop_reservations WHERE token_hash=$1',[tokenHash])).rows[0];
      if (replay) {
        if (replay.request_hash !== requestHash) throw new HttpError(409,'booking_changed');
        const rows = await this.view(db,'r.id=$1',[replay.id]);
        if (!rows.length) throw new HttpError(404,'not_found');
        return rows[0];
      }
      if (!s || s.status !== 'published' || new Date(s.starts_at).getTime() <= Date.now()) throw new HttpError(409,'session_unavailable');
      const count = Number((await db.query("SELECT count(*)::int AS n FROM workshop_reservations WHERE session_id=$1 AND status='confirmed'",[b.sessionId])).rows[0].n);
      if (count >= s.capacity) throw new HttpError(409,'session_full');
      if (user && !assisted && (await db.query("SELECT id FROM workshop_reservations WHERE session_id=$1 AND user_id=$2 AND status='confirmed'",[b.sessionId,user.id])).rows.length) throw new HttpError(409,'already_reserved');
      const id = randomUUID();
      await db.query('INSERT INTO workshop_reservations(id,session_id,user_id,token_hash,request_hash,name,contact,contact_type) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,b.sessionId,assisted ? null : user?.id ?? null,tokenHash,requestHash,b.name,b.contact,b.contactType]);
      await db.query('UPDATE workshop_sessions SET total_reservations=total_reservations+1 WHERE id=$1',[b.sessionId]);
      return (await this.view(db,'r.id=$1',[id]))[0];
    });
  }
  async mine(user: Student) {
    return transaction(this.pool,async db => { await ensureProfile(db,user,false); return this.view(db,'r.user_id=$1',[user.id]); });
  }
  async cancelOwned(user: Student, id: string) {
    if (!uuid(id)) throw new HttpError(404,'not_found');
    return transaction(this.pool,async db => {
      await ensureProfile(db,user,false);
      const rows=await this.view(db,'r.id=$1 AND r.user_id=$2',[id,user.id]);
      if (!rows.length) throw new HttpError(404,'not_found');
      await db.query("UPDATE workshop_reservations SET status='cancelled',cancelled_at=COALESCE(cancelled_at,now()),follow_up_needed=true WHERE id=$1 AND user_id=$2",[id,user.id]);
      return {ok:true};
    });
  }
  async manage(token: string, action: string, user: Student | null) {
    if (!validToken(token) || !['read','cancel','attach'].includes(action)) throw new HttpError(404,'not_found');
    return transaction(this.pool,async db => {
      if (action === 'attach') { if (!user) throw new HttpError(401,'unauthorized'); await ensureProfile(db,user,false); }
      const rows = await this.view(db,'r.token_hash=$1',[hash(token)]);
      if (!rows.length) throw new HttpError(404,'not_found');
      const r = rows[0];
      const locked = (await db.query('SELECT * FROM workshop_reservations WHERE id=$1 FOR UPDATE',[r.id])).rows[0];
      if (!locked?.token_hash) throw new HttpError(404,'not_found');
      if (action === 'cancel') await db.query("UPDATE workshop_reservations SET status='cancelled',cancelled_at=COALESCE(cancelled_at,now()),follow_up_needed=true WHERE id=$1",[r.id]);
      if (action === 'attach') {
        if (locked.user_id && locked.user_id !== user!.id) throw new HttpError(409,'already_linked');
        if (locked.status !== 'confirmed') throw new HttpError(409,'reservation_cancelled');
        if ((await db.query("SELECT id FROM workshop_reservations WHERE session_id=$1 AND user_id=$2 AND status='confirmed' AND id<>$3",[locked.session_id,user!.id,r.id])).rows.length) throw new HttpError(409,'already_reserved');
        await db.query('UPDATE workshop_reservations SET user_id=$2 WHERE id=$1',[r.id,user!.id]);
      }
      return (await this.view(db,'r.id=$1',[r.id]))[0];
    });
  }
  async adminReservations(id: string) {
    if (!uuid(id)) throw new HttpError(404,'not_found');
    return this.view(this.pool,'r.session_id=$1',[id],true);
  }
  async adminAction(id: string, action: string) {
    if (!uuid(id) || !['cancel','contacted'].includes(action)) throw new HttpError(400,'invalid_action');
    const result = await this.pool.query(action === 'cancel'
      ? "UPDATE workshop_reservations r SET status='cancelled',cancelled_at=COALESCE(r.cancelled_at,now()),follow_up_needed=true FROM workshop_sessions s WHERE r.id=$1 AND s.id=r.session_id AND " + retained + ' RETURNING r.id'
      : 'UPDATE workshop_reservations r SET follow_up_needed=false FROM workshop_sessions s WHERE r.id=$1 AND s.id=r.session_id AND ' + retained + ' RETURNING r.id',[id]);
    if (!result.rows.length) throw new HttpError(404,'not_found');
    return {ok:true};
  }
  async preparation(user: Student, complete = false) {
    return transaction(this.pool,async db => {
      await ensureProfile(db,user,false);
      if (complete) await db.query('INSERT INTO workshop_preparation(user_id) VALUES($1) ON CONFLICT DO NOTHING',[user.id]);
      return {completed:(await db.query('SELECT 1 FROM workshop_preparation WHERE user_id=$1',[user.id])).rows.length > 0};
    });
  }
  async purge() {
    await this.pool.query(`DELETE FROM workshop_reservations r USING workshop_sessions s WHERE s.id=r.session_id AND NOT (${retained})`);
  }
}

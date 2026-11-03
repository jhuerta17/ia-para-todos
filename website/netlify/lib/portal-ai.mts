import { createHash } from 'node:crypto';
import type { Context } from '@netlify/functions';
import { HttpError, json, readJSON, env, MODELS, OUTPUT_TOKEN_CAP, REASONING_EFFORT, liveConfigured, type LiveControl } from './ai-security.mts';
import { transaction } from './portal-db.mts';
import { ensureProfile, recoverInterrupted, messageView, type PortalRepository, type Student } from './portal-repository.mts';
import { scrubPII, TUTOR_CONTEXT_LIMIT } from '../../src/app/shared/ai-tutor/tutor-core.ts';

export interface PortalAIOptions {
  repository: () => PortalRepository;
  user: () => Promise<Student | null>;
  control: LiveControl;
  fetch: typeof fetch;
  sample: (lang: 'es' | 'en', input: string) => string;
  instructions: (lang: 'es' | 'en') => string;
  now?: () => number;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function pricing() {
  const input = Number(env('PORTAL_AI_INPUT_USD_PER_MILLION'));
  const output = Number(env('PORTAL_AI_OUTPUT_USD_PER_MILLION'));
  if (env('PORTAL_AI_ENABLED') !== 'true' || env('PORTAL_AI_PRICE_MODEL') !== MODELS.tutor ||
      !Number.isFinite(input) || input <= 0 || input > 1000 || !Number.isFinite(output) || output <= 0 || output > 1000) return null;
  return { input, output };
}
export function reserveCost(instructions: string, history: { role: string; content: string }[], input: string, rates: { input: number; output: number }) {
  // UTF-8 byte count bounds byte-level tokens; extra room covers API message framing.
  const tokens = Buffer.byteLength(instructions + JSON.stringify(history) + input, 'utf8') + 4096;
  return Math.ceil(tokens * rates.input + OUTPUT_TOKEN_CAP * rates.output);
}
export function createPortalAIHandler(options: PortalAIOptions) {
  return async (req: Request, context: Context): Promise<Response> => {
    try {
      if (req.method !== 'POST') throw new HttpError(405, 'method_not_allowed');
      if (req.headers.get('origin') !== new URL(req.url).origin) throw new HttpError(403, 'origin_not_allowed');
      const user = await options.user();
      if (!user) throw new HttpError(401, 'unauthorized');
      const chatId = new URL(req.url).pathname.match(/^\/api\/portal\/chats\/([^/]+)\/messages$/)?.[1];
      if (!chatId || !uuid.test(chatId)) throw new HttpError(404, 'not_found');
      const body = await readJSON(req);
      if (Object.keys(body).some(key => !['input','lang','requestId','live','acknowledged'].includes(key)) ||
          typeof body['input'] !== 'string' || !body['input'].trim() || body['input'].length > 2000 ||
          !uuid.test(String(body['requestId'])) || !['es','en'].includes(body['lang'] as string) ||
          typeof body['live'] !== 'boolean' || typeof body['acknowledged'] !== 'boolean') throw new HttpError(400, 'invalid_message');
      const input = scrubPII(body['input'].trim()), lang = body['lang'] as 'es' | 'en', id = body['requestId'] as string;
      const digest = createHash('sha256').update(JSON.stringify([input,lang,body['live'],body['acknowledged']])).digest('hex');
      const rates = pricing();
      let live = !!rates && body['live'] === true && body['acknowledged'] === true && liveConfigured(context);
      try { live = live && await options.control.read(); } catch { live = false; }
      const repo = options.repository();
      const now = new Date((options.now ?? Date.now)()), day = now.toISOString().slice(0,10), month = day.slice(0,7)+'-01';
      const reservation = await transaction(repo.pool, async db => {
        await db.query('SELECT pg_advisory_xact_lock(1810002)');
        await ensureProfile(db, user);
        const chat = (await db.query('SELECT id FROM portal_chats WHERE id=$1 AND user_id=$2 AND expires_at>now() FOR UPDATE', [chatId,user.id])).rows[0];
        if (!chat) throw new HttpError(404, 'not_found');
        await recoverInterrupted(db,user.id,chatId);
        const previous = (await db.query('SELECT * FROM portal_requests WHERE user_id=$1 AND id=$2', [user.id,id])).rows[0];
        if (previous) {
          if (previous.chat_id !== chatId || previous.input_hash !== digest) throw new HttpError(409, 'request_conflict');
          if (previous.state === 'pending') throw new HttpError(409, 'request_in_progress');
          const reply = (await db.query("SELECT content FROM portal_messages WHERE user_id=$1 AND request_id=$2 AND role='assistant'",[user.id,id])).rows[0];
          return { replay: { reply: reply?.content ?? options.sample(lang,input), demo: previous.demo, reason: previous.reason }, history: [], cost: 0, reason: '' };
        }
        if ((await db.query("SELECT 1 FROM portal_requests WHERE chat_id=$1 AND user_id=$2 AND state='pending'",[chatId,user.id])).rows.length) throw new HttpError(409, 'request_in_progress');
        if (Number((await db.query('SELECT count(*) AS n FROM portal_messages WHERE chat_id=$1 AND user_id=$2',[chatId,user.id])).rows[0].n) >= 200) throw new HttpError(409, 'message_limit');
        const history = (await db.query('SELECT role,content,demo FROM portal_messages WHERE chat_id=$1 AND user_id=$2 AND NOT demo ORDER BY sequence DESC LIMIT $3',[chatId,user.id,TUTOR_CONTEXT_LIMIT])).rows.reverse().map(messageView);
        let cost = live && rates ? reserveCost(options.instructions(lang),history,input,rates) : 0;
        let reason = body['live'] && !body['acknowledged'] ? 'acknowledgement_required' : live ? 'ok' : 'sample_mode';
        if (cost > 0) {
          await db.query('INSERT INTO portal_daily_usage(user_id,day) VALUES($1,$2) ON CONFLICT DO NOTHING',[user.id,day]);
          await db.query('INSERT INTO portal_monthly_usage(month) VALUES($1) ON CONFLICT DO NOTHING',[month]);
          const daily = Number((await db.query('SELECT requests FROM portal_daily_usage WHERE user_id=$1 AND day=$2',[user.id,day])).rows[0].requests);
          const monthly = Number((await db.query('SELECT amount_micro FROM portal_monthly_usage WHERE month=$1',[month])).rows[0].amount_micro);
          if (daily >= 20) { cost=0; reason='allowance_exhausted'; }
          else if (monthly+cost > 25_000_000) { cost=0; reason='monthly_budget_exhausted'; }
          else {
            await db.query('UPDATE portal_daily_usage SET requests=requests+1 WHERE user_id=$1 AND day=$2',[user.id,day]);
            await db.query('UPDATE portal_monthly_usage SET amount_micro=amount_micro+$2 WHERE month=$1',[month,cost]);
          }
        }
        await db.query("INSERT INTO portal_requests(id,user_id,chat_id,input_hash,state,reason,reserved_micro,day,month) VALUES($1,$2,$3,$4,'pending',$5,$6,$7,$8)",[id,user.id,chatId,digest,reason,cost,day,month]);
        await db.query("INSERT INTO portal_messages(user_id,chat_id,request_id,role,content,demo) VALUES($1,$2,$3,'user',$4,true)",[user.id,chatId,id,input]);
        await db.query("UPDATE portal_chats SET title=CASE WHEN title='' THEN $3 ELSE title END WHERE id=$1 AND user_id=$2",[chatId,user.id,input.slice(0,70)]);
        return { replay:null,history,cost,reason };
      });
      if (reservation.replay) return json(reservation.replay);
      let reply = options.sample(lang,input), demo=true, reason=reservation.reason;
      let actual: number | null = null;
      if (reservation.cost > 0 && rates) {
        try {
          if (!await options.control.read()) { reason='paused'; }
          else {
            const response = await options.fetch('https://api.meta.ai/v1/responses', {
              method:'POST', headers:{Authorization:`Bearer ${env('META_MUSE_API_KEY').trim()}`,'Content-Type':'application/json'},
              signal:AbortSignal.timeout(20000),redirect:'error',
              body:JSON.stringify({model:MODELS.tutor,instructions:options.instructions(lang),input:[...reservation.history.map(({role,content})=>({role,content})),{role:'user',content:input}],tools:[],reasoning:{effort:REASONING_EFFORT},max_output_tokens:OUTPUT_TOKEN_CAP,store:false}),
            });
            if (!response.ok) throw new Error('upstream_unavailable');
            const result = await response.json() as any;
            const text = Array.isArray(result.output) ? result.output.filter((item:any)=>item?.type==='message'&&item?.role==='assistant').flatMap((item:any)=>Array.isArray(item.content)?item.content:[]).filter((item:any)=>item?.type==='output_text'&&typeof item.text==='string').map((item:any)=>item.text).join('\n').trim() : '';
            if (text) { reply=scrubPII(text); demo=false; reason='ok'; } else reason='upstream_unavailable';
            if (Number.isSafeInteger(result.usage?.input_tokens) && result.usage.input_tokens>=0 && Number.isSafeInteger(result.usage?.output_tokens) && result.usage.output_tokens>=0) {
              const measured = Math.ceil(result.usage.input_tokens*rates.input+result.usage.output_tokens*rates.output);
              if (measured<=reservation.cost) actual=measured;
            }
          }
        } catch { reason='upstream_unavailable'; }
      }
      await transaction(repo.pool, async db => {
        await ensureProfile(db,user);
        if (!(await db.query('SELECT id FROM portal_chats WHERE id=$1 AND user_id=$2 AND expires_at>now() FOR UPDATE',[chatId,user.id])).rows.length) throw new HttpError(404,'not_found');
        const request = (await db.query("SELECT * FROM portal_requests WHERE user_id=$1 AND id=$2 AND state='pending' FOR UPDATE",[user.id,id])).rows[0];
        if (!request) throw new HttpError(409,'request_interrupted');
        await db.query("INSERT INTO portal_messages(user_id,chat_id,request_id,role,content,demo) VALUES($1,$2,$3,'assistant',$4,$5)",[user.id,chatId,id,scrubPII(reply),demo]);
        await db.query('UPDATE portal_messages SET demo=$3 WHERE user_id=$1 AND request_id=$2',[user.id,id,demo]);
        await db.query("UPDATE portal_requests SET state='done',demo=$3,reason=$4 WHERE user_id=$1 AND id=$2",[user.id,id,demo,reason]);
        if (actual!==null) await db.query('UPDATE portal_monthly_usage SET amount_micro=amount_micro-$2 WHERE month=$1',[request.month, reservation.cost-actual]);
      });
      return json({reply:scrubPII(reply),demo,reason});
    } catch (error) { return json({reason:error instanceof HttpError?error.message:'portal_unavailable'},error instanceof HttpError?error.status:503); }
  };
}

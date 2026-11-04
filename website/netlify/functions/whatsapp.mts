import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Config, Context } from '@netlify/functions';
import { env, HttpError, json } from '../lib/ai-security.mts';
import { portalPool, type PortalPool } from '../lib/portal-db.mts';
import { portalUser } from '../lib/portal-user.mts';
import { WorkshopRepository } from '../lib/workshop-repository.mts';
import { discoveryLanguage, discoveryReply, type WorkflowLang } from '../../src/app/workshops/meta-workflows.ts';
import type { WorkshopSession } from '../../src/app/workshops/workshop-types.ts';

const SETTINGS = ['WHATSAPP_APP_SECRET','WHATSAPP_VERIFY_TOKEN','WHATSAPP_ACCESS_TOKEN','WHATSAPP_PHONE_NUMBER_ID','WHATSAPP_GRAPH_VERSION','WHATSAPP_PUBLIC_ORIGIN','WHATSAPP_TEST_RECIPIENTS'] as const;
export interface WhatsAppDependencies {
  env: typeof env;
  pool: () => PortalPool;
  sessions: () => Promise<WorkshopSession[]>;
  fetch: typeof fetch;
  user: typeof portalUser;
  now: () => number;
}
const defaults: WhatsAppDependencies = {env,pool:portalPool,sessions:()=>new WorkshopRepository(portalPool()).schedule(),fetch:(...args)=>fetch(...args),user:portalUser,now:Date.now};
const equal = (a: string,b: string) => {const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length && timingSafeEqual(x,y);};
export function validSignature(raw: string, signature: string, secret: string): boolean {
  return !!secret && /^sha256=[a-f0-9]{64}$/.test(signature) && equal(signature,`sha256=${createHmac('sha256',secret).update(raw).digest('hex')}`);
}
function configuration(deps: WhatsAppDependencies) {
  const missing=SETTINGS.filter(key=>!deps.env(key).trim());
  const version=deps.env('WHATSAPP_GRAPH_VERSION');
  const phone=deps.env('WHATSAPP_PHONE_NUMBER_ID');
  let origin='';
  try {const url=new URL(deps.env('WHATSAPP_PUBLIC_ORIGIN'));if(url.protocol==='https:' && url.pathname==='/' && !url.search && !url.hash && !url.username && !url.password)origin=url.origin;} catch {}
  const recipients=deps.env('WHATSAPP_TEST_RECIPIENTS').split(',').map(s=>s.trim()).filter(s=>/^\d{7,15}$/.test(s));
  return {missing,origin,recipients,ready:missing.length===0 && !!origin && /^v\d+\.\d+$/.test(version) && /^\d+$/.test(phone) && recipients.length>0};
}
async function bodyText(req: Request): Promise<string> {
  if(!req.body)throw new HttpError(400,'invalid_body');
  const reader=req.body.getReader();const chunks:Uint8Array[]=[];let size=0;
  try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>131072){await reader.cancel();throw new HttpError(413,'body_too_large');}chunks.push(value);}}
  finally {reader.releaseLock();}
  return Buffer.concat(chunks).toString('utf8');
}
export function createWhatsAppHandler(deps: WhatsAppDependencies = defaults) {
  return async(req: Request,context: Context):Promise<Response>=>{
    try {
      const url=new URL(req.url);const config=configuration(deps);
      if(url.pathname==='/api/whatsapp/status') {
        if(req.method!=='GET')throw new HttpError(405,'method_not_allowed');
        const user=req.headers.has('authorization')?await deps.user():null;
        if(!user?.confirmedAt || !user.roles?.includes('admin'))throw new HttpError(401,'unauthorized');
        return json({status:config.ready?'test_ready':'not_configured',enabled:deps.env('WHATSAPP_ENABLED')==='true',missing:config.missing,
          message:'Test setup only. Configuration does not confirm delivery. No public production messaging.'});
      }
      // Preview deploys cannot receive messages or alter production deduplication state.
      if(context.deploy?.context!=='production')throw new HttpError(503,'test_deployment_required');
      if(req.method==='GET') {
        const token=deps.env('WHATSAPP_VERIFY_TOKEN');
        if(!token || url.searchParams.get('hub.mode')!=='subscribe' || !equal(url.searchParams.get('hub.verify_token')??'',token))throw new HttpError(403,'verification_failed');
        const challenge=url.searchParams.get('hub.challenge')??'';
        if(!/^\d{1,100}$/.test(challenge))throw new HttpError(400,'invalid_challenge');
        return new Response(challenge,{headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}});
      }
      if(req.method!=='POST')throw new HttpError(405,'method_not_allowed');
      const raw=await bodyText(req);
      if(!validSignature(raw,req.headers.get('x-hub-signature-256')??'',deps.env('WHATSAPP_APP_SECRET')))throw new HttpError(403,'invalid_signature');
      if(!config.ready || deps.env('WHATSAPP_ENABLED')!=='true')throw new HttpError(503,'whatsapp_unavailable');
      let payload:any;try{payload=JSON.parse(raw);}catch{throw new HttpError(400,'invalid_body');}
      if(payload?.object!=='whatsapp_business_account' || !Array.isArray(payload.entry))throw new HttpError(400,'invalid_event');
      // Sequential processing limits outgoing traffic and preserves list/selection order.
      let count=0;
      for(const entry of payload.entry) for(const change of Array.isArray(entry?.changes)?entry.changes:[]) {
        const value=change?.value;
        if(change?.field!=='messages' || value?.metadata?.phone_number_id!==deps.env('WHATSAPP_PHONE_NUMBER_ID'))continue;
        for(const message of Array.isArray(value.messages)?value.messages:[]) {
          if(++count>10)throw new HttpError(400,'too_many_messages');
          const sender=message?.from;
          // Test integration is restricted to explicitly configured consenting recipients.
          if(typeof sender!=='string' || !config.recipients.includes(sender) || typeof message?.id!=='string' || message.id.length>256)continue;
          const timestamp=Number(message.timestamp)*1000;
          if(!Number.isFinite(timestamp) || Math.abs(deps.now()-timestamp)>24*60*60*1000)continue;
          const secret=deps.env('WHATSAPP_APP_SECRET');
          const hash=(s:string)=>createHmac('sha256',secret).update(s).digest('hex');
          const pool=deps.pool();const id=hash('event:'+message.id),senderHash=hash('sender:'+sender);
          const claimed=await pool.query("INSERT INTO whatsapp_events(id_hash,state) VALUES($1,'claimed') ON CONFLICT DO NOTHING RETURNING id_hash",[id]);
          if(!claimed.rows.length)continue;
          // A claim is durable before transmission. Ambiguous send failures are not retried:
          // this favors avoiding duplicate invitations over guaranteed delivery.
          try {
            const saved=(await pool.query('SELECT language,session_ids FROM whatsapp_selections WHERE sender_hash=$1 AND expires_at>now()',[senderHash])).rows[0];
            const text=message.type==='text' && typeof message.text?.body==='string'?message.text.body.slice(0,1000):'';
            let result:{lang:WorkflowLang;reply:string;sessionIds?:string[]};
            try {result=discoveryReply(text,await deps.sessions(),config.origin,saved?{language:saved.language,sessionIds:saved.session_ids}:undefined,deps.now());}
            catch {const lang=discoveryLanguage(text,saved?.language);result={lang,reply:lang==='es'?`No pudimos consultar los talleres. Intenta más tarde o visita ${config.origin}/agenda.`:`Workshops are temporarily unavailable. Try later or visit ${config.origin}/en/schedule.`};}
            if(result.sessionIds)await pool.query(`INSERT INTO whatsapp_selections(sender_hash,language,session_ids,expires_at) VALUES($1,$2,$3,now()+interval '1 hour') ON CONFLICT(sender_hash) DO UPDATE SET language=EXCLUDED.language,session_ids=EXCLUDED.session_ids,expires_at=EXCLUDED.expires_at`,[senderHash,result.lang,JSON.stringify(result.sessionIds)]);
            const response=await deps.fetch(`https://graph.facebook.com/${deps.env('WHATSAPP_GRAPH_VERSION')}/${deps.env('WHATSAPP_PHONE_NUMBER_ID')}/messages`,{
              method:'POST',headers:{Authorization:`Bearer ${deps.env('WHATSAPP_ACCESS_TOKEN')}`,'Content-Type':'application/json'},
              body:JSON.stringify({messaging_product:'whatsapp',to:sender,type:'text',text:{preview_url:false,body:result.reply.slice(0,4000)}}),redirect:'error',signal:AbortSignal.timeout(8000)});
            if(!response.ok)throw new Error('send_failed');
            await pool.query("UPDATE whatsapp_events SET state='sent' WHERE id_hash=$1",[id]);
          } catch {await pool.query("UPDATE whatsapp_events SET state='failed' WHERE id_hash=$1",[id]);}
        }
      }
      return json({received:true});
    }catch(error){return json({reason:error instanceof HttpError?error.message:'whatsapp_unavailable'},error instanceof HttpError?error.status:503);}
  };
}
export default createWhatsAppHandler();
export const config: Config={path:['/api/whatsapp/webhook','/api/whatsapp/status']};

// Test-only API adapter. Never imported by application code or deployed functions.
import { randomUUID } from 'node:crypto';
import { scrubPII } from '../src/app/shared/ai-tutor/tutor-core.ts';
export function createPortalFixture() {
  const users=new Map();
  return (path,method,body,userId) => {
    if(!userId)return {status:401,body:{reason:'unauthorized'}};
    if(!users.has(userId))users.set(userId,{progress:{enrolled:false,completed:[]},chats:new Map(),replays:new Map()});
    const data=users.get(userId);
    const ok=body=>({status:200,body});
    if(path==='profile')return ok({consented:true,privacyVersion:'2026-11-03'});
    if(path==='account'&&method==='DELETE'){users.delete(userId);return ok({deleting:true});}
    if(path==='progress'){
      if(method==='POST'){
        if(body.action==='enroll')data.progress.enrolled=true;
        if(body.action==='complete'&&!data.progress.completed.includes(body.lessonId))data.progress.completed.push(body.lessonId);
      }
      return ok(data.progress);
    }
    if(path==='chats'){
      if(method==='GET')return ok({chats:[...data.chats.values()].reverse().map(({messages,...chat})=>chat)});
      const chat={id:randomUUID(),title:'',createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+30*86400000).toISOString(),messages:[]};
      data.chats.set(chat.id,chat);return {status:201,body:chat};
    }
    const match=path.match(/^chats\/([^/]+)(\/messages)?$/);
    const chat=match&&data.chats.get(match[1]);
    if(!chat)return {status:404,body:{reason:'not_found'}};
    if(method==='DELETE'){data.chats.delete(chat.id);return ok({deleted:true});}
    if(match[2]){
      if(data.replays.has(body.requestId))return ok(data.replays.get(body.requestId));
      const input=scrubPII(body.input),reply='Sample: include task, context, and format. Ejemplo: incluye tarea, contexto y formato.';
      chat.title ||= input.slice(0,70);
      chat.messages.push({role:'user',content:input,demo:true},{role:'assistant',content:reply,demo:true});
      const result={reply,demo:true,reason:'sample_mode'};data.replays.set(body.requestId,result);return ok(result);
    }
    return ok(chat);
  };
}

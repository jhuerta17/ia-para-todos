import { ActivatedRoute } from '@angular/router';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Language } from '../../../i18n/language';
import { ActionButton } from '../../../shared/action-button';
import { tutorCopy } from '../../../shared/ai-tutor/tutor-copy';
import { scrubPII } from '../../../shared/ai-tutor/tutor-core';
import { PortalClient, type PortalChat } from '../../store/portal-client';

const copy = {
  es: { title:'Tu práctica guardada', lead:'Prueba instrucciones con datos inventados y retoma tus conversaciones.', new:'Nueva conversación', empty:'Todavía no tienes conversaciones. Crea una para comenzar.', untitled:'Nueva conversación', expires:'Se elimina el', delete:'Eliminar conversación', confirm:'¿Eliminar esta conversación y sus mensajes?', yes:'Sí, eliminar', cancel:'Cancelar', saved:'Se guarda en tu cuenta durante 30 días desde que creas la conversación. Puedes eliminarla antes.', sampleMode:'Modo de ejemplo: las respuestas de ejemplo no son respuestas de una IA en vivo.', error:'No pudimos guardar o cargar tu práctica. Comprueba tu conexión. Si el envío falló, usa Reintentar envío para evitar duplicados.', retry:'Reintentar envío', loading:'Cargando…', reload:'Actualizar conversaciones', budget:'Se alcanzó el límite de práctica en vivo. Puedes continuar con ejemplos.', sending:'Guardando respuesta…', selected:'Conversación', pending:'Un envío puede seguir en curso. Actualiza la conversación en un momento; no vuelvas a enviar el mismo texto como una pregunta nueva.' },
  en: { title:'Your saved practice', lead:'Try prompts with made-up data and resume your conversations.', new:'New conversation', empty:'You have no conversations yet. Create one to begin.', untitled:'New conversation', expires:'Expires on', delete:'Delete conversation', confirm:'Delete this conversation and its messages?', yes:'Yes, delete', cancel:'Cancel', saved:'Saved in your account for 30 days from creation. You can delete it sooner.', sampleMode:'Sample mode: sample replies are not answers from live AI.', error:'We could not save or load your practice. Check your connection. If sending failed, use Retry send to avoid duplicates.', retry:'Retry send', loading:'Loading…', reload:'Refresh conversations', budget:'The live practice allowance has been reached. You can continue with samples.', sending:'Saving reply…', selected:'Conversation', pending:'A send may still be in progress. Refresh the conversation shortly; do not submit the same text as a new question.' },
};
@Component({selector:'app-portal-chats',imports:[ActionButton],templateUrl:'./portal-chats.html',styleUrl:'./portal-chats.css',changeDetection:ChangeDetectionStrategy.OnPush})
export class PortalChats {
  private readonly client=inject(PortalClient);
  private initialChat = inject(ActivatedRoute).snapshot.queryParamMap.get('chat');
  protected readonly language=inject(Language);
  protected readonly c=computed(()=>copy[this.language.lang()]);
  protected readonly tutor=computed(()=>tutorCopy[this.language.lang()]);
  protected readonly chats=signal<PortalChat[]>([]);
  protected readonly selected=signal<PortalChat|null>(null);
  protected readonly busy=signal(false);
  protected readonly sending=signal(false);
  protected readonly failed=signal(false);
  protected readonly deleting=signal(false);
  protected readonly reason=signal('');
  protected readonly retryAvailable=signal(false);
  protected input='';
  private pending: { chatId:string; body:{ input:string;lang:'es'|'en';requestId:string;live:boolean;acknowledged:boolean } } | null=null;
  protected expires(value:string):string{return new Intl.DateTimeFormat(this.language.lang(),{dateStyle:'medium'}).format(new Date(value));}
  constructor(){afterNextRender(()=>void this.refresh());}
  protected async refresh():Promise<void>{
    this.busy.set(true);this.failed.set(false);
    try {
      this.chats.set((await this.client.request<{chats:PortalChat[]}>('chats')).chats);
      const initial = this.initialChat;
      this.initialChat = null;
      if(initial && this.chats().some(chat=>chat.id===initial)) this.selected.set(await this.client.request(`chats/${initial}`));
      const selected=this.selected();
      if(selected && this.chats().some(chat=>chat.id===selected.id)) this.selected.set(await this.client.request(`chats/${selected.id}`));
      else if(selected) this.selected.set(null);
    } catch {this.failed.set(true);}finally{this.busy.set(false);}
  }
  protected async create():Promise<void>{
    if(this.sending()||this.busy())return;
    this.busy.set(true);this.failed.set(false);
    try {const chat=await this.client.request<PortalChat>('chats','POST');this.selected.set({...chat,messages:[]});this.pending=null;this.retryAvailable.set(false);this.input='';this.chats.set([chat,...this.chats()]);}
    catch{this.failed.set(true);}finally{this.busy.set(false);}
  }
  protected async open(chat:PortalChat):Promise<void>{
    if(this.sending()||this.busy())return;
    this.busy.set(true);this.failed.set(false);this.deleting.set(false);
    try{this.selected.set(await this.client.request(`chats/${chat.id}`));this.input='';this.pending=null;this.retryAvailable.set(false);}
    catch{this.failed.set(true);}finally{this.busy.set(false);}
  }
  protected async remove():Promise<void>{
    const chat=this.selected();if(!chat||this.sending()||this.busy())return;
    this.busy.set(true);this.failed.set(false);
    try{await this.client.request(`chats/${chat.id}`,'DELETE');this.selected.set(null);this.chats.set(this.chats().filter(item=>item.id!==chat.id));this.pending=null;this.retryAvailable.set(false);this.deleting.set(false);}
    catch{this.failed.set(true);}finally{this.busy.set(false);}
  }
  protected async send(retry=false):Promise<void>{
    const chat=this.selected();if(!chat||this.sending()||this.busy())return;
    if(!retry){
      const input=this.input.trim();if(!input||input.length>2000||this.pending)return;
      this.pending={chatId:chat.id,body:{input:scrubPII(input),lang:this.language.lang(),requestId:crypto.randomUUID(),live:true,acknowledged:true}};
    }
    if(!this.pending)return;
    this.sending.set(true);this.failed.set(false);
    try{
      const result=await this.client.request<{reason:string}>(`chats/${this.pending.chatId}/messages`,'POST',this.pending.body);
      this.reason.set(result.reason);this.pending=null;this.retryAvailable.set(false);this.input='';
      this.selected.set(await this.client.request(`chats/${chat.id}`));
      this.chats.set((await this.client.request<{chats:PortalChat[]}>('chats')).chats);
    }catch{this.failed.set(true);this.retryAvailable.set(this.pending!==null);}
    finally{this.sending.set(false);}
  }
}

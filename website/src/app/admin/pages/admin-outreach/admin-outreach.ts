import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Language } from '../../../i18n/language';
import { Icon } from '../../../shared/icon';
import { WorkshopClient } from '../../../workshops/workshop-client';
import { workshopDate } from '../../../workshops/workshop-format';
import type { WorkshopSession } from '../../../workshops/workshop-types';
import { demoSessions } from '../../../workshops/workshop-demo';
import { discoveryReply, outreachSample, workshopFacts, type WorkflowLang } from '../../../workshops/meta-workflows';
import { AdminSession } from '../../session/admin-session';
import { DemoState } from '../../data/demo-state';

@Component({selector:'app-admin-outreach',imports:[FormsModule,Icon],templateUrl:'./admin-outreach.html',styleUrl:'./admin-outreach.css',changeDetection:ChangeDetectionStrategy.OnPush})
export class AdminOutreach {
  private readonly language=inject(Language);
  private readonly client=inject(WorkshopClient);
  private readonly session=inject(AdminSession);
  protected readonly demo=inject(DemoState).enabled;
  protected readonly es=computed(()=>this.language.lang()==='es');
  protected readonly sessions=signal<WorkshopSession[]>([]);
  protected readonly loading=signal(true);
  protected readonly busy=signal(false);
  protected readonly error=signal('');
  protected readonly notice=signal('');
  protected readonly status=signal('');
  protected readonly selectedId=signal('');
  protected readonly selected=computed(()=>this.sessions().find(s=>s.id===this.selectedId()));
  protected readonly outputLang=signal<WorkflowLang>('es');
  protected readonly acknowledged=signal(false);
  protected readonly draft=signal('');
  protected readonly sample=signal(true);
  protected readonly preview=signal('');
  protected previewInput='Talleres';
  private selection: {language:WorkflowLang;sessionIds:string[]}|undefined;
  private readonly previewSessions=demoSessions();
  constructor(){let ready=false;effect(()=>{this.demo();if(ready)void this.load();});afterNextRender(()=>{ready=true;void this.load();this.simulate();});}
  protected date(s:WorkshopSession):string {return workshopDate(s,this.outputLang());}
  protected clearDraft():void {this.draft.set('');this.notice.set('');}
  protected async load():Promise<void>{
    this.loading.set(true);this.error.set('');this.draft.set('');
    if(this.demo()){
      const sessions=demoSessions().filter(s=>s.status==='published'&&Date.parse(s.startsAt)>Date.now());
      this.sessions.set(sessions);this.selectedId.set(sessions[0]?.id??'');this.status.set(this.es()?'Demostración: no consulta Meta ni envía mensajes.':'Demo: no Meta requests or messages.');this.loading.set(false);return;
    }
    try{const data=await this.client.request<{sessions:WorkshopSession[]}>('sessions');this.sessions.set(data.sessions);this.selectedId.set(data.sessions[0]?.id??'');}
    catch{this.error.set(this.es()?'No pudimos cargar los talleres. Intenta de nuevo.':'Could not load workshops. Please retry.');}
    try{const r=await fetch('/api/whatsapp/status',{headers:{Authorization:`Bearer ${await this.session.jwt()}`},signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error();const data=await r.json();this.status.set(data.status==='test_ready'?(data.enabled ? (this.es()?'Configurado para pruebas; entrega sin verificar.':'Configured for testing; delivery unverified.') : (this.es()?'Configurado; mensajes pausados. Entrega sin verificar.':'Configured; messaging paused. Delivery unverified.')):(this.es()?'Sin configurar. Falta: ':'Not configured. Missing: ')+(data.missing??[]).join(', '));}
    catch{this.status.set(this.es()?'Estado de integración no disponible.':'Integration status unavailable.');}
    finally{this.loading.set(false);}
  }
  protected async generate():Promise<void>{
    const s=this.selected();if(!s||!this.acknowledged()||this.busy())return;
    this.busy.set(true);this.draft.set('');this.notice.set('');this.error.set('');
    try{
      if(this.demo()){this.draft.set(outreachSample(workshopFacts(s,this.outputLang(),'https://example.org'),this.outputLang()));this.sample.set(true);return;}
      const r=await fetch('/api/ai-assist',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await this.session.jwt()}`},body:JSON.stringify({task:'outreach',lang:this.outputLang(),input:'Published workshop invitation',sessionId:s.id,history:[],acknowledged:true}),signal:AbortSignal.timeout(30000)});
      if(!r.ok)throw new Error();const data=await r.json();if(typeof data.reply!=='string')throw new Error();this.draft.set(data.reply);this.sample.set(data.demo!==false);
    }catch{this.error.set(this.es()?'No pudimos generar los borradores. Comprueba la conexión y vuelve a intentar.':'Could not generate drafts. Check the connection and retry.');}
    finally{this.busy.set(false);}
  }
  protected async copy():Promise<void>{try{await navigator.clipboard.writeText(this.draft());this.notice.set(this.es()?'Copiado. Revisa los datos antes de compartir.':'Copied. Review the facts before sharing.');}catch{this.notice.set(this.es()?'Selecciona el texto y cópialo manualmente.':'Select the text and copy it manually.');}}
  protected simulate():void{
    const r=discoveryReply(this.previewInput,this.previewSessions,'https://example.org',this.selection);
    if(r.sessionIds)this.selection={language:r.lang,sessionIds:r.sessionIds};
    this.preview.set(r.reply);
  }
}

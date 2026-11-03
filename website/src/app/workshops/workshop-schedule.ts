import { afterNextRender, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Language } from '../i18n/language';
import { Icon } from '../shared/icon';
import { WorkshopClient, bookingToken } from './workshop-client';
import { workshopCopy } from './workshop-copy';
import { venueDay, workshopDate } from './workshop-format';
import type { BookingInput, Reservation, WorkshopSession } from './workshop-types';
@Component({selector:'app-workshop-schedule',imports:[FormsModule,RouterLink,Icon,NgTemplateOutlet],templateUrl:'./workshop-schedule.html',styleUrl:'./workshop.css'})
export class WorkshopSchedule {
  readonly embedded=input(false);
  protected readonly language=inject(Language);
  protected readonly en=computed(()=>this.language.lang()==='en');
  protected readonly c=computed(()=>workshopCopy[this.language.lang()]);
  private readonly client=inject(WorkshopClient);
  private readonly document=inject(DOCUMENT);
  private readonly params=toSignal(inject(ActivatedRoute).queryParamMap);
  protected readonly sessions=signal<WorkshopSession[]>([]);
  protected readonly selected=computed(()=>this.sessions().find(s=>s.id===this.params()?.get('session')));
  protected readonly loading=signal(true);
  protected readonly loadFailed=signal(false);
  protected readonly error=signal('');
  protected readonly submitting=signal(false);
  protected readonly result=signal<Reservation|null>(null);
  protected readonly view=signal<'list'|'calendar'>('list');
  protected readonly month=signal(new Date().toISOString().slice(0,7));
  protected name=''; protected contact=''; protected contactType:'email'|'phone'='email';
  protected adult=false; protected privacy=false; protected website='';
  private attempt: BookingInput|null=null;
  protected privateLink='';
  protected readonly days=computed(()=>{
    const [year,month]=this.month().split('-').map(Number);
    const offset=new Date(Date.UTC(year,month-1,1)).getUTCDay(),count=new Date(Date.UTC(year,month,0)).getUTCDate();
    const cells=Array.from({length:Math.ceil((offset+count)/7)*7},(_,i)=>{const day=i-offset+1;const key=`${this.month()}-${String(day).padStart(2,'0')}`;return day<1||day>count ? null : {day,key,sessions:this.sessions().filter(s=>venueDay(s)===key)};});
    return Array.from({length:cells.length/7},(_,i)=>cells.slice(i*7,i*7+7));
  });
  protected readonly weekdays=computed(()=>Array.from({length:7},(_,i)=>new Intl.DateTimeFormat(this.language.lang(),{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2026,10,1+i)))));
  protected readonly monthLabel=computed(()=>new Intl.DateTimeFormat(this.language.lang(),{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${this.month()}-01T12:00:00Z`)));
  constructor(){
    let lastSession: string | null | undefined;
    effect(()=>{const id=this.params()?.get('session');if(id!==lastSession){lastSession=id;this.result.set(null);this.attempt=null;this.error.set('');this.adult=false;this.privacy=false;}});
    afterNextRender(()=>{void this.client.session.restore();void this.load();});}
  protected requestedSession():boolean{return !!this.params()?.get('session');}
  protected path(kind='agenda'):string {return this.en() ? `/en/${kind==='agenda'?'schedule':kind==='preparacion'?'preparation':'reservations'}` : `/${kind}`;}
  protected title(s:WorkshopSession):string{return this.en()?s.titleEn:s.titleEs;}
  protected date(s:WorkshopSession):string{return workshopDate(s,this.language.lang());}
  protected moveMonth(delta:number):void{const [y,m]=this.month().split('-').map(Number);this.month.set(new Date(Date.UTC(y,m-1+delta,1)).toISOString().slice(0,7));}
  protected async load():Promise<void>{
    this.loading.set(true);this.loadFailed.set(false);this.error.set('');
    try{const data=await this.client.request<{sessions:WorkshopSession[]}>('sessions');this.sessions.set(data.sessions);if(data.sessions.length)this.month.set(venueDay(data.sessions[0]).slice(0,7));}
    catch{this.loadFailed.set(true);this.error.set(this.c().error);}finally{this.loading.set(false);}
  }
  protected async reserve():Promise<void>{
    const s=this.selected();if(!s||this.submitting()||!this.adult||!this.privacy)return;
    this.submitting.set(true);this.error.set('');
    const b:BookingInput={sessionId:s.id,token:this.attempt?.token??bookingToken(),name:this.name.trim(),contact:this.contact.trim(),contactType:this.contactType,adult:this.adult,privacy:this.privacy,website:this.website};
    if(this.attempt&&JSON.stringify(this.attempt)!==JSON.stringify(b)){this.error.set(this.c().changed);this.submitting.set(false);return;}
    this.attempt=b;
    try{
      const result=await this.client.request<Reservation>('book','POST',b);
      this.privateLink=`${this.document.location.origin}${this.path('reservas')}#${b.token}`;
      this.result.set(result);
    }catch(e){const reason=(e as Error).message;this.error.set(reason==='session_full'?this.c().fullError:reason==='already_reserved'?this.c().duplicate:this.c().error);}
    finally{this.submitting.set(false);}
  }
  protected resetAttempt():void{this.attempt=null;this.error.set('');}
  protected print():void{this.document.defaultView?.print();}
}

import { afterNextRender, Component, inject, Injector, signal } from '@angular/core';
import { Icon } from '../shared/icon';
import { BadgeComponent } from '../admin/shared/ui/badge/badge.component';
import { TABLE_IMPORTS } from '../admin/shared/ui/table/table.directive';
import { FormsModule } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { AdminBreadcrumb } from '../admin/layout/admin-breadcrumb/admin-breadcrumb';
import { WorkshopClient, bookingToken } from './workshop-client';
import { TOPICS, type WorkshopSession, type Reservation, type BookingInput } from './workshop-types';
import { venueInstant, venueWallTime } from './workshop-format';
type SessionForm = Omit<WorkshopSession,'id'|'available'|'totalReservations'>;
const fresh=():SessionForm=>({topic:TOPICS[0],titleEs:'',titleEn:'',language:'es',startsAt:'',endsAt:'',timeZone:'America/Chicago',venue:'',address:'',accessibilityEs:'',accessibilityEn:'',bringEs:'',bringEn:'',capacity:20,status:'draft'});
@Component({selector:'app-workshop-admin',imports:[FormsModule,AdminBreadcrumb,Icon,BadgeComponent,...TABLE_IMPORTS],styleUrl:'./workshop-admin.css',templateUrl:'./workshop-admin.html'})
export class WorkshopAdmin {
  private readonly injector=inject(Injector);
  private focusPanel(id:string):void {
    afterNextRender(()=>{const heading=this.document.getElementById(id);heading?.scrollIntoView({block:'start'});heading?.focus({preventScroll:true});},{injector:this.injector});
  }
  protected closeEditor():void {this.editing.set(false);this.document.getElementById('create-workshop')?.focus();}
  protected topicLabel(topic:typeof TOPICS[number]):string {return ({'introduccion-ia':'Introduction to AI','vida-diaria':'AI for Everyday Life','trabajo-negocios':'AI for Work and Business','padres-familias':'AI for Parents and Families'})[topic];}
  private readonly client=inject(WorkshopClient);private readonly document=inject(DOCUMENT);
  protected readonly sessions=signal<WorkshopSession[]>([]);protected readonly reservations=signal<Reservation[]>([]);
  protected readonly loading=signal(true);protected readonly busy=signal(false);protected readonly error=signal('');protected readonly message=signal('');
  protected readonly editing=signal(false);protected readonly selected=signal<WorkshopSession|null>(null);protected readonly topics=TOPICS;
  protected form=fresh();protected editingId='';protected name='';protected contact='';protected contactType:'email'|'phone'='email';protected adult=false;protected privacy=false;
  protected managementLink='';private attempt:BookingInput|null=null;
  constructor(){afterNextRender(()=>{void this.load();});}
  protected date(s:WorkshopSession){return new Intl.DateTimeFormat('en',{timeZone:s.timeZone,dateStyle:'medium'}).format(new Date(s.startsAt));}
  protected time(s:WorkshopSession){const format=new Intl.DateTimeFormat('en',{timeZone:s.timeZone,timeStyle:'short'});return `${format.format(new Date(s.startsAt))} – ${format.format(new Date(s.endsAt))}`;}
  protected async load(){this.loading.set(true);this.error.set('');try{this.sessions.set((await this.client.request<{sessions:WorkshopSession[]}>('admin/sessions')).sessions);}catch{this.error.set('Could not load workshops. Try again.');}finally{this.loading.set(false);}}
  protected edit(s?:WorkshopSession){this.form=s?{topic:s.topic,titleEs:s.titleEs,titleEn:s.titleEn,language:s.language,startsAt:venueWallTime(s.startsAt,s.timeZone),endsAt:venueWallTime(s.endsAt,s.timeZone),timeZone:s.timeZone,venue:s.venue,address:s.address,accessibilityEs:s.accessibilityEs,accessibilityEn:s.accessibilityEn,bringEs:s.bringEs,bringEn:s.bringEn,capacity:s.capacity,status:s.status}:fresh();this.editingId=s?.id??'';this.editing.set(true);this.error.set('');this.message.set('');this.focusPanel('workshop-editor-title');}
  protected async save(){if(this.busy())return;this.busy.set(true);this.error.set('');try{await this.client.request('admin/sessions','POST',{...this.form,startsAt:venueInstant(this.form.startsAt,this.form.timeZone),endsAt:venueInstant(this.form.endsAt,this.form.timeZone),...(this.editingId?{id:this.editingId}:{})});this.editing.set(false);await this.load();if(this.selected()){const updated=this.sessions().find(s=>s.id===this.selected()!.id);if(updated)await this.open(updated);}this.message.set('Workshop saved. Changes to existing sessions flag reservations for manual follow-up.');}catch(e){this.error.set(this.errorText(e));}finally{this.busy.set(false);}}
  protected async open(s:WorkshopSession){this.selected.set(s);this.managementLink='';this.attempt=null;this.error.set('');try{this.reservations.set((await this.client.request<{reservations:Reservation[]}>(`admin/reservations?session=${s.id}`)).reservations);}catch{this.reservations.set([]);this.error.set('Could not load reservations.');}this.focusPanel('reservation-panel-title');}
  protected async action(r:Reservation,action:string){if(this.busy())return;this.busy.set(true);this.error.set('');try{await this.client.request('admin/reservations','POST',{id:r.id,action});await this.load();await this.open(this.sessions().find(s=>s.id===r.session.id)!);}catch(e){this.error.set(this.errorText(e));}finally{this.busy.set(false);}}
  protected async book(){const s=this.selected();if(!s||this.busy()||!this.adult||!this.privacy)return;this.busy.set(true);this.error.set('');
    const b:BookingInput={sessionId:s.id,token:this.attempt?.token??bookingToken(),name:this.name.trim(),contact:this.contact.trim(),contactType:this.contactType,adult:this.adult,privacy:this.privacy};
    if(this.attempt&&JSON.stringify(this.attempt)!==JSON.stringify(b)){this.error.set('Retry with the original details or select the session again to start a new reservation.');this.busy.set(false);return;}this.attempt=b;
    try{await this.client.request('admin/book','POST',b);await this.load();await this.open(this.sessions().find(v=>v.id===s.id)!);this.managementLink=`${this.document.location.origin}/reservas#${b.token}`;this.name='';this.contact='';this.adult=false;this.privacy=false;}catch(e){this.error.set(this.errorText(e));}finally{this.busy.set(false);}}
  private errorText(e:unknown){const reason=(e as Error).message;return ({session_full:'This workshop is full.',capacity_below_bookings:'Capacity cannot be lower than current reservations.',use_cancellation:'Cancel this session instead of hiding it: people already have reservations.',past_session:'Published sessions must start in the future.',invalid_dates:'Choose valid dates and an end after the start.',ambiguous_venue_time:'This time falls in a daylight-saving clock change. Choose a time outside the clock-change hour.',invalid_timezone:'Enter a valid IANA timezone.',invalid_fields:'Check all required fields and capacity (1–500).',invalid_contact:'Enter a valid email address or phone number.',cancelled_session:'Cancelled sessions cannot be reopened. Create a new session.'} as Record<string,string>)[reason]??'Could not save. Check the details and try again.';}
}

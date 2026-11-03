import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Language } from '../i18n/language';
import { workshops } from '../data/workshops';
import { TOPICS, type Reservation } from './workshop-types';
import { WorkshopClient } from './workshop-client';
import { WorkshopSchedule } from './workshop-schedule';
import { workshopCopy } from './workshop-copy';
import { workshopDate } from './workshop-format';
@Component({selector:'app-workshop-student',imports:[RouterLink,WorkshopSchedule],styleUrl:'./workshop.css',template:`
<section [attr.aria-label]="c().nextWorkshop"><header class="ws-heading"><h2>{{c().nextWorkshop}}</h2></header>
@if(loading()){<p role="status">{{c().loading}}</p>}
@if(error()){<div role="alert" class="ws-error">{{c().error}} <button class="ws-button secondary" type="button" (click)="load()">{{c().retry}}</button></div>}
@if(!loading()&&!error()&&!next()){<p>{{c().noReservation}}</p><app-workshop-schedule [embedded]="true"/>}
@for(r of ordered();track r.id){<article class="ws-card"><h3>{{en()?r.session.titleEn:r.session.titleEs}}</h3><p class="ws-date">{{date(r)}}</p><p>{{r.session.venue}} · {{r.session.address}}</p>
@if(r.status==='cancelled'){<p>{{c().cancelled}}</p>}@else if(r.session.status==='cancelled'){<p>{{c().sessionCancelled}}</p>}
<div class="ws-row"><a [routerLink]="en()?'/en/preparation':'/preparacion'">{{prepared()?c().prepDone:c().preparing}}</a><a [routerLink]="topicPath(r)">{{c().review}}</a><a routerLink="/portal/chats">{{c().practice}}</a></div>
@if(r.status==='confirmed'&&r.session.status!=='cancelled'&&future(r)){
@if(confirmId()===r.id){<p>{{c().cancelQuestion}}</p><div class="ws-row"><button type="button" class="ws-button" [disabled]="busy()" (click)="cancel(r)">{{c().yes}}</button><button type="button" class="ws-button secondary" (click)="confirmId.set('')">{{c().back}}</button></div>}
@else{<button type="button" class="ws-button secondary" (click)="confirmId.set(r.id)">{{c().cancel}}</button>}}
</article>}
<p><a [routerLink]="en()?'/en/schedule':'/agenda'">{{c().browse}}</a></p>
</section>`})
export class WorkshopStudent {
  private readonly language=inject(Language);protected readonly en=computed(()=>this.language.lang()==='en');protected readonly c=computed(()=>workshopCopy[this.language.lang()]);private readonly client=inject(WorkshopClient);
  private readonly reservations=signal<Reservation[]>([]);protected readonly loading=signal(true);protected readonly error=signal(false);protected readonly busy=signal(false);protected readonly prepared=signal(false);protected readonly confirmId=signal('');
  protected readonly next=computed(()=>this.reservations().find(r=>r.status==='confirmed'&&r.session.status==='published'&&this.future(r)));
  protected readonly ordered=computed(()=>{const n=this.next();return n?[n,...this.reservations().filter(r=>r.id!==n.id)]:this.reservations();});
  constructor(){afterNextRender(()=>{void this.load();});}
  protected date(r:Reservation){return workshopDate(r.session,this.language.lang());}
  protected future(r:Reservation){return Date.parse(r.session.startsAt)>Date.now();}
  protected topicPath(r:Reservation){const index=TOPICS.indexOf(r.session.topic);return this.language.detail('talleres',workshops[this.language.lang()][index].slug);}
  protected async load(){const id=this.client.session.user()?.id;this.loading.set(true);this.error.set(false);try{const [data,prep]=await Promise.all([this.client.request<{reservations:Reservation[]}>('mine'),this.client.request<{completed:boolean}>('preparation')]);if(id===this.client.session.user()?.id){this.reservations.set(data.reservations);this.prepared.set(prep.completed);}}catch{this.error.set(true);}finally{this.loading.set(false);}}
  protected async cancel(r:Reservation){this.busy.set(true);try{await this.client.request('mine','POST',{id:r.id,action:'cancel'});this.confirmId.set('');await this.load();}catch{this.error.set(true);}finally{this.busy.set(false);}}
}

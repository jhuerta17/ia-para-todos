import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../shared/icon';
import { ActionButton } from '../shared/action-button';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Language } from '../i18n/language';
import { workshops } from '../data/workshops';
import { TOPICS, type Reservation } from './workshop-types';
import { WorkshopClient } from './workshop-client';
import { WorkshopSchedule } from './workshop-schedule';
import { workshopCopy } from './workshop-copy';
import { workshopDate } from './workshop-format';
@Component({selector:'app-workshop-student',imports:[RouterLink,WorkshopSchedule,Icon,ActionButton],styleUrl:'./workshop-student.css',templateUrl:'./workshop-student.html'})
export class WorkshopStudent {
  private readonly document=inject(DOCUMENT);
  protected dismissCancellation(id:string):void {
    this.confirmId.set('');
    this.document.getElementById(`cancel-trigger-${id}`)?.focus();
  }
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

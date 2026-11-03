import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Language } from '../i18n/language';
import { DemoState } from '../admin/data/demo-state';
import { WorkshopClient } from './workshop-client';
import { readDemoBooking, saveDemoBooking } from './workshop-demo';
import { workshopCopy } from './workshop-copy';
import { workshopDate } from './workshop-format';
import type { Reservation } from './workshop-types';
@Component({selector:'app-workshop-manage',imports:[RouterLink],styleUrl:'./workshop.css',template:`
<main id="main-content" tabindex="-1" class="workshop-shell">
<header class="ws-heading"><h1>{{c().manage}}</h1></header>
@if(loading()){<p role="status">{{c().loading}}</p>}
@if(error()){<p role="alert" class="ws-error">{{error()}}</p><button type="button" class="ws-button secondary" (click)="act('read')">{{c().retry}}</button><p><a [routerLink]="language.path('contacto')">{{en()?'Contact the team':'Contacta al equipo'}}</a></p>}
@if(reservation();as r){<article class="ws-card ws-private"><h2>{{r.status==='cancelled'?c().cancelled:r.session.status==='cancelled'?c().sessionCancelled:c().confirmed}}</h2><h3>{{en()?r.session.titleEn:r.session.titleEs}}</h3><p class="ws-date">{{date(r)}}</p><p>{{r.session.venue}} · {{r.session.address}}</p><h3>{{c().accessibility}}</h3><p>{{en()?r.session.accessibilityEn:r.session.accessibilityEs}}</p><h3>{{c().bring}}</h3><p>{{en()?r.session.bringEn:r.session.bringEs}}</p><p>{{c().reference}}: {{r.reference}}</p><p>{{c().manual}}</p><p>{{c().save}}</p><p class="ws-token">{{privateLink}}</p>
<div class="ws-row ws-no-print"><button type="button" class="ws-button secondary" (click)="print()">{{c().print}}</button>
@if(r.status==='confirmed'&&r.session.status!=='cancelled'){
@if(confirmCancel()){<p>{{c().cancelQuestion}}</p><button type="button" class="ws-button" [disabled]="loading()" (click)="act('cancel')">{{c().yes}}</button><button type="button" class="ws-button secondary" (click)="confirmCancel.set(false)">{{c().back}}</button>}
@else{<button type="button" class="ws-button secondary" (click)="confirmCancel.set(true)">{{c().cancel}}</button>}}
</div>
@if(r.status==='confirmed'){
@if(client.session.user()){@if(!r.linked){<button type="button" class="ws-button" [disabled]="loading()" (click)="act('attach')">{{c().attach}}</button>}@else{<p>{{c().linked}}</p><a routerLink="/portal">{{c().myReservations}}</a>}}
@else{<p>{{c().account}}</p><p>{{en()?'After signing in, reopen your saved private link to attach this reservation.':'Después de iniciar sesión, vuelve a abrir tu enlace privado guardado para vincular esta reserva.'}}</p><div class="ws-row"><a routerLink="/portal/sign-up" >{{c().signup}}</a><a routerLink="/portal/sign-in" [fragment]="loginFragment">{{c().signin}}</a></div>}}
<p><a [routerLink]="en()?'/en/preparation':'/preparacion'">{{c().preparation}}</a></p></article>}
</main>`})
export class WorkshopManage {
  protected readonly language=inject(Language);
  protected readonly en=computed(()=>this.language.lang()==='en');
  protected readonly c=computed(()=>workshopCopy[this.language.lang()]);
  protected readonly client=inject(WorkshopClient);
  protected readonly demo=inject(DemoState).enabled;
  private readonly document=inject(DOCUMENT);
  protected readonly reservation=signal<Reservation|null>(null);
  protected readonly error=signal('');protected readonly loading=signal(true);protected readonly confirmCancel=signal(false);
  private token='';protected privateLink='';protected loginFragment='';
  constructor(){afterNextRender(()=>{this.token=this.document.location.hash.slice(1);this.loginFragment=`booking=${this.token}`;this.privateLink=this.document.location.href;void this.init();});}
  private async init(){await this.client.session.restore();await this.act('read');}
  protected date(r:Reservation){return workshopDate(r.session,this.language.lang());}
  protected async act(action:string){
    this.loading.set(true);this.error.set('');
    if(this.demo()){
      const booking=readDemoBooking(this.token);
      if(booking){
        const updated:Reservation=action==='cancel'?{...booking.reservation,status:'cancelled'}:action==='attach'?{...booking.reservation,linked:true}:booking.reservation;
        saveDemoBooking({token:booking.token,reservation:updated});
        this.reservation.set(updated);this.confirmCancel.set(false);
        this.loading.set(false);return;
      }
    }
    try{this.reservation.set(await this.client.request<Reservation>('manage','POST',{token:this.token,action}));this.confirmCancel.set(false);}catch(e){this.error.set((e as Error).message==='already_reserved'?this.c().duplicate:action==='read'?this.c().unavailable:this.c().error);}finally{this.loading.set(false);}}
  protected print(){this.document.defaultView?.print();}
}

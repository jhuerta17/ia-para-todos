import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Icon } from '../shared/icon';
import { ActionButton } from '../shared/action-button';
import { RouterLink } from '@angular/router';
import { Language } from '../i18n/language';
import { WorkshopClient } from './workshop-client';
import { workshopCopy } from './workshop-copy';
import { workshopDate } from './workshop-format';
import type { Reservation } from './workshop-types';
@Component({selector:'app-workshop-manage',imports:[RouterLink,Icon,ActionButton],styleUrl:'./workshop.css',template:`
<main id="main-content" tabindex="-1" class="workshop-shell booking-flow">
<header class="ws-heading"><h1>{{c().manage}}</h1></header>
@if(loading()){<p class="booking-state" role="status">{{c().loading}}</p>}
@if(error()){<p role="alert" class="ws-error booking-state">{{error()}}</p><button type="button" class="booking-utility" (click)="act('read')">{{c().retry}}</button><p><a [routerLink]="language.path('contacto')">{{en()?'Contact the team':'Contacta al equipo'}}</a></p>}
@if(reservation();as r){<article class="booking-result" aria-live="polite">
<h2 class="booking-status">{{r.status==='cancelled'?c().cancelled:r.session.status==='cancelled'?c().sessionCancelled:c().confirmed}}</h2>
<div class="booking-layout"><section class="booking-summary"><h2>{{en()?r.session.titleEn:r.session.titleEs}}</h2><p class="booking-fact"><app-icon name="calendar-event"/>{{date(r)}}</p><p class="booking-fact"><app-icon name="map-pin"/><span>{{r.session.venue}}<br/>{{r.session.address}}</span></p><dl class="booking-reference"><dt>{{c().reference}}</dt><dd>{{r.reference}}</dd></dl></section>
<div class="booking-details"><section><h2>{{c().bring}}</h2><p>{{en()?r.session.bringEn:r.session.bringEs}}</p></section><section class="booking-divider"><h2>{{c().accessibility}}</h2><p>{{en()?r.session.accessibilityEn:r.session.accessibilityEs}}</p></section><section class="booking-divider"><h2>{{c().link}}</h2><p>{{c().save}}</p><label class="booking-link-label" for="manage-link">{{c().link}}</label><input id="manage-link" class="ws-link" readonly [value]="privateLink" (focus)="$any($event.target).select()"/><p class="ws-token booking-print-link">{{privateLink}}</p><p class="ws-note">{{c().manual}}</p>
<div class="ws-row ws-no-print"><button type="button" class="booking-utility" (click)="print()">{{c().print}}</button>
@if(r.status==='confirmed'&&r.session.status!=='cancelled'){
@if(confirmCancel()){<p>{{c().cancelQuestion}}</p><button type="button" appActionButton [disabled]="loading()" (click)="act('cancel')">{{c().yes}}</button><button type="button" class="booking-utility" (click)="confirmCancel.set(false)">{{c().back}}</button>}
@else{<button type="button" class="booking-utility" (click)="confirmCancel.set(true)">{{c().cancel}}</button>}}
</div>
</section></div></div><aside class="booking-next ws-no-print"><h2>{{c().preparation}}</h2><p>{{c().prepLead}}</p><a appActionButton class="action-warm" [routerLink]="en()?'/en/preparation':'/preparacion'">{{c().preparation}}</a><div class="booking-account">
@if(r.status==='confirmed'){
@if(client.session.user()){@if(!r.linked){<button type="button" appActionButton [disabled]="loading()" (click)="act('attach')">{{c().attach}}</button>}@else{<p>{{c().linked}}</p><a routerLink="/portal">{{c().myReservations}}</a>}}
@else{<p>{{c().account}}</p><p>{{en()?'After signing in, reopen your saved private link to attach this reservation.':'Después de iniciar sesión, vuelve a abrir tu enlace privado guardado para vincular esta reserva.'}}</p><div class="ws-row"><a routerLink="/portal/sign-up" >{{c().signup}}</a><a routerLink="/portal/sign-in" [fragment]="loginFragment">{{c().signin}}</a></div>}}
</div></aside></article>}
</main>`})
export class WorkshopManage {
  protected readonly language=inject(Language);
  protected readonly en=computed(()=>this.language.lang()==='en');
  protected readonly c=computed(()=>workshopCopy[this.language.lang()]);
  protected readonly client=inject(WorkshopClient);
  private readonly document=inject(DOCUMENT);
  protected readonly reservation=signal<Reservation|null>(null);
  protected readonly error=signal('');protected readonly loading=signal(true);protected readonly confirmCancel=signal(false);
  private token='';protected privateLink='';protected loginFragment='';
  constructor(){afterNextRender(()=>{this.token=this.document.location.hash.slice(1);this.loginFragment=`booking=${this.token}`;this.privateLink=this.document.location.href;void this.init();});}
  private async init(){await this.client.session.restore();await this.act('read');}
  protected date(r:Reservation){return workshopDate(r.session,this.language.lang());}
  protected async act(action:string){
    this.loading.set(true);this.error.set('');
    try{this.reservation.set(await this.client.request<Reservation>('manage','POST',{token:this.token,action}));this.confirmCancel.set(false);}catch(e){this.error.set((e as Error).message==='already_reserved'?this.c().duplicate:action==='read'?this.c().unavailable:this.c().error);}finally{this.loading.set(false);}}
  protected print(){this.document.defaultView?.print();}
}

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Language } from '../../../i18n/language';
import { PortalClient } from '../../store/portal-client';
import { UserSession } from '../../session/user-session';
@Component({selector:'app-portal-account',imports:[RouterLink],template:`
<section class="card"><h1>{{en()?'My account':'Mi cuenta'}}</h1>
<p>{{en()?'Course progress stays in your account until deletion. Chats expire 30 days after creation; you can delete them earlier from Practice.':'El progreso se conserva hasta que elimines tu cuenta. Las conversaciones vencen 30 días después de crearse; puedes borrarlas antes desde Práctica.'}}</p>
<p><a [routerLink]="language.path('privacidad')">{{en()?'Privacy notice':'Aviso de privacidad'}}</a></p>
@if(session.isAdmin()){<p>{{en()?'Administrator accounts must be managed in the Identity dashboard.':'Las cuentas administrativas se gestionan desde el panel de Identity.'}}</p>}
@else if(confirming()){<p>{{en()?'This permanently removes your saved learning data and requests deletion of your login. Login deletion is retried daily; a service outage can take longer.':'Esto elimina tus datos de aprendizaje y solicita borrar tu acceso. El borrado del acceso se reintenta diariamente; una falla del servicio puede demorar el proceso.'}}</p>
<button type="button" (click)="remove()" [disabled]="busy()">{{en()?'Permanently delete my account':'Eliminar mi cuenta definitivamente'}}</button><button type="button" (click)="confirming.set(false)">{{en()?'Cancel':'Cancelar'}}</button>}
@else{<button type="button" (click)="confirming.set(true)">{{en()?'Delete my account':'Eliminar mi cuenta'}}</button>}
@if(failed()){<p role="alert">{{en()?'Could not request deletion. Please try again.':'No pudimos solicitar el borrado. Inténtalo de nuevo.'}}</p>}</section>`,styleUrls:['../portal-card.css']})
export class PortalAccount {
  protected readonly language=inject(Language);
  protected readonly en=computed(()=>this.language.lang()==='en');
  protected readonly session=inject(UserSession);
  private readonly client=inject(PortalClient);
  protected readonly confirming=signal(false);
  protected readonly busy=signal(false);
  protected readonly failed=signal(false);
  protected async remove():Promise<void>{
    if(this.busy())return;this.busy.set(true);this.failed.set(false);
    try{await this.client.request('account','DELETE');await this.session.signOut();}
    catch{this.failed.set(true);}finally{this.busy.set(false);}
  }
}

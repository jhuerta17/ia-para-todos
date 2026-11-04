import { Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Icon } from '../../../shared/icon';
import { RouterLink } from '@angular/router';
import { Language } from '../../../i18n/language';
import { PortalClient } from '../../store/portal-client';
import { UserSession } from '../../session/user-session';
@Component({selector:'app-portal-account',imports:[RouterLink,Icon],templateUrl:'./portal-account.html',styleUrl:'./portal-account.css'})
export class PortalAccount {
  private readonly document=inject(DOCUMENT);
  protected dismissDeletion():void {this.confirming.set(false);this.document.getElementById('account-delete-trigger')?.focus();}
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

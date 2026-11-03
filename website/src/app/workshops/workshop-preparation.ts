import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { ActionButton } from '../shared/action-button';
import { Icon } from '../shared/icon';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Language } from '../i18n/language';
import { DemoState } from '../admin/data/demo-state';
import { WorkshopClient } from './workshop-client';
import { workshopCopy } from './workshop-copy';
const DEMO_PREP_KEY = 'workshop-demo-prep';
@Component({selector:'app-workshop-preparation',imports:[RouterLink,ActionButton,Icon],styleUrls:['./workshop.css','./workshop-public.css','./workshop-preparation.css'],templateUrl:'./workshop-preparation.html'})
export class WorkshopPreparation {
  private readonly document=inject(DOCUMENT);
  protected sectionLink(id:string):string {
    const path=this.document.location?.pathname ?? (this.en()?'/en/preparation':'/preparacion');
    return `${path}${this.document.location?.search ?? ''}#${id}`;
  }
  protected jumpTo(id:string,event:MouseEvent):void {
    if(event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
    const section=this.document.getElementById(id);
    if(!section)return;
    event.preventDefault();
    section.scrollIntoView({block:'start'});
    section.focus({preventScroll:true});
  }
  protected readonly language=inject(Language);protected readonly en=computed(()=>this.language.lang()==='en');protected readonly c=computed(()=>workshopCopy[this.language.lang()]);
  protected readonly client=inject(WorkshopClient);protected readonly demo=inject(DemoState).enabled;protected readonly completed=signal(false);protected readonly busy=signal(false);protected readonly error=signal(false);
  constructor(){afterNextRender(()=>{void this.load();});}
  private async load(){await this.client.session.restore();if(!this.client.session.user())return;if(this.demo()){try{this.completed.set(sessionStorage.getItem(DEMO_PREP_KEY)==='1');}catch{this.completed.set(false);}return;}try{this.completed.set((await this.client.request<{completed:boolean}>('preparation')).completed);}catch{this.error.set(true);}}
  protected async complete(){if(this.demo()){try{sessionStorage.setItem(DEMO_PREP_KEY,'1');}catch{/* private mode: demo prep stays memory-only */}this.completed.set(true);return;}this.busy.set(true);this.error.set(false);try{this.completed.set((await this.client.request<{completed:boolean}>('preparation','POST',{})).completed);}catch{this.error.set(true);}finally{this.busy.set(false);}}
}

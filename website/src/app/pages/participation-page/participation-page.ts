import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { ParticipationSection } from '../../shared/participation-section/participation-section';
import { FaqSection } from '../../shared/faq-section/faq-section';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy: Record<Lang, { communityTitle: string; communityLead: string; community: string[]; workshopsTitle: string; workshopsLead: string; workshops: string[] }> = {
  es: {
    communityTitle: 'Aprender en comunidad',
    communityLead: 'Todas las personas son bienvenidas. Queremos aprender juntos y acompañar a quienes dan sus primeros pasos con la tecnología.',
    community: [
      'La iniciativa es inclusiva y no sectaria; los talleres no contienen contenido religioso. Puedes expresar tu interés en facilitar, acompañar, traducir o difundir.',
      'El formulario de abajo es una práctica local. Usa datos inventados: nada se envía, se guarda, te suscribe ni te registra como participante o colaborador.',
    ],
    workshopsTitle: 'Participa',
    workshopsLead: 'Explora cómo participar en un taller.',
    workshops: ['El formulario es una práctica local. Usa datos inventados: nada se envía, se guarda, te suscribe ni te registra. Los talleres son gratuitos y usan herramientas gratuitas.'],
  },
  en: {
    communityTitle: 'Learn in community',
    communityLead: 'Everyone is welcome. We want to learn together and support people taking their first steps with technology.',
    community: [
      'The initiative is inclusive and nonsectarian; workshops contain no religious content. You can express your interest in facilitating, guiding, translating, or sharing.',
      'The form below is a local practice. Use made-up data: nothing is sent, saved, subscribed, or registered as a participant or collaborator.',
    ],
    workshopsTitle: 'Participate',
    workshopsLead: 'Explore how to take part in a workshop.',
    workshops: ['The form is a local practice. Use made-up data: nothing is sent, saved, subscribed, or registered. Workshops are free and use free tools.'],
  },
};

@Component({selector: 'app-participation-page', imports: [PageIntro, ParticipationSection, FaqSection], template: `<main id="main-content" tabindex="-1"><app-page-intro [title]="title()" [lead]="lead()" [paragraphs]="paragraphs()" /><app-participation-section [page]="true" [context]="community() ? 'community' : 'workshops'" /><app-faq-section /></main>`, styles: `main:focus { outline: none; }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class ParticipationPage {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  private readonly language = inject(Language);
  protected readonly community = computed(() => !!this.data()['community']);
  protected readonly title = computed(() => this.community() ? copy[this.language.lang()].communityTitle : copy[this.language.lang()].workshopsTitle);
  protected readonly lead = computed(() => this.community() ? copy[this.language.lang()].communityLead : copy[this.language.lang()].workshopsLead);
  protected readonly paragraphs = computed(() => this.community() ? copy[this.language.lang()].community : copy[this.language.lang()].workshops);
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

const copy = {
  es: { heading: 'Nuestra organización', lead: 'Tres datos sobre quiénes somos.' },
  en: { heading: 'Our organization', lead: 'Three facts about who we are.' },
};

const facts: Record<Lang, { term: string; detail: string }[]> = {
  es: [
    { term: 'Organización sin fines de lucro', detail: 'En operación activa al servicio de la comunidad.' },
    { term: 'Talleres en marcha', detail: 'Sesiones gratuitas y alianzas comunitarias activas.' },
    { term: 'Gratis, siempre', detail: 'Sostenido por empresas y donaciones externas.' },
  ],
  en: [
    { term: 'Nonprofit organization', detail: 'In active operation serving the community.' },
    { term: 'Workshops in operation', detail: 'Free sessions and active community partnerships.' },
    { term: 'Free, always', detail: 'Sustained by companies and outside donations.' },
  ],
};

@Component({selector: 'app-status-strip', imports: [RevealOnEnter], templateUrl: './status-strip.html', styleUrl: './status-strip.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class StatusStrip {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly facts = computed(() => facts[this.language.lang()]);
}

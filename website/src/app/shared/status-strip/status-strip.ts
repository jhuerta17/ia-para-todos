import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

const copy = {
  es: { heading: 'Dónde estamos hoy', lead: 'Tres datos honestos antes de seguir leyendo.' },
  en: { heading: 'Where we are today', lead: 'Three honest facts before you read on.' },
};

const facts: Record<Lang, { term: string; detail: string }[]> = {
  es: [
    { term: 'Iniciativa comunitaria', detail: 'Aún no somos una organización sin fines de lucro registrada.' },
    { term: 'Etapa exploratoria', detail: 'Sin talleres oficiales ni alianzas formales todavía.' },
    { term: 'Gratis, siempre', detail: 'Sostenido por empresas y donaciones externas.' },
  ],
  en: [
    { term: 'Community initiative', detail: 'Not a registered nonprofit organization yet.' },
    { term: 'Exploratory stage', detail: 'No official workshops or formal partnerships yet.' },
    { term: 'Free, always', detail: 'Sustained by companies and outside donations.' },
  ],
};

@Component({selector: 'app-status-strip', imports: [RevealOnEnter], templateUrl: './status-strip.html', styleUrl: './status-strip.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class StatusStrip {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly facts = computed(() => facts[this.language.lang()]);
}

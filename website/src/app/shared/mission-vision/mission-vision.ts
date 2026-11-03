import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

const copy = {
  es: { heading: 'Misión y visión', lead: 'Lo que nos mueve y hacia dónde vamos.' },
  en: { heading: 'Mission and vision', lead: 'What moves us and where we are headed.' },
};

const statements: Record<Lang, { label: string; text: string }[]> = {
  es: [
    { label: 'Nuestra misión', text: 'Reducir la brecha digital mediante talleres gratuitos, accesibles y prácticos que ayuden a las comunidades a comprender y aprovechar la inteligencia artificial y las nuevas tecnologías.' },
    { label: 'Nuestra visión', text: 'Un futuro donde todas las personas, sin importar su idioma, edad o experiencia tecnológica, tengan la oportunidad de aprender, adaptarse y beneficiarse de la inteligencia artificial.' },
  ],
  en: [
    { label: 'Our mission', text: 'To reduce the digital divide through free, accessible, and practical workshops that empower communities to understand and use artificial intelligence and emerging technologies.' },
    { label: 'Our vision', text: 'A future where everyone, regardless of language, age, or technological experience, has the opportunity to learn, adapt, and benefit from artificial intelligence.' },
  ],
};

@Component({selector: 'app-mission-vision', imports: [Icon, RevealOnEnter], templateUrl: './mission-vision.html', styleUrl: './mission-vision.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class MissionVision {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly statements = computed(() => statements[this.language.lang()]);
}

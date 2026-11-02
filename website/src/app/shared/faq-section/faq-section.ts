import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy = {
  es: { heading: 'Preguntas frecuentes', lead: 'Antes de empezar, resolvamos algunas dudas.' },
  en: { heading: 'Frequently asked questions', lead: 'Before you start, let’s clear up a few doubts.' },
};

const questions: Record<Lang, { question: string; answer: string }[]> = {
  es: [
    { question: '¿Tienen costo los talleres o los cursos?', answer: 'No. Los talleres y cursos son gratuitos para la comunidad y seguirán siéndolo; solo usan herramientas gratuitas.' },
    { question: '¿Necesito experiencia previa?', answer: 'No. Las sesiones están pensadas para principiantes, con instrucciones paso a paso. Ofrecemos orientación adicional para quienes necesiten ayuda con lo básico del teléfono.' },
    { question: '¿Qué equipo necesito?', answer: 'Solo un teléfono inteligente; no se necesita computadora. Para quienes no tengan cuenta o internet confiable, ofrecemos demostraciones guiadas, dispositivos compartidos o materiales impresos.' },
    { question: '¿La IA se equivoca? ¿Cómo cuido mis datos?', answer: 'Sí, la IA puede inventar respuestas con seguridad. Por eso recomendamos verificar lo importante por otro medio. Las prácticas usan datos inventados: nunca información personal, médica, financiera, migratoria o legal real.' },
    { question: '¿Cuándo empiezan los talleres?', answer: 'Cada taller se anuncia con su fecha y sede. Revisa la página de talleres para ver los temas disponibles.' },
  ],
  en: [
    { question: 'Do the workshops or courses cost anything?', answer: 'No. Workshops and courses are free for the community and will stay that way; they only use free tools.' },
    { question: 'Do I need previous experience?', answer: 'No. Sessions are designed for beginners, with step-by-step instructions. We offer extra guidance for anyone who needs help with phone basics.' },
    { question: 'What equipment do I need?', answer: 'Only a smartphone; no computer needed. For anyone without an account or reliable internet, we offer guided demonstrations, shared devices, or printed materials.' },
    { question: 'Does AI make mistakes? How do I protect my data?', answer: 'Yes, AI can invent answers with confidence. That is why we recommend verifying important things another way. Practices use made-up data: never real personal, medical, financial, immigration, or legal information.' },
    { question: 'When do the workshops start?', answer: 'Each workshop is announced with its date and venue. Check the workshops page for the available topics.' },
  ],
};

export interface FaqItem {
  question: string;
  answer: string;
}

@Component({selector: 'app-faq-section', imports: [Icon, RevealOnEnter], templateUrl: './faq-section.html', styleUrl: './faq-section.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class FaqSection {
  /** Optional overrides; when omitted, the section shows the default workshop FAQ. */
  readonly heading = input<string>();
  readonly lead = input<string>();
  readonly items = input<FaqItem[]>();
  protected readonly open = signal<number | null>(null);
  private readonly language = inject(Language);
  protected readonly c = computed(() => ({
    heading: this.heading() ?? copy[this.language.lang()].heading,
    lead: this.lead() ?? copy[this.language.lang()].lead,
  }));
  protected readonly questions = computed(() => this.items() ?? questions[this.language.lang()]);
  protected toggle(index: number): void { this.open.update(current => current === index ? null : index); }
}

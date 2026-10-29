import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
    { question: '¿Tienen costo los talleres?', answer: 'No. Son gratuitos y solo usan herramientas gratuitas.' },
    { question: '¿Necesito experiencia previa?', answer: 'No. Las sesiones están pensadas para principiantes, con instrucciones paso a paso. Ofrecemos orientación adicional para quienes necesiten ayuda con lo básico del teléfono.' },
    { question: '¿Qué equipo necesito?', answer: 'Solo un teléfono inteligente; no se necesita computadora. Para quienes no tengan cuenta o internet confiable, ofrecemos demostraciones guiadas, dispositivos compartidos o materiales impresos.' },
    { question: '¿La IA se equivoca? ¿Cómo cuido mis datos?', answer: 'Sí, la IA puede inventar respuestas con seguridad. Por eso recomendamos verificar lo importante por otro medio. Las prácticas usan datos inventados: nunca información personal, médica, financiera, migratoria o legal real.' },
    { question: '¿Cuándo empiezan los talleres?', answer: 'Cada taller se anuncia con su fecha y sede. Revisa la página de talleres para ver los temas disponibles.' },
  ],
  en: [
    { question: 'Do the workshops cost anything?', answer: 'No. They are free and only use free tools.' },
    { question: 'Do I need previous experience?', answer: 'No. Sessions are designed for beginners, with step-by-step instructions. We offer extra guidance for anyone who needs help with phone basics.' },
    { question: 'What equipment do I need?', answer: 'Only a smartphone; no computer needed. For anyone without an account or reliable internet, we offer guided demonstrations, shared devices, or printed materials.' },
    { question: 'Does AI make mistakes? How do I protect my data?', answer: 'Yes, AI can invent answers with confidence. That is why we recommend verifying important things another way. Practices use made-up data: never real personal, medical, financial, immigration, or legal information.' },
    { question: 'When do the workshops start?', answer: 'Each workshop is announced with its date and venue. Check the workshops page for the available topics.' },
  ],
};

@Component({selector: 'app-faq-section', imports: [Icon, RevealOnEnter], templateUrl: './faq-section.html', styleUrl: './faq-section.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class FaqSection {
  protected readonly open = signal<number | null>(null);
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly questions = computed(() => questions[this.language.lang()]);
  protected toggle(index: number): void { this.open.update(current => current === index ? null : index); }
}

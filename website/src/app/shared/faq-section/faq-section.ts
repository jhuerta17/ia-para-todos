import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
@Component({selector: 'app-faq-section', imports: [Icon, RevealOnEnter], templateUrl: './faq-section.html', styleUrl: './faq-section.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class FaqSection {
  protected readonly open = signal<number | null>(null);
  protected readonly questions = [
    { question: '¿Tienen costo los talleres?', answer: 'El plan es que sean gratuitos y que solo usen herramientas gratuitas. Aún no hay talleres programados.' },
    { question: '¿Necesito experiencia previa?', answer: 'No. Las sesiones están pensadas para principiantes, con instrucciones paso a paso. Proponemos orientación adicional para quienes necesiten ayuda con lo básico del teléfono.' },
    { question: '¿Qué equipo necesito?', answer: 'Solo un teléfono inteligente; no se necesita computadora. Para quienes no tengan cuenta o internet confiable, contemplamos demostraciones guiadas, dispositivos compartidos o materiales impresos.' },
    { question: '¿La IA se equivoca? ¿Cómo cuido mis datos?', answer: 'Sí, la IA puede inventar respuestas con seguridad. Por eso proponemos verificar lo importante por otro medio. Las prácticas usarían datos inventados: nunca información personal, médica, financiera, migratoria o legal real.' },
    { question: '¿Cuándo empiezan los talleres?', answer: 'Estamos en etapa exploratoria: aún no realizamos talleres oficiales, no hay sedes confirmadas ni alianzas formales, y no somos una organización sin fines de lucro registrada. El siguiente paso previsto es validar el programa con pequeños talleres piloto.' },
  ];
  protected toggle(index: number): void { this.open.update(current => current === index ? null : index); }
}

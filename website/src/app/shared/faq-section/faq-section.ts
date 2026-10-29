import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
@Component({selector: 'app-faq-section', imports: [Icon, RevealOnEnter], templateUrl: './faq-section.html', styleUrl: './faq-section.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class FaqSection {
  protected readonly open = signal<number | null>(null);
  protected readonly questions = [
    { question: '¿Tienen costo los talleres?', answer: 'No. Son gratuitos y solo usan herramientas gratuitas.' },
    { question: '¿Necesito experiencia previa?', answer: 'No. Las sesiones están pensadas para principiantes, con instrucciones paso a paso. Ofrecemos orientación adicional para quienes necesiten ayuda con lo básico del teléfono.' },
    { question: '¿Qué equipo necesito?', answer: 'Solo un teléfono inteligente; no se necesita computadora. Para quienes no tengan cuenta o internet confiable, ofrecemos demostraciones guiadas, dispositivos compartidos o materiales impresos.' },
    { question: '¿La IA se equivoca? ¿Cómo cuido mis datos?', answer: 'Sí, la IA puede inventar respuestas con seguridad. Por eso recomendamos verificar lo importante por otro medio. Las prácticas usan datos inventados: nunca información personal, médica, financiera, migratoria o legal real.' },
    { question: '¿Cuándo empiezan los talleres?', answer: 'Cada taller se anuncia con su fecha y sede. Revisa la página de talleres para ver los temas disponibles.' },
  ];
  protected toggle(index: number): void { this.open.update(current => current === index ? null : index); }
}

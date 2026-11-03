import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icon, IconName } from '../../shared/icon';
import { PageCover } from '../../shared/page-cover/page-cover';
import { ParticipationSection } from '../../shared/participation-section/participation-section';
import { FaqItem, FaqSection } from '../../shared/faq-section/faq-section';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy: Record<Lang, { coverAlt: string; title: string; summary: string; waysHeading: string; waysLead: string; ways: { icon: IconName; title: string; description: string }[]; waysNote: string; faqHeading: string; faqLead: string; faq: FaqItem[] }> = {
  es: {
    coverAlt: 'Personas colaborando en comunidad.',
    title: 'Donar',
    summary: 'Los cursos y talleres son gratuitos para la comunidad, hoy y siempre. Tu apoyo lo hace posible.',
    waysHeading: 'Formas de apoyar',
    waysLead: 'Elige la forma que prefieras y completa el formulario: te contactamos para coordinar cada donación.',
    ways: [
      { icon: 'users', title: 'Donación individual', description: 'Aporta como persona y ayuda a mantener los cursos gratuitos.' },
      { icon: 'sparkles', title: 'Patrocinio empresarial', description: 'Tu empresa puede financiar talleres y cursos en la comunidad.' },
      { icon: 'clipboard-check', title: 'Apoyo en especie', description: 'Espacios, equipos o tiempo también mantienen nuestra misión.' },
    ],
    waysNote: 'Coordinamos cada donación por contacto directo; este sitio no procesa pagos.',
    faqHeading: 'Preguntas sobre donaciones',
    faqLead: 'Cómo se usan los fondos y qué esperar al donar.',
    faq: [
      { question: '¿A dónde va mi donación?', answer: 'A mantener gratuitos los cursos y talleres: materiales, sedes y acompañamiento en la comunidad.' },
      { question: '¿Los cursos seguirán siendo gratuitos?', answer: 'Sí. Todos los cursos son gratuitos para la comunidad y seguirán siéndolo; las donaciones y patrocinios cubren los costos.' },
      { question: '¿Puedo donar como empresa?', answer: 'Sí. Elige “Patrocinio empresarial” en el formulario y te contactamos para coordinar.' },
      { question: '¿Recibo un comprobante?', answer: 'Sí. Te contactamos para coordinar cada donación y te emitimos un comprobante por tu aportación.' },
    ],
  },
  en: {
    coverAlt: 'People collaborating in community.',
    title: 'Donate',
    summary: 'Courses and workshops are free for the community, today and always. Your support makes it possible.',
    waysHeading: 'Ways to support',
    waysLead: 'Choose the way you prefer and complete the form: we will contact you to coordinate each donation.',
    ways: [
      { icon: 'users', title: 'Individual donation', description: 'Give as a person and help keep courses free.' },
      { icon: 'sparkles', title: 'Company sponsorship', description: 'Your company can fund workshops and courses in the community.' },
      { icon: 'clipboard-check', title: 'In-kind support', description: 'Venues, equipment, or time also keep our mission going.' },
    ],
    waysNote: 'We coordinate each donation through direct contact; this site does not process payments.',
    faqHeading: 'Questions about donations',
    faqLead: 'How funds are used and what to expect when you donate.',
    faq: [
      { question: 'Where does my donation go?', answer: 'To keeping courses and workshops free: materials, venues, and guidance in the community.' },
      { question: 'Will courses stay free?', answer: 'Yes. Every course is free for the community and will stay that way; donations and sponsorships cover the costs.' },
      { question: 'Can I donate as a company?', answer: 'Yes. Choose “Company sponsorship” in the form and we will contact you to coordinate.' },
      { question: 'Do I get a receipt?', answer: 'Yes. We contact you to coordinate each donation and provide a receipt for your contribution.' },
    ],
  },
};

@Component({selector: 'app-donate', imports: [Icon, PageCover, ParticipationSection, FaqSection, RevealOnEnter], templateUrl: './donate.html', styleUrl: './donate.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class Donate {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}

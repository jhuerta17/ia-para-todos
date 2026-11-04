import { InPageLink } from '../../shared/in-page-link';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Icon, IconName } from '../../shared/icon';
import { ActionLink } from '../../shared/action-link';
import { PageCover } from '../../shared/page-cover/page-cover';
import { WorkshopSection } from '../../shared/workshop-section/workshop-section';
import { ValuesSection } from '../../shared/values-section/values-section';
import { ParticipationContext, ParticipationSection } from '../../shared/participation-section/participation-section';
import { FaqItem, FaqSection } from '../../shared/faq-section/faq-section';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

interface ModeCopy {
  coverImage: string;
  coverIcon: IconName;
  coverAlt: string;
  title: string;
  summary: string;
  panelHeading: string;
  panelLead: string;
  promises: string[];
  explore: { to: string; label: string }[];
  formTitle: string;
  formDescription: string;
  formLink: string;
  cards: { icon: IconName; title: string; description: string }[];
  faqHeading: string;
  faqLead: string;
  faq: FaqItem[];
}

const copy: Record<Lang, Record<'community' | 'workshops', ModeCopy>> = {
  es: {
    workshops: {
      coverImage: 'workshop-guidance',
      coverIcon: 'book',
      coverAlt: 'Acompañamiento durante un taller comunitario.',
      title: 'Participa',
      summary: 'Talleres gratuitos en español para aprender IA desde cero, con tu teléfono y a tu ritmo.',
      panelHeading: 'Qué esperar',
      panelLead: 'Sesiones para principiantes, en español y sin costo: ven con curiosidad, nosotros ponemos el resto.',
      promises: ['Talleres gratuitos, hoy y siempre.', 'Solo necesitas un teléfono inteligente.', 'Aprendes paso a paso, sin experiencia previa.'],
      explore: [{ to: '/talleres', label: 'Ver talleres' }, { to: '/comunidad', label: 'Conocer la comunidad' }],
      formTitle: 'Reserva tu lugar',
      formDescription: 'Elige tu tema y completa el formulario: te contactamos con los detalles.',
      formLink: 'Ir al formulario',
      cards: [
        { icon: 'sparkles', title: 'Sin costo', description: 'Talleres gratuitos que usan solo herramientas gratuitas.' },
        { icon: 'device-mobile', title: 'Solo tu teléfono', description: 'No necesitas computadora: todo se practica con el teléfono.' },
        { icon: 'users', title: 'Desde cero', description: 'Instrucciones paso a paso para quienes empiezan.' },
        { icon: 'map-pin', title: 'Dallas–Fort Worth', description: 'Zona de enfoque: cada taller anuncia su sede al confirmarse.' },
      ],
      faqHeading: 'Preguntas sobre participar',
      faqLead: 'Costos, requisitos y cómo unirte a un taller.',
      faq: [
        { question: '¿Cuánto cuesta participar?', answer: 'Nada. Los talleres son gratuitos para la comunidad y seguirán siéndolo; solo usan herramientas gratuitas.' },
        { question: '¿Necesito experiencia con tecnología?', answer: 'No. Las sesiones están pensadas para principiantes, con instrucciones paso a paso y acompañamiento a tu ritmo.' },
        { question: '¿Qué necesito llevar?', answer: 'Solo un teléfono inteligente; no se necesita computadora. Si no tienes cuenta o internet confiable, ofrecemos demostraciones guiadas o materiales impresos.' },
        { question: '¿En qué idioma son los talleres?', answer: 'En español. Todo el sitio y cada sesión están disponibles en español e inglés.' },
        { question: '¿Cómo me anoto en un taller?', answer: 'Elige tu tema en el formulario de esta página y te contactamos con la fecha y la sede cuando se confirmen.' },
      ],
    },
    community: {
      coverImage: 'neighbor-support',
      coverIcon: 'users',
      coverAlt: 'Vecinos apoyándose mientras aprenden juntos.',
      title: 'Aprender en comunidad',
      summary: 'Todas las personas son bienvenidas: facilitemos, acompañemos y aprendamos juntos, con calma y sin prisa.',
      panelHeading: 'Formas de colaborar',
      panelLead: 'Elige cómo te gustaría ayudar y completa el formulario: te contactamos para conversar.',
      promises: ['Nuestra organización es inclusiva y no sectaria.', 'Los talleres no contienen contenido religioso.', 'Usamos tus datos solo para hablar de colaboración.'],
      explore: [{ to: '/nosotros', label: 'Conocer la organización' }, { to: '/talleres', label: 'Ver talleres' }],
      formTitle: 'Empieza a colaborar',
      formDescription: 'Cuéntanos cómo te gustaría ayudar: revisamos cada mensaje y te escribimos pronto.',
      formLink: 'Ir al formulario',
      cards: [
        { icon: 'book', title: 'Facilitar talleres', description: 'Explica con palabras sencillas y guía ejercicios paso a paso.' },
        { icon: 'users', title: 'Acompañar prácticas', description: 'Escucha preguntas y apoya a cada persona a su ritmo.' },
        { icon: 'pencil', title: 'Traducir contenidos', description: 'Ayuda a que las instrucciones sean claras y accesibles.' },
        { icon: 'sparkles', title: 'Compartir la misión', description: 'Acerca nuestra misión a vecinos, familias y espacios comunitarios.' },
      ],
      faqHeading: 'Preguntas sobre la comunidad',
      faqLead: 'Roles, tiempo y cómo empezamos a colaborar.',
      faq: [
        { question: '¿Necesito experiencia para colaborar?', answer: 'No. Solo necesitas paciencia y ganas de ayudar: te acompañamos para que empieces con confianza.' },
        { question: '¿Cuánto tiempo necesito?', answer: 'Lo que puedas dar. Cada taller dura entre 90 y 120 minutos, y coordinamos tu participación según tu disponibilidad.' },
        { question: '¿Los talleres tienen contenido religioso?', answer: 'No. Nuestra organización es inclusiva y no sectaria: todas las personas son bienvenidas, sin importar sus creencias.' },
        { question: '¿Cómo usan mis datos?', answer: 'Solo para hablar de colaboración. Completa el formulario con tus datos y te contactamos; nunca los compartimos.' },
        { question: '¿Dónde colaboramos?', answer: 'Nuestra zona de enfoque es Dallas–Fort Worth. Cada taller anuncia su sede cuando se confirma.' },
      ],
    },
  },
  en: {
    workshops: {
      coverImage: 'workshop-guidance',
      coverIcon: 'book',
      coverAlt: 'Guidance during a community workshop.',
      title: 'Participate',
      summary: 'Free Spanish-language workshops to learn AI from scratch, with your phone and at your pace.',
      panelHeading: 'What to expect',
      panelLead: 'Beginner sessions, in Spanish and free of charge: bring your curiosity, we take care of the rest.',
      promises: ['Free workshops, today and always.', 'You only need a smartphone.', 'You learn step by step, with no previous experience.'],
      explore: [{ to: '/talleres', label: 'View workshops' }, { to: '/comunidad', label: 'Meet the community' }],
      formTitle: 'Save your spot',
      formDescription: 'Choose your topic and complete the form: we will contact you with the details.',
      formLink: 'Go to the form',
      cards: [
        { icon: 'sparkles', title: 'Free of charge', description: 'Free workshops that only use free tools.' },
        { icon: 'device-mobile', title: 'Just your phone', description: 'No computer needed: everything is practiced on the phone.' },
        { icon: 'users', title: 'From scratch', description: 'Step-by-step instructions for people starting out.' },
        { icon: 'map-pin', title: 'Dallas–Fort Worth', description: 'Focus area: each workshop announces its venue once confirmed.' },
      ],
      faqHeading: 'Questions about participating',
      faqLead: 'Costs, requirements, and how to join a workshop.',
      faq: [
        { question: 'How much does it cost to participate?', answer: 'Nothing. Workshops are free for the community and will stay that way; they only use free tools.' },
        { question: 'Do I need experience with technology?', answer: 'No. Sessions are designed for beginners, with step-by-step instructions and support at your pace.' },
        { question: 'What do I need to bring?', answer: 'Only a smartphone; no computer needed. If you lack an account or reliable internet, we offer guided demonstrations or printed materials.' },
        { question: 'Which language are the workshops in?', answer: 'Spanish. The whole site and every session are available in Spanish and English.' },
        { question: 'How do I sign up for a workshop?', answer: 'Choose your topic in the form on this page and we will contact you with the date and venue once confirmed.' },
      ],
    },
    community: {
      coverImage: 'neighbor-support',
      coverIcon: 'users',
      coverAlt: 'Neighbors supporting each other while learning together.',
      title: 'Learn in community',
      summary: 'Everyone is welcome: let’s facilitate, support, and learn together, calmly and without rush.',
      panelHeading: 'Ways to collaborate',
      panelLead: 'Choose how you would like to help and complete the form: we will contact you for a conversation.',
      promises: ['Our organization is inclusive and nonsectarian.', 'Workshops contain no religious content.', 'We use your data only to talk about collaboration.'],
      explore: [{ to: '/nosotros', label: 'Meet the organization' }, { to: '/talleres', label: 'View workshops' }],
      formTitle: 'Start collaborating',
      formDescription: 'Tell us how you would like to help: we review every message and write back soon.',
      formLink: 'Go to the form',
      cards: [
        { icon: 'book', title: 'Facilitate workshops', description: 'Explain in simple words and guide step-by-step exercises.' },
        { icon: 'users', title: 'Guide practice', description: 'Listen to questions and support each person at their pace.' },
        { icon: 'pencil', title: 'Translate content', description: 'Help keep instructions clear and accessible.' },
        { icon: 'sparkles', title: 'Share the mission', description: 'Bring our mission to neighbors, families, and community spaces.' },
      ],
      faqHeading: 'Questions about the community',
      faqLead: 'Roles, time, and how we start collaborating.',
      faq: [
        { question: 'Do I need experience to collaborate?', answer: 'No. You only need patience and the will to help: we support you so you can start with confidence.' },
        { question: 'How much time do I need?', answer: 'Whatever you can give. Each workshop lasts 90 to 120 minutes, and we coordinate your participation around your availability.' },
        { question: 'Do workshops include religious content?', answer: 'No. Our organization is inclusive and nonsectarian: everyone is welcome, whatever their beliefs.' },
        { question: 'How do you use my data?', answer: 'Only to talk about collaboration. Complete the form with your details and we will contact you; we never share them.' },
        { question: 'Where do we collaborate?', answer: 'Our focus area is Dallas–Fort Worth. Each workshop announces its venue once confirmed.' },
      ],
    },
  },
};

@Component({
  selector: 'app-participation-page',
  imports: [InPageLink, ActionLink, Icon, PageCover, WorkshopSection, ValuesSection, ParticipationSection, FaqSection, RevealOnEnter],
  templateUrl: './participation-page.html',
  styleUrl: './participation-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipationPage {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  private readonly language = inject(Language);
  protected readonly community = computed(() => !!this.data()['community']);
  protected readonly c = computed(() => copy[this.language.lang()][this.community() ? 'community' : 'workshops']);
  protected readonly context = computed<ParticipationContext>(() => (this.community() ? 'community' : 'workshops'));
}

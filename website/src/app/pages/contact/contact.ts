import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icon, IconName } from '../../shared/icon';
import { ActionLink } from '../../shared/action-link';
import { PageCover } from '../../shared/page-cover/page-cover';
import { ParticipationSection } from '../../shared/participation-section/participation-section';
import { FaqItem, FaqSection } from '../../shared/faq-section/faq-section';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy: Record<Lang, { coverAlt: string; title: string; summary: string; channelsHeading: string; channelsLead: string; promises: string[]; exploreWorkshops: string; exploreCourses: string; formTitle: string; formDescription: string; formLink: string; available: string; pending: string; areaTitle: string; areaDescription: string; socialHeading: string; socialLead: string; soon: string; faqHeading: string; faqLead: string; faq: FaqItem[] }> = {
  es: {
    coverAlt: 'Dos personas compartiendo información en un teléfono.',
    title: 'Contacto',
    summary: 'Preguntas, ideas o ganas de colaborar: escríbenos y conversemos.',
    channelsHeading: 'Canales de contacto',
    channelsLead: 'El formulario es hoy la forma más rápida de hablar con nosotros; los demás canales se abrirán poco a poco.',
    promises: ['Leemos cada mensaje con atención.', 'Respondemos en español o inglés.', 'Usamos tus datos solo para responderte.'],
    exploreWorkshops: 'Ver talleres',
    exploreCourses: 'Ver cursos',
    formTitle: 'Formulario de contacto',
    formDescription: 'Elige un tema, déjanos tu mensaje y te respondemos pronto.',
    formLink: 'Ir al formulario',
    available: 'Disponible',
    pending: 'Por definir',
    areaTitle: 'Dallas–Fort Worth',
    areaDescription: 'Zona de enfoque: organizamos la iniciativa en Dallas–Fort Worth.',
    socialHeading: 'Redes sociales',
    socialLead: 'Aún no tenemos perfiles oficiales; los anunciaremos aquí cuando se abran.',
    soon: 'Próximamente',
    faqHeading: 'Preguntas sobre contacto',
    faqLead: 'Tiempos de respuesta, idiomas y estado de cada canal.',
    faq: [
      { question: '¿Cuánto tardan en responder?', answer: 'Revisamos cada mensaje y respondemos lo antes posible. Si tu pregunta es sobre un taller, elige el tema en el formulario para ayudarte más rápido.' },
      { question: '¿En qué idioma puedo escribir?', answer: 'En español o inglés: todo el sitio y cada respuesta están disponibles en ambos idiomas.' },
      { question: '¿Tienen número de teléfono o correo público?', answer: 'Aún no. Mientras los definimos, el formulario de esta página es la forma más rápida de contactarnos.' },
      { question: '¿Están en redes sociales?', answer: 'Todavía no tenemos perfiles oficiales. Cuando los abramos, los anunciaremos en esta página.' },
      { question: '¿Dónde se hacen las actividades?', answer: 'Nuestra zona de enfoque es Dallas–Fort Worth. Cada taller anuncia su sede cuando se confirma.' },
    ],
  },
  en: {
    coverAlt: 'Two people sharing information on a phone.',
    title: 'Contact',
    summary: 'Questions, ideas, or the urge to collaborate: write to us and let’s talk.',
    channelsHeading: 'Contact channels',
    channelsLead: 'The form is currently the fastest way to reach us; the other channels will open little by little.',
    promises: ['We read every message carefully.', 'We answer in Spanish or English.', 'We use your data only to answer you.'],
    exploreWorkshops: 'View workshops',
    exploreCourses: 'View courses',
    formTitle: 'Contact form',
    formDescription: 'Choose a topic, leave your message, and we will answer soon.',
    formLink: 'Go to the form',
    available: 'Available',
    pending: 'To be defined',
    areaTitle: 'Dallas–Fort Worth',
    areaDescription: 'Focus area: we organize the initiative in Dallas–Fort Worth.',
    socialHeading: 'Social networks',
    socialLead: 'We do not have official profiles yet; we will announce them here when they open.',
    soon: 'Coming soon',
    faqHeading: 'Questions about contact',
    faqLead: 'Response times, languages, and the status of each channel.',
    faq: [
      { question: 'How long do answers take?', answer: 'We review every message and answer as soon as possible. If your question is about a workshop, choose the topic in the form so we can help faster.' },
      { question: 'Which language can I write in?', answer: 'Spanish or English: the whole site and every answer are available in both languages.' },
      { question: 'Do you have a public phone number or email?', answer: 'Not yet. Until we define them, the form on this page is the fastest way to reach us.' },
      { question: 'Are you on social media?', answer: 'We do not have official profiles yet. When we open them, we will announce them on this page.' },
      { question: 'Where do activities take place?', answer: 'Our focus area is Dallas–Fort Worth. Each workshop announces its venue once confirmed.' },
    ],
  },
};

const channels: Record<Lang, { icon: IconName; title: string; description: string }[]> = {
  es: [
    { icon: 'mail', title: 'Correo electrónico', description: 'Por definir. Publicaremos aquí nuestro correo de contacto.' },
    { icon: 'phone', title: 'Teléfono', description: 'Por definir. Publicaremos aquí nuestro número de contacto.' },
  ],
  en: [
    { icon: 'mail', title: 'Email', description: 'To be defined. We will publish our contact email here.' },
    { icon: 'phone', title: 'Phone', description: 'To be defined. We will publish our contact number here.' },
  ],
};

@Component({selector: 'app-contact', imports: [ActionLink, Icon, PageCover, ParticipationSection, FaqSection, RevealOnEnter], templateUrl: './contact.html', styleUrl: './contact.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class Contact {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly channels = computed(() => channels[this.language.lang()]);
  protected readonly social: { icon: IconName; name: string }[] = [
    { icon: 'brand-x', name: 'X' }, { icon: 'brand-instagram', name: 'Instagram' }, { icon: 'brand-linkedin', name: 'LinkedIn' }, { icon: 'brand-tiktok', name: 'TikTok' }, { icon: 'brand-youtube', name: 'YouTube' },
  ];
}

import { WhatsappLink } from '../../shared/whatsapp-link';
import { InPageLink } from '../../shared/in-page-link';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icon, IconName } from '../../shared/icon';
import { ActionLink } from '../../shared/action-link';
import { PageCover } from '../../shared/page-cover/page-cover';
import { ParticipationSection } from '../../shared/participation-section/participation-section';
import { FaqItem, FaqSection } from '../../shared/faq-section/faq-section';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy: Record<Lang, { coverAlt: string; title: string; summary: string; channelsHeading: string; channelsLead: string; promises: string[]; exploreWorkshops: string; exploreCourses: string; formTitle: string; formDescription: string; formLink: string; available: string; pending: string; areaTitle: string; areaDescription: string; socialHeading: string; socialLead: string; faqHeading: string; faqLead: string; faq: FaqItem[] }> = {
  es: {
    coverAlt: 'Dos personas compartiendo información en un teléfono.',
    title: 'Contacto',
    summary: 'Preguntas, ideas o ganas de colaborar: escríbenos y conversemos.',
    channelsHeading: 'Canales de contacto',
    channelsLead: 'Escríbenos por correo, llámanos, usa el formulario o síguenos en redes.',
    promises: ['Leemos cada mensaje con atención.', 'Respondemos en español o inglés.', 'Usamos tus datos solo para responderte.'],
    exploreWorkshops: 'Ver talleres',
    exploreCourses: 'Ver cursos',
    formTitle: 'Formulario de contacto',
    formDescription: 'Elige un tema, déjanos tu mensaje y te respondemos pronto.',
    formLink: 'Ir al formulario',
    available: 'Disponible',
    pending: 'Por definir',
    areaTitle: 'Dallas–Fort Worth',
    areaDescription: 'Zona de servicio: operamos en Dallas–Fort Worth.',
    socialHeading: 'Redes sociales',
    socialLead: 'Síguenos como @iaparatodos: compartimos talleres, recursos y novedades.',
    faqHeading: 'Preguntas sobre contacto',
    faqLead: 'Tiempos de respuesta, idiomas y estado de cada canal.',
    faq: [
      { question: '¿Cuánto tardan en responder?', answer: 'Revisamos cada mensaje y respondemos lo antes posible. Si tu pregunta es sobre un taller, elige el tema en el formulario para ayudarte más rápido.' },
      { question: '¿En qué idioma puedo escribir?', answer: 'En español o inglés: todo el sitio y cada respuesta están disponibles en ambos idiomas.' },
      { question: '¿Tienen número de teléfono o correo público?', answer: 'Sí: escríbenos a info@iaparatodos.com o llámanos al +1 (281) 704-6506. El correo y el formulario de esta página son las formas más rápidas de contactarnos.' },
      { question: '¿Están en redes sociales?', answer: 'Sí: estamos como @iaparatodos en X, Instagram, LinkedIn, TikTok y YouTube.' },
      { question: '¿Dónde se hacen las actividades?', answer: 'Nuestra zona de enfoque es Dallas–Fort Worth. Cada taller anuncia su sede cuando se confirma.' },
    ],
  },
  en: {
    coverAlt: 'Two people sharing information on a phone.',
    title: 'Contact',
    summary: 'Questions, ideas, or the urge to collaborate: write to us and let’s talk.',
    channelsHeading: 'Contact channels',
    channelsLead: 'Email us, call us, use the form, or follow us on social media.',
    promises: ['We read every message carefully.', 'We answer in Spanish or English.', 'We use your data only to answer you.'],
    exploreWorkshops: 'View workshops',
    exploreCourses: 'View courses',
    formTitle: 'Contact form',
    formDescription: 'Choose a topic, leave your message, and we will answer soon.',
    formLink: 'Go to the form',
    available: 'Available',
    pending: 'To be defined',
    areaTitle: 'Dallas–Fort Worth',
    areaDescription: 'Service area: we operate in Dallas–Fort Worth.',
    socialHeading: 'Social networks',
    socialLead: 'Follow us as @iaparatodos: we share workshops, resources, and news.',
    faqHeading: 'Questions about contact',
    faqLead: 'Response times, languages, and the status of each channel.',
    faq: [
      { question: 'How long do answers take?', answer: 'We review every message and answer as soon as possible. If your question is about a workshop, choose the topic in the form so we can help faster.' },
      { question: 'Which language can I write in?', answer: 'Spanish or English: the whole site and every answer are available in both languages.' },
      { question: 'Do you have a public phone number or email?', answer: 'Yes: write to us at info@iaparatodos.com or call us at +1 (281) 704-6506. Email and the form on this page are the fastest ways to reach us.' },
      { question: 'Are you on social media?', answer: 'Yes: find us as @iaparatodos on X, Instagram, LinkedIn, TikTok, and YouTube.' },
      { question: 'Where do activities take place?', answer: 'Our focus area is Dallas–Fort Worth. Each workshop announces its venue once confirmed.' },
    ],
  },
};

const channels: Record<Lang, { icon: IconName; title: string; description: string; href?: string; link?: string; live?: boolean }[]> = {
  es: [
    { icon: 'mail', title: 'Correo electrónico', description: 'Escríbenos y te respondemos lo antes posible.', href: 'mailto:info@iaparatodos.com', link: 'info@iaparatodos.com', live: true },
    { icon: 'phone', title: 'Teléfono', description: 'Llámanos o escríbenos por mensaje.', href: 'tel:+12817046506', link: '+1 (281) 704-6506', live: true },
  ],
  en: [
    { icon: 'mail', title: 'Email', description: 'Write to us and we will answer as soon as possible.', href: 'mailto:info@iaparatodos.com', link: 'info@iaparatodos.com', live: true },
    { icon: 'phone', title: 'Phone', description: 'Call or message us.', href: 'tel:+12817046506', link: '+1 (281) 704-6506', live: true },
  ],
};

@Component({selector: 'app-contact', imports: [WhatsappLink, InPageLink, ActionLink, Icon, PageCover, ParticipationSection, FaqSection, RevealOnEnter], templateUrl: './contact.html', styleUrl: './contact.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class Contact {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly channels = computed(() => channels[this.language.lang()]);
  protected readonly social: { icon: IconName; name: string; handle: string; href: string }[] = [
    { icon: 'brand-x', name: 'X', handle: '@iaparatodos', href: 'https://x.com/iaparatodos' },
    { icon: 'brand-instagram', name: 'Instagram', handle: '@iaparatodos', href: 'https://www.instagram.com/iaparatodos' },
    { icon: 'brand-linkedin', name: 'LinkedIn', handle: '@iaparatodos', href: 'https://www.linkedin.com/company/iaparatodos' },
    { icon: 'brand-tiktok', name: 'TikTok', handle: '@iaparatodos', href: 'https://www.tiktok.com/@iaparatodos' },
    { icon: 'brand-youtube', name: 'YouTube', handle: '@iaparatodos', href: 'https://www.youtube.com/@iaparatodos' },
  ];
}

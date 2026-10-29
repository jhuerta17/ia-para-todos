import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icon, IconName } from '../../shared/icon';
import { FaqSection } from '../../shared/faq-section/faq-section';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy = {
  es: { title: 'Conversemos', lead: 'Queremos escuchar preguntas e ideas para aprender en comunidad. Consulta el estado de cada canal.', social: 'Redes sociales', pending: 'Por definir', channelPending: 'canal por definir' },
  en: { title: 'Let’s talk', lead: 'We want to hear questions and ideas for learning in community. Check the status of each channel.', social: 'Social networks', pending: 'To be defined', channelPending: 'channel to be defined' },
};

const channels: Record<Lang, { icon: IconName; title: string; description: string }[]> = {
  es: [
    { icon: 'phone', title: 'Teléfono', description: 'Por definir. Publicaremos aquí nuestro número de contacto.' },
    { icon: 'mail', title: 'Correo electrónico', description: 'Por definir. Publicaremos aquí nuestro correo de contacto.' },
    { icon: 'map-pin', title: 'Dallas–Fort Worth', description: 'Zona de enfoque: Dallas–Fort Worth.' },
  ],
  en: [
    { icon: 'phone', title: 'Phone', description: 'To be defined. We will publish our contact number here.' },
    { icon: 'mail', title: 'Email', description: 'To be defined. We will publish our contact email here.' },
    { icon: 'map-pin', title: 'Dallas–Fort Worth', description: 'Focus area: Dallas–Fort Worth.' },
  ],
};

@Component({selector: 'app-contact', imports: [Icon, FaqSection, RevealOnEnter], templateUrl: './contact.html', styleUrl: './contact.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class Contact {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly channels = computed(() => channels[this.language.lang()]);
  protected readonly social: { icon: IconName; name: string }[] = [
    { icon: 'brand-x', name: 'X' }, { icon: 'brand-instagram', name: 'Instagram' }, { icon: 'brand-linkedin', name: 'LinkedIn' }, { icon: 'brand-tiktok', name: 'TikTok' }, { icon: 'brand-youtube', name: 'YouTube' },
  ];
}

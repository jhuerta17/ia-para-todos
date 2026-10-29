import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon, IconName } from '../../shared/icon';
import { FaqSection } from '../../shared/faq-section/faq-section';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
@Component({selector: 'app-contact', imports: [Icon, FaqSection, RevealOnEnter], templateUrl: './contact.html', styleUrl: './contact.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class Contact {
  protected readonly channels: { icon: IconName; title: string; description: string }[] = [
    { icon: 'phone', title: 'Teléfono', description: 'Por definir. Publicaremos aquí nuestro número de contacto.' },
    { icon: 'mail', title: 'Correo electrónico', description: 'Por definir. Publicaremos aquí nuestro correo de contacto.' },
    { icon: 'map-pin', title: 'Dallas–Fort Worth', description: 'Zona de enfoque: Dallas–Fort Worth.' },
  ];
  protected readonly social: { icon: IconName; name: string }[] = [
    { icon: 'brand-x', name: 'X' }, { icon: 'brand-instagram', name: 'Instagram' }, { icon: 'brand-linkedin', name: 'LinkedIn' }, { icon: 'brand-tiktok', name: 'TikTok' }, { icon: 'brand-youtube', name: 'YouTube' },
  ];
}

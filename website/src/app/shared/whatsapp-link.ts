import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Language } from '../i18n/language';
import { Lang } from '../i18n/lang';
import { Icon } from './icon';

export const WHATSAPP_NUMBER = '15551650259';
export function whatsappUrl(lang: Lang): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lang === 'es' ? 'Talleres' : 'Workshops')}`;
}

@Component({
  selector: 'app-whatsapp-link',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.floating]': "variant() === 'floating'", '[class.panel]': "variant() === 'panel'" },
  template: `
    @if (variant() === 'panel') {
      <h2>{{ spanish() ? '¿No sabes por dónde empezar? Encuentra tu próximo taller por WhatsApp.' : 'Not sure where to start? Find your next workshop on WhatsApp.' }}</h2>
      <p>{{ spanish() ? 'Consulta los próximos talleres, elige uno y vuelve al sitio para registrarte.' : 'Browse upcoming workshops, choose one, and return to the website to register.' }}</p>
    }
    <a [href]="href()" target="_blank" rel="noopener noreferrer">
      <app-icon name="brand-whatsapp" />
      <span>{{ variant() === 'portal' ? (spanish() ? 'Encuentra tu próximo taller' : 'Find your next workshop') : (spanish() ? 'Talleres por WhatsApp' : 'Workshops on WhatsApp') }}</span>
      <span class="sr-only">{{ spanish() ? '(abre WhatsApp en otra pestaña)' : '(opens WhatsApp in a new tab)' }}</span>
    </a>
  `,
  styleUrl: './whatsapp-link.css',
})
export class WhatsappLink {
  readonly variant = input<'inline' | 'panel' | 'floating' | 'portal'>('inline');
  private readonly language = inject(Language);
  protected readonly spanish = computed(() => this.language.lang() === 'es');
  protected readonly href = computed(() => whatsappUrl(this.language.lang()));
}

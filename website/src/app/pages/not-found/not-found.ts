import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActionLink } from '../../shared/action-link';
import { Language } from '../../i18n/language';

const copy = {
  es: { title: 'No encontramos esa página', lead: 'Es posible que la dirección cambiara o aún no exista. Volvamos al inicio con calma.', home: 'Volver al inicio', explore: 'Explorar talleres' },
  en: { title: 'We could not find that page', lead: 'The address may have changed or not exist yet. Let’s calmly go back home.', home: 'Back to home', explore: 'Explore workshops' },
};

@Component({selector: 'app-not-found', imports: [ActionLink], template: `<main id="main-content" tabindex="-1"><div class="content"><p class="code">404</p><h1>{{ c().title }}</h1><p>{{ c().lead }}</p><div class="actions"><app-action-link to="/" [label]="c().home" /><app-action-link to="/talleres" [label]="c().explore" tone="warm" /></div></div></main>`, styles: `main { min-height: calc(100svh - 80px); margin: 70px 10px 0; padding: 80px 30px; border-radius: 60px; background: var(--color-warm); display: grid; place-items: center; text-align: center; } main:focus { outline: none; } .content { max-width: 760px; } .code { font: 400 48px/1.4 var(--font-heading); margin: 0 0 16px; } h1 { font-size: 32px; } p { max-width: 600px; margin: 16px auto 28px; } .actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; } app-action-link { width: 230px; max-width: 100%; --action-gap: 10px; } @media (max-width: 809px) { main { border-radius: 40px; padding-inline: 20px; } h1 { font-size: 28px; } }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class NotFound {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}

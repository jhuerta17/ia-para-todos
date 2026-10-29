import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-preview',
  imports: [RouterLink],
  template: `
    <main>
      <p class="eyebrow">IA para todos · En preparación</p>
      <h1>{{ page['heading'] }}</h1>
      <p>{{ page['description'] }}</p>
      <a routerLink="/">Volver al inicio</a>
    </main>
  `,
  styles: `
    main { max-width: var(--content-width); margin: 6.25rem auto 2rem; padding: clamp(2rem, 6vw, 5rem); background: var(--color-warm); border-radius: var(--radius-panel); }
    h1 { font-size: var(--text-section); overflow-wrap: anywhere; }
    p { max-width: 42rem; }
    .eyebrow { font-size: var(--text-small); }
    a { display: inline-block; margin-top: var(--space-md); }
    @media (max-width: 809px) { main { margin-inline: var(--gutter-panel); } }
  `,
})
export class PagePreview {
  protected readonly page = inject(ActivatedRoute).snapshot.data;
}

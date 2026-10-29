import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealOnEnter } from '../motion/reveal-on-enter';
@Component({ selector: 'app-page-intro', imports: [RevealOnEnter], template: `<header appRevealOnEnter><h1>{{ title() }}</h1><p class="lead">{{ lead() }}</p>@for (paragraph of paragraphs(); track $index) {<p>{{ paragraph }}</p>}</header>`, styleUrl: './page-intro.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class PageIntro { readonly title = input.required<string>(); readonly lead = input.required<string>(); readonly paragraphs = input<string[]>([]); }

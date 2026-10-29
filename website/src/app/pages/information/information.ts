import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { informationPages } from '../../data/information-pages';
import { ActionLink } from '../../shared/action-link';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
@Component({selector: 'app-information', imports: [ActionLink, RevealOnEnter], template: `<main id="main-content" tabindex="-1"><header appRevealOnEnter><h1>{{ page().title }}</h1><p class="lead">{{ page().intro }}</p><p class="status">Contenido provisional de demostración · Pendiente de revisión</p></header>@for (section of page().sections; track section.heading) {<section appRevealOnEnter><h2>{{ section.heading }}</h2>@for (paragraph of section.paragraphs; track $index) {<p>{{ paragraph }}</p>}</section>}<app-action-link to="/" label="Volver al inicio" /></main>`, styleUrl: './information.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class Information {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  protected readonly page = computed(() => this.data()['information'] as typeof informationPages[number]);
}

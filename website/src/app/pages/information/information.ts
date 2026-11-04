import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { informationPages } from '../../data/information-pages';
import { ActionLink } from '../../shared/action-link';
import { Language } from '../../i18n/language';

const copy = {
  es: { back: 'Volver al inicio', contents: 'En esta página', information: 'Información del sitio', related: 'También en este sitio' },
  en: { back: 'Back to home', contents: 'On this page', information: 'Site information', related: 'Also on this site' },
};

@Component({selector: 'app-information', imports: [ActionLink, RouterLink], templateUrl: './information.html', styleUrl: './information.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class Information {
  private readonly document = inject(DOCUMENT);
  protected jump(event: Event, index: number): void {
    event.preventDefault();
    const section = this.document.getElementById(`information-section-${index}`);
    section?.focus({ preventScroll: true });
    section?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly related = computed(() => informationPages[this.language.lang()].filter(page => page.path !== this.page().path));
  protected readonly page = computed(() => this.data()['information'] as (typeof informationPages)['es'][number]);
}

import { ChangeDetectionStrategy, Component, computed, ElementRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
import { workshops } from '../../data/workshops';
import { WorkshopCard } from '../../shared/workshop-card/workshop-card';
import { FaqSection } from '../../shared/faq-section/faq-section';
import { Icon } from '../../shared/icon';
import { Language } from '../../i18n/language';
import { PHOTO_NOTE } from '../../i18n/lang';

const copy = {
  es: { photo: 'Fotografía ilustrativa de personas adultas reunidas alrededor de una computadora.', title: 'Talleres', lead: 'Aprende a usar la IA en español, desde cero y con tu teléfono. Cuatro temas para practicar a tu ritmo y en comunidad.', catalog: 'Explora los talleres', search: 'Buscar talleres', placeholder: 'Nombre o tema', clear: 'Limpiar búsqueda', topics: 'Temas', all: 'Todos', one: 'taller', many: 'talleres', emptyTitle: 'No encontramos talleres con esos filtros', emptyLead: 'Prueba otro nombre o tema, o vuelve a ver los cuatro talleres.', reset: 'Restablecer búsqueda' },
  en: { photo: 'Illustrative photo of adults gathered around a computer.', title: 'Workshops', lead: 'Learn to use AI in Spanish, from scratch and with your phone. Four topics to practice at your pace and in community.', catalog: 'Explore the workshops', search: 'Search workshops', placeholder: 'Name or topic', clear: 'Clear search', topics: 'Topics', all: 'All', one: 'workshop', many: 'workshops', emptyTitle: 'We found no workshops with those filters', emptyLead: 'Try another name or topic, or see all four workshops again.', reset: 'Reset search' },
};

@Component({
  selector: 'app-workshop-list',
  imports: [WorkshopCard, FaqSection, Icon, RevealOnEnter],
  templateUrl: './workshop-list.html',
  styleUrls: ['./workshop-list.css', './workshop-list-interactions.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopList {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly caption = computed(() => PHOTO_NOTE[this.language.lang()].plural);
  private readonly parameters = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly entries = computed(() => workshops[this.language.lang()]);
  protected readonly categories = computed(() => [this.c().all, ...new Set(this.entries().map(workshop => workshop.category))]);
  protected readonly query = computed(() => this.parameters().get('q') ?? '');
  protected readonly category = computed(() => {
    const value = this.parameters().get('tema');
    return value && this.categories().includes(value) ? value : this.c().all;
  });
  protected readonly filtered = computed(() => {
    const search = this.normalize(this.query());
    return this.entries().filter(workshop => (this.category() === this.c().all || workshop.category === this.category()) &&
      this.normalize(`${workshop.title} ${workshop.category} ${workshop.summary}`).includes(search));
  });

  private normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(this.language.lang()).trim(); }
  protected search(event: Event): void { this.setQuery((event.target as HTMLInputElement).value); }
  protected setQuery(value: string): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { q: value || null }, queryParamsHandling: 'merge', replaceUrl: true }); }
  protected selectCategory(value: string): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { tema: value === this.c().all ? null : value }, queryParamsHandling: 'merge', replaceUrl: true }); }
  protected clearSearch(): void { this.setQuery(''); this.element.nativeElement.querySelector<HTMLInputElement>('#workshop-search')?.focus(); }
  protected reset(): void { void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true }); this.element.nativeElement.querySelector<HTMLInputElement>('#workshop-search')?.focus(); }
}

import { ChangeDetectionStrategy, Component, computed, ElementRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlannedActivity } from '../../data/activities';
import { ActivityCard } from '../../shared/activity-card/activity-card';
import { PageCover } from '../../shared/page-cover/page-cover';
import { Icon } from '../../shared/icon';
import { FaqSection } from '../../shared/faq-section/faq-section';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { PHOTO_NOTE } from '../../i18n/lang';

interface Entry { slug: string; title: string; category: string; summary: string; image: string; }
interface Catalog { kind: 'activities' | 'resources'; title: string; summary: string; image: string; status: string; entries: Entry[]; }

const copy = {
  es: { searchActivities: 'Buscar actividades', searchResources: 'Buscar recursos', placeholder: 'Nombre o tema', clear: 'Limpiar búsqueda', topics: 'Temas', all: 'Todos', one: 'resultado', many: 'resultados', kind: 'Recurso', read: 'Leer recurso', emptyTitle: 'No encontramos resultados', emptyLead: 'Prueba otro nombre o tema, o vuelve a ver todo el catálogo.', reset: 'Restablecer búsqueda' },
  en: { searchActivities: 'Search activities', searchResources: 'Search resources', placeholder: 'Name or topic', clear: 'Clear search', topics: 'Topics', all: 'All', one: 'result', many: 'results', kind: 'Resource', read: 'Read resource', emptyTitle: 'We found no results', emptyLead: 'Try another name or topic, or see the whole catalog again.', reset: 'Reset search' },
};

@Component({selector: 'app-catalog-page', imports: [ActivityCard, PageCover, Icon, FaqSection, RouterLink, RevealOnEnter], templateUrl: './catalog-page.html', styleUrls: ['../workshop-list/workshop-list.css', '../workshop-list/workshop-list-interactions.css', './catalog-page.css'], changeDetection: ChangeDetectionStrategy.OnPush})
export class CatalogPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly caption = computed(() => PHOTO_NOTE[this.language.lang()].plural);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly catalog = computed(() => this.data()['catalog'] as Catalog);
  protected readonly categories = computed(() => [this.c().all, ...new Set(this.catalog().entries.map(entry => entry.category))]);
  protected readonly query = computed(() => this.params().get('q') ?? '');
  protected readonly category = computed(() => this.categories().includes(this.params().get('tema') ?? '') ? this.params().get('tema')! : this.c().all);
  protected readonly filtered = computed(() => this.catalog().entries.filter(entry => (this.category() === this.c().all || entry.category === this.category()) && this.normalize(`${entry.title} ${entry.summary} ${entry.category}`).includes(this.normalize(this.query()))));
  private normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(this.language.lang()).trim(); }
  protected activity(entry: Entry): PlannedActivity { return entry as PlannedActivity; }
  protected search(event: Event): void { this.setQuery((event.target as HTMLInputElement).value); }
  private setQuery(value: string): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { q: value || null }, queryParamsHandling: 'merge', replaceUrl: true }); }
  protected selectCategory(value: string): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { tema: value === this.c().all ? null : value }, queryParamsHandling: 'merge', replaceUrl: true }); }
  protected clearSearch(): void { this.setQuery(''); this.focusSearch(); }
  protected reset(): void { void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true }); this.focusSearch(); }
  private focusSearch(): void { this.element.nativeElement.querySelector<HTMLInputElement>('#catalog-search')?.focus(); }
}

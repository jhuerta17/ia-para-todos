import { ChangeDetectionStrategy, Component, computed, ElementRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlannedActivity } from '../../data/activities';
import { ActivityCard } from '../../shared/activity-card/activity-card';
import { PageCover } from '../../shared/page-cover/page-cover';
import { Icon } from '../../shared/icon';
import { FaqSection } from '../../shared/faq-section/faq-section';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
interface Entry { slug: string; title: string; category: string; summary: string; image: string; }
interface Catalog { kind: 'activities' | 'resources'; title: string; summary: string; image: string; status: string; entries: Entry[]; }
@Component({selector: 'app-catalog-page', imports: [ActivityCard, PageCover, Icon, FaqSection, RouterLink, RevealOnEnter], templateUrl: './catalog-page.html', styleUrls: ['../workshop-list/workshop-list.css', '../workshop-list/workshop-list-interactions.css', './catalog-page.css'], changeDetection: ChangeDetectionStrategy.OnPush})
export class CatalogPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly catalog = computed(() => this.data()['catalog'] as Catalog);
  protected readonly categories = computed(() => ['Todos', ...new Set(this.catalog().entries.map(entry => entry.category))]);
  protected readonly query = computed(() => this.params().get('q') ?? '');
  protected readonly category = computed(() => this.categories().includes(this.params().get('tema') ?? '') ? this.params().get('tema')! : 'Todos');
  protected readonly filtered = computed(() => this.catalog().entries.filter(entry => (this.category() === 'Todos' || entry.category === this.category()) && this.normalize(`${entry.title} ${entry.summary} ${entry.category}`).includes(this.normalize(this.query()))));
  private normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim(); }
  protected activity(entry: Entry): PlannedActivity { return entry as PlannedActivity; }
  protected search(event: Event): void { this.setQuery((event.target as HTMLInputElement).value); }
  private setQuery(value: string): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { q: value || null }, queryParamsHandling: 'merge', replaceUrl: true }); }
  protected selectCategory(value: string): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { tema: value === 'Todos' ? null : value }, queryParamsHandling: 'merge', replaceUrl: true }); }
  protected clearSearch(): void { this.setQuery(''); this.focusSearch(); }
  protected reset(): void { void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true }); this.focusSearch(); }
  private focusSearch(): void { this.element.nativeElement.querySelector<HTMLInputElement>('#catalog-search')?.focus(); }
}

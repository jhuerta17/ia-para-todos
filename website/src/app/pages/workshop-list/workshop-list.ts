import { ChangeDetectionStrategy, Component, computed, ElementRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { workshops } from '../../data/workshops';
import { WorkshopCard } from '../../shared/workshop-card/workshop-card';
import { FaqSection } from '../../shared/faq-section/faq-section';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-workshop-list',
  imports: [WorkshopCard, FaqSection, Icon],
  templateUrl: './workshop-list.html',
  styleUrl: './workshop-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopList {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly parameters = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly categories = ['Todos', ...new Set(workshops.map(workshop => workshop.category))];
  protected readonly query = computed(() => this.parameters().get('q') ?? '');
  protected readonly category = computed(() => {
    const value = this.parameters().get('tema');
    return value && this.categories.includes(value) ? value : 'Todos';
  });
  protected readonly filtered = computed(() => {
    const search = this.normalize(this.query());
    return workshops.filter(workshop => (this.category() === 'Todos' || workshop.category === this.category()) &&
      this.normalize(`${workshop.title} ${workshop.category} ${workshop.summary}`).includes(search));
  });

  private normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim(); }
  protected search(event: Event): void { this.setQuery((event.target as HTMLInputElement).value); }
  protected setQuery(value: string): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { q: value || null }, queryParamsHandling: 'merge', replaceUrl: true }); }
  protected selectCategory(value: string): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { tema: value === 'Todos' ? null : value }, queryParamsHandling: 'merge', replaceUrl: true }); }
  protected clearSearch(): void { this.setQuery(''); this.element.nativeElement.querySelector<HTMLInputElement>('#workshop-search')?.focus(); }
  protected reset(): void { void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true }); this.element.nativeElement.querySelector<HTMLInputElement>('#workshop-search')?.focus(); }
}

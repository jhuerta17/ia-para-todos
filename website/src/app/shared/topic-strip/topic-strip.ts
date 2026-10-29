import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { Icon, IconName } from '../icon';

@Component({
  selector: 'app-topic-strip',
  imports: [Icon],
  templateUrl: './topic-strip.html',
  styleUrl: './topic-strip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicStrip {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  protected readonly paused = signal(false);
  protected readonly visible = signal(false);
  protected readonly pageHidden = signal(false);
  protected readonly topics: { label: string; icon: IconName }[] = [
    { label: 'Primeros pasos', icon: 'sparkles' },
    { label: 'Vida diaria', icon: 'device-mobile' },
    { label: 'Trabajo y negocios', icon: 'bulb' },
    { label: 'Padres y familias', icon: 'users' },
  ];

  protected toggleMotion(): void {
    this.paused.update(value => !value);
  }

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(entries => this.visible.set(entries[0].intersectionRatio > 0.01), { threshold: 0.01 });
      observer.observe(this.host.nativeElement);
      const updateVisibility = () => this.pageHidden.set(this.document.hidden);
      updateVisibility();
      this.document.addEventListener('visibilitychange', updateVisibility);
      this.destroy.onDestroy(() => {
        observer.disconnect();
        this.document.removeEventListener('visibilitychange', updateVisibility);
      });
    });
  }
}

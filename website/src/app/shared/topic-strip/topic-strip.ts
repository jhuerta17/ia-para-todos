import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { Icon, IconName } from '../icon';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const labels: Record<Lang, string[]> = {
  es: ['Primeros pasos', 'Vida diaria', 'Trabajo y negocios', 'Padres y familias'],
  en: ['First steps', 'Everyday life', 'Work and business', 'Parents and families'],
};

const icons: IconName[] = ['sparkles', 'device-mobile', 'bulb', 'users'];

const copy = {
  es: { heading: '¿Qué puedes practicar aquí?', pause: 'Pausar movimiento de temas', resume: 'Reanudar movimiento de temas', group: 'Temas de aprendizaje' },
  en: { heading: 'What can you practice here?', pause: 'Pause topic movement', resume: 'Resume topic movement', group: 'Learning topics' },
};

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
  private readonly language = inject(Language);
  protected readonly paused = signal(false);
  protected readonly visible = signal(false);
  protected readonly pageHidden = signal(false);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly topics = computed(() => labels[this.language.lang()].map((label, index) => ({ label, icon: icons[index] })));

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

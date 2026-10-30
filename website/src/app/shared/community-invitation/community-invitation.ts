import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActionLink } from '../action-link';
import { Language } from '../../i18n/language';

const text = {
  es: { heading: 'Ven como eres; aquí se aprende con calma.', lead: 'Si hablas español y tienes curiosidad, este lugar es para ti. Queremos crear un espacio abierto a todas las personas, sin importar sus creencias.', participate: 'Participar' },
  en: { heading: 'Come as you are; here we learn calmly.', lead: 'If you speak Spanish and are curious, this place is for you. We want to create a space open to everyone, whatever their beliefs.', participate: 'Participate' },
};

@Component({
  selector: 'app-community-invitation',
  imports: [ActionLink],
  templateUrl: './community-invitation.html',
  styleUrl: './community-invitation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityInvitation {
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly copy = viewChild.required<ElementRef<HTMLElement>>('copy');
  protected readonly moving = signal(false);
  protected readonly progress = signal(1);
  protected readonly copyVisible = computed(() => this.progress() > 0.55);
  private readonly language = inject(Language);
  protected readonly c = computed(() => text[this.language.lang()]);

  constructor() {
    afterNextRender(() => {
      const window = this.document.defaultView;
      if (!window) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0;
      const update = () => {
        frame = 0;
        const offset = window.innerWidth >= 810 ? 30 : 64;
        const height = window.innerHeight - offset;
        const enabled = !preference.matches;
        this.moving.set(enabled);
        if (!enabled) { this.progress.set(1); return; }
        const section = this.section().nativeElement;
        const distance = Math.max(1, section.offsetHeight - height);
        const progress = Math.max(0, Math.min(1, (offset - section.getBoundingClientRect().top) / distance));
        this.progress.set(progress);
      };
      const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
      const observer = new ResizeObserver(schedule);
      observer.observe(this.section().nativeElement);
      observer.observe(this.copy().nativeElement);
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      preference.addEventListener('change', schedule);
      update();
      this.destroy.onDestroy(() => {
        observer.disconnect();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        preference.removeEventListener('change', schedule);
        window.cancelAnimationFrame(frame);
      });
    });
  }

  protected readonly photographs = [
    'peer-support', 'community-group', 'everyday-phone', 'community-learning',
    'collaboration', 'family-learning', 'family-phone', 'accessible-technology',
  ];
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const iconNames = ['alert-circle', 'arrow-left', 'arrow-right', 'arrow-up-right', 'arrows-horizontal', 'book', 'brand-instagram', 'brand-linkedin', 'brand-tiktok', 'brand-x', 'brand-youtube', 'bulb', 'calendar-event', 'check', 'chevron-down', 'chevron-left', 'chevron-right', 'circle-check', 'clipboard-check', 'device-mobile', 'mail', 'map-pin', 'menu-2', 'minus', 'pencil', 'phone', 'player-pause', 'player-play', 'plus', 'quote', 'search', 'shield-check', 'sparkles', 'users', 'x'] as const;
export type IconName = (typeof iconNames)[number];

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    'aria-hidden': 'true',
    '[style.mask-image]': 'mask()',
    '[style.-webkit-mask-image]': 'mask()',
  },
  styles: `:host { display: inline-block; flex: none; width: var(--icon-size, 1.5rem); height: var(--icon-size, 1.5rem); background: currentColor; mask-repeat: no-repeat; mask-position: center; mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; -webkit-mask-size: contain; }`,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly mask = computed(() => `url("/icons/tabler/${this.name()}.svg")`);
}

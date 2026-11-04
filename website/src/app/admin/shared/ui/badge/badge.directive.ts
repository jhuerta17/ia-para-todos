import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';

export type BadgeVariant = 'light' | 'solid' | 'ghost';
export type BadgeSize = 'sm' | 'default' | 'md' | 'lg';
export type BadgeColor =
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'gray'
  | 'light'
  | 'dark';


@Directive({
  selector: 'span[app-badge], a[app-badge]',
  host: {
    '[attr.data-slot]': '"badge"',
    '[attr.data-variant]': 'variant',
    '[attr.data-color]': 'color',
    '[attr.data-size]': 'size',
  },
})
export class BadgeDirective implements OnChanges {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private applied: string[] = [];

  @Input() variant: BadgeVariant = 'light';
  @Input() size: BadgeSize = 'default';
  @Input() color: BadgeColor = 'primary';
  @Input() className: string = '';

  ngOnChanges(): void {
    const next = this.badgeClasses.split(/\s+/).filter(Boolean);
    const keep = new Set(next);
    for (const c of this.applied) if (!keep.has(c)) this.el.nativeElement.classList.remove(c);
    for (const c of next) this.el.nativeElement.classList.add(c);
    this.applied = next;
  }


  get normalizedSize(): 'sm' | 'default' | 'lg' {
    if (this.size === 'sm') return 'sm';
    if (this.size === 'lg') return 'lg';
    return 'default';
  }

  get badgeClasses(): string {
    const baseClasses =
      'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 font-medium whitespace-nowrap transition-colors select-none [&>svg]:pointer-events-none [&>svg]:shrink-0';

    const hasCustomRadius = /\brounded(-[\w\[\]]+)?\b/.test(this.className);
    const radiusClass = hasCustomRadius
      ? ''
      : this.normalizedSize === 'lg'
        ? 'rounded-[10px]'
        : 'rounded-lg';

    let sizeClass = '';
    if (this.variant === 'ghost') {
      sizeClass =
        'px-0 py-0 [&:has(>svg:first-child)]:ps-0 [&:has(>svg:last-child)]:pe-0';
      if (this.normalizedSize === 'sm') {
        sizeClass += ' h-5.5 text-xs [&>svg]:size-3';
      } else if (this.normalizedSize === 'lg') {
        sizeClass += ' h-7 text-sm [&>svg]:size-3.5';
      } else {
        sizeClass += ' h-6 text-sm [&>svg]:size-3.5';
      }
    } else {
      if (this.normalizedSize === 'sm') {
        sizeClass =
          `h-5.5 ${radiusClass} px-2 py-0.5 text-xs [&:has(>svg:first-child)]:ps-1.5 [&:has(>svg:last-child)]:pe-1.5 [&>svg]:size-3`;
      } else if (this.normalizedSize === 'lg') {
        sizeClass =
          `h-7 ${radiusClass} px-3 py-1 text-sm [&:has(>svg:first-child)]:ps-2.5 [&:has(>svg:last-child)]:pe-2.5 [&>svg]:size-3.5`;
      } else {
        sizeClass =
          `h-6 ${radiusClass} px-2.5 py-0.5 text-sm [&:has(>svg:first-child)]:ps-2 [&:has(>svg:last-child)]:pe-2 [&>svg]:size-3.5`;
      }
    }

    const colorClass = this.colorStyles;

    return `${baseClasses} ${sizeClass.replace(/\s+/g, ' ')} ${colorClass} ${this.className}`.trim();
  }

  get colorStyles(): string {
    const variants: Record<BadgeVariant, Record<BadgeColor, string>> = {
      light: {
        primary:
          'bg-brand-50 text-brand-500  dark:bg-brand-500/15 dark:text-brand-400 ',
        success:
          'bg-green-50 text-green-700  dark:bg-green-500/15 dark:text-green-500 ',
        error:
          'bg-red-50 text-red-600  dark:bg-red-500/15 dark:text-red-500 ',
        warning:
          'bg-amber-50 text-amber-800  dark:bg-amber-500/15 dark:text-orange-400 ',
        info: 'bg-sky-50 text-sky-700  dark:bg-sky-500/15 dark:text-sky-700 ',
        gray: 'bg-gray-100 text-gray-700  dark:bg-white/5 dark:text-white/80 ',
        light:
          'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80',
        dark: 'bg-gray-500/15 text-gray-800 dark:bg-white/5 dark:text-white',
      },
      solid: {
        primary:
          'bg-brand-500 text-white  ',
        success:
          'bg-green-700 text-white  ',
        error:
          'bg-red-700 text-white  ',
        warning:
          'bg-amber-800 text-white  ',
        info: 'bg-sky-700 text-white  ',
        gray: 'bg-gray-700 text-white  dark:bg-gray-700 dark:text-white ',
        light:
          'bg-gray-400 text-white dark:bg-white/5 dark:text-white/80',
        dark: 'bg-gray-800 text-white dark:bg-gray-700 dark:text-white',
      },
      ghost: {
        primary: 'text-brand-500 dark:text-brand-400 bg-transparent',
        success: 'text-green-700 dark:text-green-500 bg-transparent',
        error: 'text-red-600 dark:text-red-500 bg-transparent',
        warning: 'text-amber-800 dark:text-orange-400 bg-transparent',
        info: 'text-sky-700 bg-transparent',
        gray: 'text-gray-700 dark:text-gray-300 bg-transparent',
        light: 'text-gray-700 dark:text-gray-300 bg-transparent',
        dark: 'text-gray-800 dark:text-white bg-transparent',
      },
    };

    return variants[this.variant]?.[this.color] || variants.light.primary;
  }
}

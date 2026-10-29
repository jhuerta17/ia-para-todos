import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BrandMark } from '../brand-mark';
import { Icon } from '../icon';
@Component({selector: 'app-site-footer', imports: [RouterLink, BrandMark, Icon, ReactiveFormsModule], templateUrl: './site-footer.html', styleUrls: ['./site-footer.css', '../form-controls.css'], changeDetection: ChangeDetectionStrategy.OnPush})
export class SiteFooter {
  protected readonly complete = signal(false);
  protected readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  protected readonly navigation = [['/', 'Inicio'], ['/nosotros', 'Nosotros'], ['/talleres', 'Talleres'], ['/recursos', 'Recursos'], ['/comunidad', 'Comunidad'], ['/participar', 'Participar']];
  constructor() {
    inject(Router).events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) { this.email.reset(); this.complete.set(false); }
    });
  }
  protected submit(event: Event): void { event.preventDefault(); this.complete.set(false); this.email.markAsTouched(); if (this.email.valid) { this.complete.set(true); this.email.reset(); } }
}

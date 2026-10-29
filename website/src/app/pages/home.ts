import { Component } from '@angular/core';
import { LogoPlaceholder } from '../shared/logo-placeholder';

@Component({
  selector: 'app-home',
  imports: [LogoPlaceholder],
  template: `<main tabindex="-1"><app-logo-placeholder /><h1>IA para todos</h1></main>`,
  styles: `main:focus { outline: none; } main { display: flex; align-items: center; justify-content: center; gap: var(--space-md); min-height: 100svh; padding: var(--space-lg); } h1 { font-size: var(--text-section); }`,
})
export class Home {}

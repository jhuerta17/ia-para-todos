import { Component } from '@angular/core';
import { LogoPlaceholder } from './shared/logo-placeholder';

@Component({
  selector: 'app-root',
  imports: [LogoPlaceholder],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}

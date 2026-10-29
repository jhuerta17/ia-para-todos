import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionLink } from '../shared/action-link';
import { IntroCards } from '../shared/intro-cards/intro-cards';

@Component({
  selector: 'app-home',
  imports: [ActionLink, IntroCards],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}

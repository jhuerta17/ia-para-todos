import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionLink } from '../shared/action-link';
import { MissionReveal } from '../shared/mission-reveal/mission-reveal';
import { TopicStrip } from '../shared/topic-strip/topic-strip';
import { IntroCards } from '../shared/intro-cards/intro-cards';

@Component({
  selector: 'app-home',
  imports: [ActionLink, IntroCards, TopicStrip, MissionReveal],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}

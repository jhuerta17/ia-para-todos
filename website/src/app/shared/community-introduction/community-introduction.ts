import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CollaborationCarousel } from '../collaboration-carousel/collaboration-carousel';
import { ActionLink } from '../action-link';
import { BrandMark } from '../brand-mark';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';

@Component({
  selector: 'app-community-introduction',
  imports: [CollaborationCarousel, ActionLink, BrandMark, Icon, RevealOnEnter],
  templateUrl: './community-introduction.html',
  styleUrl: './community-introduction.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityIntroduction {}

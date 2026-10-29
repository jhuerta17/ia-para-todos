import { ResourceSection } from '../shared/resource-section/resource-section';
import { ParticipationSection } from '../shared/participation-section/participation-section';
import { LearningStories } from '../shared/learning-stories/learning-stories';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommunityInvitation } from '../shared/community-invitation/community-invitation';
import { CommunityIntroduction } from '../shared/community-introduction/community-introduction';
import { LearningBenefits } from '../shared/learning-benefits/learning-benefits';
import { ActionLink } from '../shared/action-link';
import { ActivitySection } from '../shared/activity-section/activity-section';
import { ProgramFacts } from '../shared/program-facts/program-facts';
import { WorkshopSection } from '../shared/workshop-section/workshop-section';
import { MissionReveal } from '../shared/mission-reveal/mission-reveal';
import { TopicStrip } from '../shared/topic-strip/topic-strip';
import { IntroCards } from '../shared/intro-cards/intro-cards';

@Component({
  selector: 'app-home',
  imports: [ActionLink, IntroCards, TopicStrip, MissionReveal, WorkshopSection, ProgramFacts, ActivitySection, LearningBenefits, CommunityIntroduction, CommunityInvitation, LearningStories, ParticipationSection, ResourceSection],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}

import { FaqSection } from '../shared/faq-section/faq-section';
import { ResourceSection } from '../shared/resource-section/resource-section';
import { ParticipationSection } from '../shared/participation-section/participation-section';
import { LearningStories } from '../shared/learning-stories/learning-stories';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
import { Language } from '../i18n/language';

const copy = {
  es: { photo: 'Personas adultas compartiendo un momento con tecnología.', title: 'Inteligencia artificial para todos.', lead: 'Talleres gratuitos en español para aprender IA desde cero, con tu teléfono.', explore: 'Explorar talleres', initiative: 'La iniciativa' },
  en: { photo: 'Adults sharing a moment with technology.', title: 'Artificial intelligence for everyone.', lead: 'Free workshops in Spanish to learn AI from scratch, with your phone.', explore: 'Explore workshops', initiative: 'The initiative' },
};

@Component({
  selector: 'app-home',
  imports: [ActionLink, IntroCards, TopicStrip, MissionReveal, WorkshopSection, ProgramFacts, ActivitySection, LearningBenefits, CommunityIntroduction, CommunityInvitation, LearningStories, ParticipationSection, ResourceSection, FaqSection],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}

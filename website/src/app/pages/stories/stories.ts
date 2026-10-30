import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LearningStories } from '../../shared/learning-stories/learning-stories';
import { FounderStory } from '../../shared/founder-story/founder-story';
import { ActionLink } from '../../shared/action-link';
import { Language } from '../../i18n/language';

const copy = {
  es: { next: '¿Qué te gustaría practicar primero?', explore: 'Explorar talleres' },
  en: { next: 'What would you like to practice first?', explore: 'Explore workshops' },
};

@Component({selector: 'app-stories', imports: [LearningStories, FounderStory, ActionLink], template: `<main id="main-content" tabindex="-1"><app-learning-stories [pageHeading]="true" /><app-founder-story /><div class="next"><p>{{ c().next }}</p><app-action-link to="/talleres" [label]="c().explore" /></div></main>`, styles: `main { padding-top: 40px; } main:focus { outline: none; } .next { max-width: 1040px; margin: 40px auto 0; padding: 0 20px; } .next app-action-link { width: 230px; max-width: 100%; }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class Stories {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}

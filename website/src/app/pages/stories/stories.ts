import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LearningStories } from '../../shared/learning-stories/learning-stories';
import { ActionLink } from '../../shared/action-link';
@Component({selector: 'app-stories', imports: [LearningStories, ActionLink], template: `<main tabindex="-1"><app-learning-stories [pageHeading]="true" /><div class="next"><p>¿Qué te gustaría practicar primero?</p><app-action-link to="/talleres" label="Explorar talleres" /></div></main>`, styles: `main { padding-top: 40px; } main:focus { outline: none; } .next { max-width: 1040px; margin: 40px auto 0; padding: 0 20px; } .next app-action-link { width: 230px; max-width: 100%; }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class Stories {}

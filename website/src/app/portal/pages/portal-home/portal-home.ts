import { WorkshopStudent } from '../../../workshops/workshop-student';
import { BadgeComponent } from '../../../shared/dashboard/badge';
import { PORTAL_STORE, CourseProgress } from '../../store/portal-store';
import { PortalClient, PortalChat } from '../../store/portal-client';
import { firstPrompt } from '../../courses/first-prompt';
import { COURSE_PATH, lessonPath } from '../../courses/course-paths';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActionButton } from '../../../shared/action-button';
import { Language } from '../../../i18n/language';
import type { Lang } from '../../../i18n/lang';
import { UserSession } from '../../session/user-session';

const copy = {
  es: {
    greeting: 'Hola',
    title: 'Portal del estudiante',
    lead: 'Prepárate para tu próximo taller presencial y sigue practicando después, a tu ritmo.',
    coming: 'Tu práctica',
    courses: 'Explorar mis cursos',
    tutor: 'Practicar y ver mis conversaciones',
    history: 'Las conversaciones se guardan en tu cuenta durante 30 días.',
    signIn: 'Iniciar sesión',
    signUp: 'Crear cuenta',
    home: 'Volver al sitio',
    note: 'Gratis y a tu ritmo.',
  },
  en: {
    greeting: 'Hi',
    title: 'Student portal',
    lead: 'Prepare for your next in-person workshop and keep practicing afterward, at your own pace.',
    coming: 'Your practice',
    courses: 'Explore my courses',
    tutor: 'Practice and view my conversations',
    history: 'Conversations are saved in your account for 30 days.',
    signIn: 'Sign in',
    signUp: 'Create account',
    home: 'Back to the site',
    note: 'Free and at your own pace.',
  },
} satisfies Record<Lang, Record<string, string>>;

// Session-aware landing page for the learning portal.
@Component({
  selector: 'app-portal-home',
  imports: [WorkshopStudent, ActionButton, RouterModule, BadgeComponent],
  templateUrl: './portal-home.html',
  styleUrls: ['./portal-home.css', '../portal-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalHome {
  private readonly language = inject(Language);
  protected readonly session = inject(UserSession);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly en = computed(() => this.language.lang() === 'en');
  private readonly store = inject(PORTAL_STORE);
  protected readonly client = inject(PortalClient);
  protected readonly progress = signal<CourseProgress>({enrolled:false,completed:[]});
  protected readonly chats = signal<PortalChat[]>([]);
  protected readonly loadingProgress = signal(true);
  protected readonly loadingChats = signal(true);
  protected readonly progressError = signal(false);
  protected readonly chatsError = signal(false);
  protected readonly course = computed(() => firstPrompt(this.language.lang()));
  protected readonly finished = computed(() => this.progress().completed.length === this.course().lessons.length);
  protected readonly resume = computed(() => this.progress().enrolled
    ? (this.finished() ? COURSE_PATH : lessonPath(this.course().lessons.find(lesson => !this.progress().completed.includes(lesson.id))!.id)) : COURSE_PATH);
  constructor() {
    let startedFor: string | undefined;
    effect(() => {
      const id = this.session.user()?.id;
      if (id && this.client.consented() === true && startedFor !== id) {
        startedFor = id; void this.loadProgress(); void this.loadChats();
      }
    });
  }
  protected async loadProgress(): Promise<void> {
    const userId = this.session.user()?.id;
    if (!userId) return;
    this.loadingProgress.set(true); this.progressError.set(false);
    try { const value = await this.store.load(userId); if (this.session.user()?.id === userId) this.progress.set(value); }
    catch { this.progressError.set(true); } finally { this.loadingProgress.set(false); }
  }
  protected async loadChats(): Promise<void> {
    const userId = this.session.user()?.id;
    this.loadingChats.set(true); this.chatsError.set(false);
    try { const value = await this.client.request<{chats:PortalChat[]}>('chats'); if(this.session.user()?.id === userId) this.chats.set(value.chats.slice(0,3)); }
    catch { this.chatsError.set(true); } finally { this.loadingChats.set(false); }
  }
  protected homePath(): string {
    return this.language.path('home');
  }
}

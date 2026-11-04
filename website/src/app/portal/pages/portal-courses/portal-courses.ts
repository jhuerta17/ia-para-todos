import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Language } from '../../../i18n/language';
import { Icon } from '../../../shared/icon';
import { ActionButton } from '../../../shared/action-button';
import { COURSE_PATH, lessonPath } from '../../courses/course-paths';
import { firstPrompt } from '../../courses/first-prompt';
import { PORTAL_STORE, type CourseProgress } from '../../store/portal-store';
import { UserSession } from '../../session/user-session';

const copy = {
  es: {
    catalogLead: 'Lecciones cortas para aprender a tu ritmo, con ejemplos inventados.',
    courses: 'Mis cursos', free: 'Gratis · Principiante · 3 lecciones',
    browse: 'Ver el curso', back: 'Volver a mis cursos', overview: 'Volver al curso',
    enroll: 'Inscribirme gratis', continue: 'Continuar aprendiendo', review: 'Repasar el curso',
    progress: 'Tu progreso', of: 'de', lessons: 'lecciones completadas', done: 'Completada',
    complete: 'Marcar como completada', completed: 'Curso completado. ¡Sigue practicando!',
    practice: 'Practica con un ejemplo inventado', reflect: 'Antes de terminar',
    enrollFirst: 'Puedes leer las lecciones en cualquier orden. Inscríbete para guardar tu progreso.',
    local: 'Tu progreso se guarda en tu cuenta para continuar desde otro dispositivo.',
    error: 'No pudimos leer o guardar tu progreso. Comprueba tu conexión e inténtalo de nuevo. Puedes seguir leyendo las lecciones.',
    retry: 'Volver a cargar el progreso', loading: 'Cargando tu progreso…', saving: 'Guardando…', next: 'Siguiente lección', saved: 'Progreso guardado en tu cuenta.',
  },
  en: {
    catalogLead: 'Short lessons to learn at your own pace, using made-up examples.',
    courses: 'My courses', free: 'Free · Beginner · 3 lessons',
    browse: 'View course', back: 'Back to my courses', overview: 'Back to course',
    enroll: 'Enroll for free', continue: 'Continue learning', review: 'Review the course',
    progress: 'Your progress', of: 'of', lessons: 'lessons completed', done: 'Completed',
    complete: 'Mark as completed', completed: 'Course complete. Keep practicing!',
    practice: 'Practice with a made-up example', reflect: 'Before you finish',
    enrollFirst: 'Read the lessons in any order. Enroll to save your progress.',
    local: 'Your progress is saved in your account so you can continue from another device.',
    error: 'We could not read or save your progress. Check your connection, then try again. You can keep reading the lessons.',
    retry: 'Reload progress', loading: 'Loading your progress…', saving: 'Saving…', next: 'Next lesson', saved: 'Progress saved in your account.',
  },
};

@Component({
  selector: 'app-portal-courses', imports: [RouterLink, ActionButton, Icon],
  templateUrl: './portal-courses.html', styleUrl: './portal-courses.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalCourses {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  private readonly language = inject(Language);
  private readonly session = inject(UserSession);
  private readonly store = inject(PORTAL_STORE);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly course = computed(() => firstPrompt(this.language.lang()));
  protected readonly lesson = computed(() => this.course().lessons.find(item => item.id === this.data()['lessonId']));
  protected readonly listing = computed(() => this.data()['courseView'] === 'list');
  protected readonly progress = signal<CourseProgress>({ enrolled: false, completed: [] });
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly failed = signal(false);
  protected readonly saved = signal(false);
  protected readonly coursePath = COURSE_PATH;
  protected readonly lessonPath = lessonPath;
  protected readonly finished = computed(() => this.progress().completed.length === this.course().lessons.length);
  protected readonly resume = computed(() => lessonPath((this.course().lessons.find(item => !this.progress().completed.includes(item.id)) ?? this.course().lessons[0]!).id));
  protected readonly next = computed(() => {
    const index = this.course().lessons.findIndex(item => item.id === this.lesson()?.id);
    return this.course().lessons[index + 1];
  });

  constructor() { afterNextRender(() => { void this.load(); }); }

  protected async load(): Promise<void> {
    const userId = this.session.user()?.id;
    if (!userId) { this.loading.set(false); return; }
    this.loading.set(true);
    this.failed.set(false);
    this.saved.set(false);
    try {
      const value = await this.store.load(userId);
      if (this.session.user()?.id === userId) this.progress.set(value);
    } catch { this.failed.set(true); }
    finally { this.loading.set(false); }
  }

  protected async save(): Promise<void> {
    const userId = this.session.user()?.id;
    if (!userId || this.saving() || this.loading() || this.failed()) return;
    this.saving.set(true);
    this.saved.set(false);
    try {
      const lesson = this.lesson();
      const value = this.progress().enrolled && lesson
        ? await this.store.complete(userId, lesson.id)
        : await this.store.enroll(userId);
      if (this.session.user()?.id === userId) { this.progress.set(value); this.saved.set(true); }
    } catch { this.failed.set(true); }
    finally { this.saving.set(false); }
  }
}

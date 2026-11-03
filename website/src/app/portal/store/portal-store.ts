import { DOCUMENT } from '@angular/common';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { COURSE_ID, LESSON_IDS, type LessonId } from '../courses/course-paths';

export interface CourseProgress {
  enrolled: boolean;
  completed: LessonId[];
}
/** Async boundary: later replaced with authenticated server persistence. */
export interface PortalStore {
  load(userId: string): Promise<CourseProgress>;
  enroll(userId: string): Promise<CourseProgress>;
  complete(userId: string, lesson: LessonId): Promise<CourseProgress>;
}

/** Temporary checkpoint-2 storage. Never used for authentication or authorization. */
@Injectable({ providedIn: 'root' })
export class LocalPortalStore implements PortalStore {
  private readonly document = inject(DOCUMENT);
  private key(userId: string): string {
    if (!userId) throw new Error('NO_SESSION');
    return `portal-progress:v1:${encodeURIComponent(userId)}:${COURSE_ID}`;
  }
  private storage(): Storage {
    const storage = this.document.defaultView?.localStorage;
    if (!storage) throw new Error('STORAGE_UNAVAILABLE');
    return storage;
  }
  async load(userId: string): Promise<CourseProgress> {
    const raw = this.storage().getItem(this.key(userId));
    if (!raw) return { enrolled: false, completed: [] };
    const data = JSON.parse(raw);
    if (typeof data?.enrolled !== 'boolean' || !Array.isArray(data.completed) ||
        data.completed.some((id: unknown) => !LESSON_IDS.includes(id as LessonId)) ||
        (!data.enrolled && data.completed.length)) throw new Error('INVALID_PROGRESS');
    return { enrolled: data.enrolled, completed: [...new Set<LessonId>(data.completed)] };
  }
  async enroll(userId: string): Promise<CourseProgress> {
    const progress = await this.load(userId);
    progress.enrolled = true;
    this.storage().setItem(this.key(userId), JSON.stringify(progress));
    return progress;
  }
  async complete(userId: string, lesson: LessonId): Promise<CourseProgress> {
    if (!LESSON_IDS.includes(lesson)) throw new Error('INVALID_LESSON');
    const progress = await this.load(userId);
    if (!progress.enrolled) throw new Error('NOT_ENROLLED');
    progress.completed = LESSON_IDS.filter(id => id === lesson || progress.completed.includes(id));
    this.storage().setItem(this.key(userId), JSON.stringify(progress));
    return progress;
  }
}
export const PORTAL_STORE = new InjectionToken<PortalStore>('PortalStore', {
  providedIn: 'root', factory: () => inject(LocalPortalStore),
});

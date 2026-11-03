import { Injectable, InjectionToken, inject } from '@angular/core';
import type { LessonId } from '../courses/course-paths';
import { UserSession } from '../session/user-session';
import { PortalClient } from './portal-client';
export interface CourseProgress { enrolled: boolean; completed: LessonId[] }
export interface PortalStore {
  load(userId: string): Promise<CourseProgress>;
  enroll(userId: string): Promise<CourseProgress>;
  complete(userId: string, lesson: LessonId): Promise<CourseProgress>;
}
@Injectable({ providedIn: 'root' })
export class ServerPortalStore implements PortalStore {
  private readonly client = inject(PortalClient);
  private readonly session = inject(UserSession);
  private check(userId: string): void {
    if (!userId || userId !== this.session.user()?.id) throw new Error('SESSION_CHANGED');
  }
  load(userId: string): Promise<CourseProgress> { this.check(userId); return this.client.request('progress'); }
  enroll(userId: string): Promise<CourseProgress> { this.check(userId); return this.client.request('progress','POST',{action:'enroll'}); }
  complete(userId: string, lessonId: LessonId): Promise<CourseProgress> { this.check(userId); return this.client.request('progress','POST',{action:'complete',lessonId}); }
}
export const PORTAL_STORE = new InjectionToken<PortalStore>('PortalStore', {
  providedIn: 'root', factory: () => inject(ServerPortalStore),
});

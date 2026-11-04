import { Injectable, InjectionToken, inject } from '@angular/core';
import type { CourseId, LessonId } from '../courses/course-paths';
import { UserSession } from '../session/user-session';
import { PortalClient } from './portal-client';
export interface CourseProgress { enrolled: boolean; completed: LessonId[] }
export interface PortalStore {
  load(userId: string, courseId?: CourseId): Promise<CourseProgress>;
  enroll(userId: string, courseId?: CourseId): Promise<CourseProgress>;
  complete(userId: string, lesson: LessonId, courseId?: CourseId): Promise<CourseProgress>;
}
@Injectable({ providedIn: 'root' })
export class ServerPortalStore implements PortalStore {
  private readonly client = inject(PortalClient);
  private readonly session = inject(UserSession);
  private check(userId: string): void {
    if (!userId || userId !== this.session.user()?.id) throw new Error('SESSION_CHANGED');
  }
  load(userId: string, courseId?: CourseId): Promise<CourseProgress> { this.check(userId); return this.client.request(`progress${courseId && courseId !== 'first-prompt' ? '?courseId='+courseId : ''}`); }
  enroll(userId: string, courseId?: CourseId): Promise<CourseProgress> { this.check(userId); return this.client.request('progress','POST',{action:'enroll', ...(courseId && courseId !== 'first-prompt' ? {courseId} : {})}); }
  complete(userId: string, lessonId: LessonId, courseId?: CourseId): Promise<CourseProgress> { this.check(userId); return this.client.request('progress','POST',{action:'complete',lessonId,...(courseId && courseId !== 'first-prompt' ? {courseId} : {})}); }
}
export const PORTAL_STORE = new InjectionToken<PortalStore>('PortalStore', {
  providedIn: 'root', factory: () => inject(ServerPortalStore),
});

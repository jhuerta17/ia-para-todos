/** Stable IDs are shared by both translations and persisted progress. */
export const COURSE_ID = 'first-prompt';
export const LESSON_IDS = ['clear-request', 'refine-response', 'verify-and-protect'] as const;
export type LessonId = typeof LESSON_IDS[number];
export const COURSE_PATH = `/portal/courses/${COURSE_ID}`;
export const lessonPath = (id: LessonId) => `${COURSE_PATH}/lessons/${id}`;
export const COURSE_PATHS = ['/portal/courses', COURSE_PATH, ...LESSON_IDS.map(lessonPath)];

/** Stable IDs are shared by both translations and persisted progress. */
export const COURSE_ID = 'first-prompt';
export const LESSON_IDS = ['clear-request', 'refine-response', 'verify-and-protect'] as const;
export const META_COURSE_ID = 'learn-meta-ai';
export const META_LESSON_IDS = ['everyday-messages', 'interview-practice', 'small-business'] as const;
export const COURSE_CATALOG = { [COURSE_ID]: LESSON_IDS, [META_COURSE_ID]: META_LESSON_IDS } as const;
export type CourseId = keyof typeof COURSE_CATALOG;
export type LessonId = typeof LESSON_IDS[number] | typeof META_LESSON_IDS[number];
export const COURSE_PATH = `/portal/courses/${COURSE_ID}`;
export const lessonPath = (id: LessonId, course: CourseId = COURSE_ID) => `/portal/courses/${course}/lessons/${id}`;
export const COURSE_PATHS = ['/portal/courses', ...Object.entries(COURSE_CATALOG).flatMap(([id, lessons]) => [`/portal/courses/${id}`, ...lessons.map(lesson => lessonPath(lesson, id as CourseId))])];

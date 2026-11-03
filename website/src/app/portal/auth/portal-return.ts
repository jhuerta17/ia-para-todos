import { COURSE_PATHS } from '../courses/course-paths';

const destinations = new Set(['/portal', '/portal/chats', '/portal/account', ...COURSE_PATHS]);

export function portalReturn(value: unknown): string {
  return typeof value === 'string' && (destinations.has(value) || /^\/(?:reservas|en\/reservations)#[a-f0-9]{64}$/.test(value)) ? value : '/portal';
}

export interface DemoWorkshop {
  id: string;
  title: string;
  startsAt: string;
  location: string;
  registered: number;
  capacity: number;
  level: string;
}

export type DemoSupporterType = 'Individual' | 'Business' | 'Foundation';

export interface DemoSupporter {
  id: string;
  name: string;
  type: DemoSupporterType;
  /** Lifetime contributions, in USD. */
  total: number;
  since: string;
  status: 'Active' | 'Lapsed';
}

export interface DemoImpactMonth {
  key: string;
  label: string;
  attendees: number;
  volunteers: number;
  satisfaction: number;
}

const DAY_MS = 86_400_000;

interface WorkshopDef {
  title: string;
  offsetDays: number;
  location: string;
  registered: number;
  capacity: number;
  level: string;
}

// Sessions cycle the real four-workshop series, as a running program would.
const WORKSHOP_DEFS: WorkshopDef[] = [
  { title: 'Introducción a la IA', offsetDays: -168, location: 'Oak Cliff Community Center', registered: 24, capacity: 30, level: 'Beginner' },
  { title: 'IA para Padres y Familias', offsetDays: -140, location: 'Fort Worth Public Library', registered: 31, capacity: 35, level: 'All levels' },
  { title: 'IA para la Vida Diaria', offsetDays: -112, location: 'Online session', registered: 28, capacity: 30, level: 'Beginner' },
  { title: 'Introducción a la IA', offsetDays: -84, location: 'Oak Cliff Community Center', registered: 42, capacity: 45, level: 'All levels' },
  { title: 'IA para el Trabajo y los Negocios', offsetDays: -56, location: 'Arlington Community Center', registered: 26, capacity: 30, level: 'Intermediate' },
  { title: 'IA para la Vida Diaria', offsetDays: -28, location: 'Fort Worth Public Library', registered: 19, capacity: 25, level: 'Beginner' },
  { title: 'IA para el Trabajo y los Negocios', offsetDays: 12, location: 'Online session', registered: 17, capacity: 30, level: 'Intermediate' },
  { title: 'IA para Padres y Familias', offsetDays: 33, location: 'Oak Cliff Community Center', registered: 8, capacity: 30, level: 'All levels' },
];

interface SupporterDef {
  id: string;
  name: string;
  type: DemoSupporterType;
  total: number;
  /** Months before `now` the support started; keeps the story evergreen. */
  sinceOffsetMonths: number;
  status: 'Active' | 'Lapsed';
}

const SUPPORTER_DEFS: SupporterDef[] = [
  { id: 'd1', name: 'Fundación Lumen', type: 'Foundation', total: 40000, sinceOffsetMonths: 7, status: 'Active' },
  { id: 'd2', name: 'Fundación Camino', type: 'Foundation', total: 25000, sinceOffsetMonths: 5, status: 'Active' },
  { id: 'd3', name: 'Oak Cliff Café', type: 'Business', total: 20000, sinceOffsetMonths: 4, status: 'Active' },
  { id: 'd4', name: 'Taller Hernández', type: 'Business', total: 12000, sinceOffsetMonths: 3, status: 'Active' },
  { id: 'd5', name: 'Librería Gandiño', type: 'Business', total: 5000, sinceOffsetMonths: 2, status: 'Lapsed' },
  { id: 'd6', name: 'María González', type: 'Individual', total: 8000, sinceOffsetMonths: 5, status: 'Active' },
  { id: 'd7', name: 'Jorge Mendoza', type: 'Individual', total: 4500, sinceOffsetMonths: 4, status: 'Active' },
  { id: 'd8', name: 'Lucía Fernández', type: 'Individual', total: 3000, sinceOffsetMonths: 3, status: 'Active' },
  { id: 'd9', name: 'Carlos Ruiz', type: 'Individual', total: 1500, sinceOffsetMonths: 1, status: 'Active' },
  { id: 'd10', name: 'Ana Torres', type: 'Individual', total: 500, sinceOffsetMonths: 5, status: 'Lapsed' },
];

/** Monthly volunteers and satisfaction, oldest month first. */
const VOLUNTEERS_BY_MONTH = [4, 5, 5, 7, 8, 9];
const SATISFACTION_BY_MONTH = [92, 94, 93, 95, 96, 97];

/**
 * Deterministic synthetic operating data for admin demo mode. Pure
 * module: same `now` always yields the same output. Workshops sit at
 * fixed day offsets and supporter tenures at fixed month offsets, so
 * the six-month story holds on any run date.
 */
export function demoWorkshops(now = Date.now()): DemoWorkshop[] {
  return WORKSHOP_DEFS.map((def, index) => {
    const date = new Date(now + def.offsetDays * DAY_MS);
    date.setHours(18, 0, 0, 0);
    return {
      id: `w${index + 1}`,
      title: def.title,
      startsAt: date.toISOString(),
      location: def.location,
      registered: def.registered,
      capacity: def.capacity,
      level: def.level,
    };
  }).sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
}

export function demoSupporters(now = Date.now()): DemoSupporter[] {
  const cursor = new Date(now);
  return SUPPORTER_DEFS.map((def) => {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - def.sinceOffsetMonths, 1);
    return {
      id: def.id,
      name: def.name,
      type: def.type,
      total: def.total,
      since: date.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
      status: def.status,
    };
  }).sort((a, b) => b.total - a.total);
}

export function demoSupporterTotal(): number {
  return SUPPORTER_DEFS.reduce((sum, supporter) => sum + supporter.total, 0);
}

/** Trailing six calendar months; attendees come from past workshops. */
export function demoImpactMonths(workshops: DemoWorkshop[], now = Date.now()): DemoImpactMonth[] {
  const cursor = new Date(now);
  const months: DemoImpactMonth[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    const sameYear = date.getFullYear() === cursor.getFullYear();
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label:
        date.toLocaleDateString('en', { month: 'short' }) + (sameYear ? '' : ` ’${String(date.getFullYear()).slice(2)}`),
      attendees: 0,
      volunteers: VOLUNTEERS_BY_MONTH[5 - i],
      satisfaction: SATISFACTION_BY_MONTH[5 - i],
    });
  }
  const byKey = new Map(months.map((month) => [month.key, month]));
  for (const workshop of workshops) {
    const time = Date.parse(workshop.startsAt);
    if (Number.isNaN(time) || time > now) continue;
    const date = new Date(time);
    const month = byKey.get(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    if (month) month.attendees += workshop.registered;
  }
  return months;
}

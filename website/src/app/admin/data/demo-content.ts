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
  /** Lifetime contributions, in MXN. */
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

const WORKSHOP_DEFS: WorkshopDef[] = [
  { title: 'AI basics for families', offsetDays: -168, location: 'Roma Sur Community Center', registered: 24, capacity: 30, level: 'Beginner' },
  { title: 'Spotting misinformation with AI tools', offsetDays: -140, location: 'Juárez Public Library', registered: 31, capacity: 35, level: 'All levels' },
  { title: 'AI for homework help', offsetDays: -112, location: 'Online session', registered: 28, capacity: 30, level: 'Beginner' },
  { title: 'Online safety and AI scams', offsetDays: -84, location: 'Roma Sur Community Center', registered: 42, capacity: 45, level: 'All levels' },
  { title: 'AI tools for job seekers', offsetDays: -56, location: 'Doctores Community Center', registered: 26, capacity: 30, level: 'Intermediate' },
  { title: 'AI basics for seniors', offsetDays: -28, location: 'Juárez Public Library', registered: 19, capacity: 25, level: 'Beginner' },
  { title: 'AI for small business', offsetDays: 12, location: 'Online session', registered: 17, capacity: 30, level: 'Intermediate' },
  { title: 'Create with AI: photos and video', offsetDays: 33, location: 'Roma Sur Community Center', registered: 8, capacity: 30, level: 'All levels' },
];

const SUPPORTERS: DemoSupporter[] = [
  { id: 'd1', name: 'Fundación Lumen', type: 'Foundation', total: 40000, since: 'Mar 2026', status: 'Active' },
  { id: 'd2', name: 'Fundación Camino', type: 'Foundation', total: 25000, since: 'May 2026', status: 'Active' },
  { id: 'd3', name: 'Café Roma', type: 'Business', total: 20000, since: 'Jun 2026', status: 'Active' },
  { id: 'd4', name: 'Taller Hernández', type: 'Business', total: 12000, since: 'Jul 2026', status: 'Active' },
  { id: 'd5', name: 'Librería Gandiño', type: 'Business', total: 5000, since: 'Aug 2026', status: 'Lapsed' },
  { id: 'd6', name: 'María González', type: 'Individual', total: 8000, since: 'May 2026', status: 'Active' },
  { id: 'd7', name: 'Jorge Mendoza', type: 'Individual', total: 4500, since: 'Jun 2026', status: 'Active' },
  { id: 'd8', name: 'Lucía Fernández', type: 'Individual', total: 3000, since: 'Jul 2026', status: 'Active' },
  { id: 'd9', name: 'Carlos Ruiz', type: 'Individual', total: 1500, since: 'Sep 2026', status: 'Active' },
  { id: 'd10', name: 'Ana Torres', type: 'Individual', total: 500, since: 'May 2026', status: 'Lapsed' },
];

/** Monthly volunteers and satisfaction, oldest month first. */
const VOLUNTEERS_BY_MONTH = [4, 5, 5, 7, 8, 9];
const SATISFACTION_BY_MONTH = [92, 94, 93, 95, 96, 97];

/**
 * Deterministic synthetic operating data for admin demo mode. Pure
 * module: same `now` always yields the same output. Workshops sit at
 * fixed day offsets so the six-month story holds on any run date.
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

export function demoSupporters(): DemoSupporter[] {
  return [...SUPPORTERS].sort((a, b) => b.total - a.total);
}

export function demoSupporterTotal(): number {
  return SUPPORTERS.reduce((sum, supporter) => sum + supporter.total, 0);
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

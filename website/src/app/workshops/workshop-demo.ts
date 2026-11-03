import type { Reservation, Topic, WorkshopSession } from './workshop-types';

/**
 * Deterministic fictional workshop data for demo mode and staging seeds.
 * Pure module: no Angular, no I/O, same `now` always yields the same
 * output. Tells the same six-month story as the admin demo: six past
 * sessions (170 attendees) plus upcoming sessions with realistic
 * partial bookings. Every person is fictional; contacts use
 * @example.com and 555 numbers only. Demo session ids are fixed
 * `demo-*` strings, never UUIDs, so they can never collide with real
 * rows or pass the booking API's session validation.
 */

const DAY_MS = 86_400_000;
const TIME_ZONE = 'America/Chicago';

const TITLES: Record<Topic, { es: string; en: string }> = {
  'introduccion-ia': { es: 'Introducción a la IA', en: 'Introduction to AI' },
  'vida-diaria': { es: 'IA para la Vida Diaria', en: 'AI for Everyday Life' },
  'trabajo-negocios': { es: 'IA para el Trabajo y los Negocios', en: 'AI for Work and Business' },
  'padres-familias': { es: 'IA para Padres y Familias', en: 'AI for Parents and Families' },
};

interface DemoVenue {
  venue: string;
  address: string;
  accessibilityEs: string;
  accessibilityEn: string;
  bringEs: string;
  bringEn: string;
}

const VENUES: DemoVenue[] = [
  {
    venue: 'Oak Cliff Community Center',
    address: '201 S Beckley Ave, Dallas, TX 75208',
    accessibilityEs: 'Entrada sin escalones por Beckley Ave y estacionamiento accesible al frente. Sillas con respaldo y espacio para sillas de ruedas.',
    accessibilityEn: 'Step-free entrance on Beckley Ave with accessible parking in front. Supportive chairs and wheelchair spaces.',
    bringEs: 'Teléfono cargado si tienes uno; hay Wi-Fi gratis y cargadores. Puedes traer cuaderno y pluma.',
    bringEn: 'A charged phone if you have one; free Wi-Fi and chargers available. Bring a notebook and pen if you like.',
  },
  {
    venue: 'Fort Worth Public Library – Central',
    address: '500 W 3rd St, Fort Worth, TX 76102',
    accessibilityEs: 'Biblioteca accesible con elevadores, baños accesibles y estacionamiento designado. Intérprete disponible si se avisa con anticipación.',
    accessibilityEn: 'Accessible library with elevators, accessible restrooms, and designated parking. Interpreter available with advance notice.',
    bringEs: 'Teléfono o tableta si tienes; hay computadoras de la biblioteca como respaldo. Credencial de la biblioteca opcional.',
    bringEn: 'Phone or tablet if you have one; library computers available as backup. Library card optional.',
  },
  {
    venue: 'Arlington Community Center',
    address: '400 S Mary St, Arlington, TX 76010',
    accessibilityEs: 'Salón en planta baja con entrada accesible y estacionamiento cercano. Se permite llegar con niños acompañados.',
    accessibilityEn: 'Ground-floor room with an accessible entrance and nearby parking. Accompanied children are welcome.',
    bringEs: 'Teléfono cargado si tienes uno. Ofrecemos café, agua y materiales impresos.',
    bringEn: 'A charged phone if you have one. Coffee, water, and printed handouts provided.',
  },
  {
    venue: 'Sesión en línea / Online session',
    address: 'En línea · Online (enlace al reservar / link after booking)',
    accessibilityEs: 'Sesión por video con subtítulos en vivo. Los materiales se comparten antes por correo o mensaje.',
    accessibilityEn: 'Video session with live captions. Materials are shared in advance by email or message.',
    bringEs: 'Teléfono, tableta o computadora con conexión. No necesitas instalar nada de pago.',
    bringEn: 'Phone, tablet, or computer with internet. No paid installs needed.',
  },
];

export interface DemoSessionDef {
  id: string;
  topic: Topic;
  language: 'es' | 'en';
  /** Days from `now`; negative sessions are history for seeds only. */
  offsetDays: number;
  startHour: number;
  startMinute: number;
  durationMin: number;
  venue: number;
  capacity: number;
  /** Fictional bookings already placed. */
  booked: number;
}

export const DEMO_SESSION_DEFS: DemoSessionDef[] = [
  { id: 'demo-01', topic: 'introduccion-ia', language: 'es', offsetDays: -168, startHour: 18, startMinute: 0, durationMin: 120, venue: 0, capacity: 30, booked: 24 },
  { id: 'demo-02', topic: 'padres-familias', language: 'es', offsetDays: -140, startHour: 11, startMinute: 0, durationMin: 120, venue: 1, capacity: 35, booked: 31 },
  { id: 'demo-03', topic: 'vida-diaria', language: 'es', offsetDays: -112, startHour: 18, startMinute: 30, durationMin: 120, venue: 3, capacity: 30, booked: 28 },
  { id: 'demo-04', topic: 'introduccion-ia', language: 'es', offsetDays: -84, startHour: 18, startMinute: 0, durationMin: 120, venue: 0, capacity: 45, booked: 42 },
  { id: 'demo-05', topic: 'trabajo-negocios', language: 'es', offsetDays: -56, startHour: 18, startMinute: 0, durationMin: 150, venue: 2, capacity: 30, booked: 26 },
  { id: 'demo-06', topic: 'vida-diaria', language: 'es', offsetDays: -28, startHour: 11, startMinute: 0, durationMin: 120, venue: 1, capacity: 25, booked: 19 },
  { id: 'demo-07', topic: 'introduccion-ia', language: 'es', offsetDays: 5, startHour: 18, startMinute: 0, durationMin: 120, venue: 0, capacity: 30, booked: 22 },
  { id: 'demo-08', topic: 'trabajo-negocios', language: 'es', offsetDays: 12, startHour: 18, startMinute: 30, durationMin: 150, venue: 3, capacity: 30, booked: 17 },
  { id: 'demo-09', topic: 'vida-diaria', language: 'es', offsetDays: 19, startHour: 11, startMinute: 0, durationMin: 120, venue: 1, capacity: 25, booked: 12 },
  { id: 'demo-10', topic: 'padres-familias', language: 'es', offsetDays: 26, startHour: 18, startMinute: 0, durationMin: 120, venue: 2, capacity: 35, booked: 9 },
  { id: 'demo-11', topic: 'introduccion-ia', language: 'en', offsetDays: 33, startHour: 18, startMinute: 0, durationMin: 120, venue: 3, capacity: 30, booked: 6 },
];

function chicagoWall(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso));
  const get = (type: string): string => parts.find((part) => part.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Venue-local wall time for the demo day, resolved to an exact instant.
 * The offset is probed at local noon, which is never a transition hour,
 * and the round trip enforces the same no-ambiguous-time contract as
 * the scheduler's venue conversion. Demo hours (11:00, 18:00, 18:30)
 * always share the probed offset.
 */
function demoStart(now: number, def: DemoSessionDef): string {
  const target = new Date(now + def.offsetDays * DAY_MS);
  const dateParts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(target);
  const part = (type: string): string => dateParts.find((entry) => entry.type === type)!.value;
  const isoDate = `${part('year')}-${part('month')}-${part('day')}`;
  const wall = `${isoDate}T${String(def.startHour).padStart(2, '0')}:${String(def.startMinute).padStart(2, '0')}`;
  const probe = Date.parse(`${isoDate}T12:00:00Z`);
  const offset = Date.parse(`${chicagoWall(new Date(probe).toISOString())}:00Z`) - probe;
  const iso = new Date(Date.parse(`${wall}:00Z`) - offset).toISOString();
  if (chicagoWall(iso) !== wall) throw new Error('ambiguous_venue_time');
  return iso;
}

function demoSession(now: number, def: DemoSessionDef): WorkshopSession {
  const startsAt = demoStart(now, def);
  const endsAt = new Date(Date.parse(startsAt) + def.durationMin * 60_000).toISOString();
  const venue = VENUES[def.venue];
  const titles = TITLES[def.topic];
  return {
    id: def.id, topic: def.topic, titleEs: titles.es, titleEn: titles.en, language: def.language,
    startsAt, endsAt, timeZone: TIME_ZONE, venue: venue.venue, address: venue.address,
    accessibilityEs: venue.accessibilityEs, accessibilityEn: venue.accessibilityEn,
    bringEs: venue.bringEs, bringEn: venue.bringEn,
    status: 'published', capacity: def.capacity, available: Math.max(0, def.capacity - def.booked),
  };
}

/** Upcoming published sessions, as the public schedule shows them. */
export function demoSessions(now = Date.now()): WorkshopSession[] {
  return DEMO_SESSION_DEFS.filter((def) => def.offsetDays > 0)
    .map((def) => demoSession(now, def))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

/** Past sessions with fictional attendance, for seeds and admin review. */
export function demoHistory(now = Date.now()): (WorkshopSession & { attended: number })[] {
  return DEMO_SESSION_DEFS.filter((def) => def.offsetDays < 0)
    .map((def) => ({ ...demoSession(now, def), attended: def.booked }))
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
}

const FIRST = ['María', 'José', 'Ana', 'Luis', 'Carmen', 'Miguel', 'Rosa', 'Juan', 'Elena', 'Pedro', 'Lucía', 'Carlos', 'Sofía', 'Diego', 'Marta', 'Jorge', 'Paula', 'Andrés', 'Isabel', 'Raúl', 'Teresa', 'Hugo', 'Nadia', 'Felipe'];
const LAST = ['García', 'Hernández', 'López', 'Martínez', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Reyes', 'Gutiérrez', 'Ortiz', 'Chávez', 'Ruiz', 'Díaz', 'Mendoza', 'Torres', 'Vargas', 'Castillo', 'Jiménez'];

export interface DemoStudent {
  name: string;
  contact: string;
  contactType: 'email' | 'phone';
}

/** Fictional students for seeds. Contacts are @example.com / 555 only. */
export function demoStudents(count = 60): DemoStudent[] {
  const ascii = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7 + 3) % LAST.length];
    const email = i % 3 !== 2;
    return {
      name: `${first} ${last}`,
      contact: email
        ? `${ascii(first)}.${ascii(last)}${i}@example.com`
        : `(555) ${String(200 + ((i * 37) % 300))}-${String(1000 + ((i * 91) % 9000))}`,
      contactType: email ? 'email' : 'phone',
    };
  });
}

/** The demo student's own upcoming reservation, shown after sign-in. */
export function demoPortalReservations(now = Date.now()): Reservation[] {
  const session = demoSessions(now).find((candidate) => candidate.id === 'demo-08') ?? demoSessions(now)[0];
  return [{ id: 'b7e4f2a1-3c8d-4e5f-9a6b-1d2e3f4a5b6c', reference: 'b7e4f2a1-3c8d-4e5f-9a6b-1d2e3f4a5b6c', status: 'confirmed', session, linked: true }];
}

export interface DemoBooking {
  token: string;
  reservation: Reservation;
}

const DEMO_BOOKING_KEY = 'workshop-demo-bookings';
const demoMemory = new Map<string, DemoBooking>();

function restoreDemoBookings(): void {
  if (demoMemory.size) return;
  try {
    const raw = sessionStorage.getItem(DEMO_BOOKING_KEY);
    if (!raw) return;
    for (const booking of JSON.parse(raw) as DemoBooking[]) demoMemory.set(booking.token, booking);
  } catch {
    // Private mode or unavailable storage: demo bookings stay memory-only.
  }
}

function persistDemoBookings(): void {
  try {
    sessionStorage.setItem(DEMO_BOOKING_KEY, JSON.stringify([...demoMemory.values()]));
  } catch {
    // Private mode: demo bookings stay memory-only.
  }
}

/** Demo bookings live in the browser only; nothing reaches the server. */
export function saveDemoBooking(booking: DemoBooking): void {
  restoreDemoBookings();
  demoMemory.set(booking.token, booking);
  persistDemoBookings();
}

export function readDemoBooking(token: string): DemoBooking | null {
  restoreDemoBookings();
  return demoMemory.get(token) ?? null;
}

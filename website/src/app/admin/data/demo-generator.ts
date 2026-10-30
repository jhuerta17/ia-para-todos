import type { Submission, SubmissionForm } from './submissions';

/**
 * Deterministic synthetic data for admin demo mode. Pure module: no
 * Angular, no I/O, same input always yields the same output, which
 * postbuild verifies. User-written content stays Spanish (as real
 * submissions would be); the admin UI renders it unchanged.
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20260501;
const DAY = 24 * 60 * 60 * 1000;

const FIRST = ['María', 'José', 'Ana', 'Luis', 'Carmen', 'Miguel', 'Rosa', 'Juan', 'Elena', 'Pedro', 'Lucía', 'Carlos', 'Sofía', 'Diego', 'Marta', 'Jorge', 'Paula', 'Andrés', 'Isabel', 'Raúl', 'Teresa', 'Hugo', 'Nadia', 'Felipe'];
const LAST = ['García', 'Hernández', 'López', 'Martínez', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Reyes', 'Gutiérrez', 'Ortiz', 'Chávez', 'Ruiz', 'Díaz', 'Mendoza', 'Torres', 'Vargas', 'Castillo', 'Jiménez'];

const PARTICIPATE_INTERESTS = ['Vida diaria', 'Trabajo', 'Familia', 'Salud', 'Educación'];
const COLLABORATE_INTERESTS = ['Talleres', 'Traducción', 'Voluntariado', 'Espacios', 'Difusión'];

const PARTICIPATE_MESSAGES = [
  'Quiero aprender a usar la IA en mi trabajo.',
  'Me interesa el taller para principiantes.',
  '¿Cuándo es el próximo taller?',
  'Quiero practicar con mi teléfono.',
  'Me gustaría asistir con mi mamá.',
  '¿Necesito experiencia previa?',
  'Quiero aprender a escribir mejores instrucciones.',
  'Me interesa para ayudar a mis hijos con la tarea.',
  '¿El taller es en persona o en línea?',
  'Quiero entender cómo funciona el asistente de voz.',
];

const COLLABORATE_MESSAGES = [
  'Puedo ayudar como voluntaria los sábados.',
  'Tengo experiencia dando clases a adultos.',
  'Nuestra iglesia puede prestar el salón.',
  'Puedo traducir materiales al inglés.',
  'Soy maestra jubilada y quiero participar.',
  'Puedo ayudar con el registro de asistentes.',
];

const ascii = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function generateDemoSubmissions(now: number, months = 6): Submission[] {
  const random = mulberry32(SEED);
  const pick = <T>(pool: T[]): T => pool[Math.floor(random() * pool.length)];
  const rows: Submission[] = [];
  const weeks = Math.round((months * 30.44 * DAY) / (7 * DAY));
  let counter = 0;

  for (let week = weeks - 1; week >= 0; week--) {
    const growth = weeks - 1 - week;
    const counts: Record<SubmissionForm, number> = {
      participate: 1 + Math.floor(growth / 5) + (random() < 0.4 ? 1 : 0),
      collaborate: (growth % 3 === 0 ? 1 : 0) + (random() < 0.25 ? 1 : 0),
      newsletter: 2 + Math.floor(growth / 6) + (random() < 0.5 ? 1 : 0),
    };
    for (const form of ['participate', 'collaborate', 'newsletter'] as const) {
      for (let i = 0; i < counts[form]; i++) {
        counter += 1;
        const first = pick(FIRST);
        const last = pick(LAST);
        const language = random() < 0.8 ? 'es' : 'en';
        const createdAt = new Date(now - week * 7 * DAY - Math.floor(random() * 7 * DAY)).toISOString();
        const named = form !== 'newsletter' || random() < 0.3;
        rows.push({
          id: `demo-${counter}`,
          form,
          createdAt,
          name: named ? `${first} ${last}` : null,
          email: `${ascii(first)}.${ascii(last)}${counter}@example.com`,
          phone: form !== 'newsletter' && random() < 0.5 ? `(555) ${String(200 + Math.floor(random() * 800))}-${String(1000 + Math.floor(random() * 9000))}` : null,
          interest: form === 'participate' ? pick(PARTICIPATE_INTERESTS) : form === 'collaborate' ? pick(COLLABORATE_INTERESTS) : null,
          message: form === 'participate' && random() < 0.85 ? pick(PARTICIPATE_MESSAGES) : form === 'collaborate' && random() < 0.9 ? pick(COLLABORATE_MESSAGES) : null,
          language,
        });
      }
    }
  }
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return rows.map((row, index) => ({ ...row, id: `demo-${String(index + 1).padStart(4, '0')}` }));
}

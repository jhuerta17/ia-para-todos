import type { Context } from '@netlify/functions';

// AI assist proxy: the single server-side doorway to the Muse API for
// the public tutor and the admin triage drafts. API keys never reach
// the browser; without META_MUSE_API_KEY it answers labeled sample
// replies so the demo works with no account. See docs/demo/ai-setup.md.
//
// POST { task: 'tutor' | 'triage', lang: 'es' | 'en',
//        history: [{ role: 'user' | 'assistant', content: string }],
//        input: string, context?: string }
// -> { reply: string, demo: boolean }

const API_URL = (process.env['META_MUSE_API_URL'] ?? 'https://api.meta.ai/v1').replace(/\/+$/, '');
const MODEL = process.env['META_MUSE_MODEL'] ?? 'muse-spark';
const MAX_INPUT = 2000;
const MAX_HISTORY = 6;
const MAX_TOKENS = 400;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

type Task = 'tutor' | 'triage';
type Lang = 'es' | 'en';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEMS: Record<Task, Record<Lang, string>> = {
  tutor: {
    es: 'Eres un tutor paciente de IA para adultos principiantes que hablan español. Usa palabras sencillas y frases cortas. Practica siempre con ejemplos inventados: si la persona comparte datos personales reales (nombre completo, dirección, teléfono, cuentas, salud, dinero, migración, casos legales), recuérdale con amabilidad que use ejemplos ficticios y no repitas esos datos. Reconoce cuando algo puede estar mal y enseña a verificar. Responde en español, máximo 120 palabras.',
    en: 'You are a patient AI tutor for adult beginners. Use simple words and short sentences. Always practice with made-up examples: if the person shares real personal data (full name, address, phone, accounts, health, money, immigration, legal cases), kindly remind them to use fictional examples and do not repeat that data. Admit when something may be wrong and teach verification. Answer in English, max 120 words.',
  },
  triage: {
    es: 'Eres un asistente que redacta borradores de respuesta en español para mensajes de participantes, voluntarios y colaboradores de una iniciativa educativa comunitaria. Tono cálido y breve (máximo 80 palabras). Nunca prometas fechas, empleos, certificaciones ni resultados. Si el mensaje pide algo que no ofrecemos, dilo con amabilidad. Devuelve solo el borrador, sin explicaciones.',
    en: 'You are an assistant drafting short English replies to messages from learners, volunteers, and collaborators of a community education initiative. Warm, brief tone (max 80 words). Never promise dates, jobs, certifications, or outcomes. If the message asks for something not offered, say so kindly. Return only the draft, no explanations.',
  },
};

/** Best-effort PII scrub before anything leaves for the model. Pure. */
export function scrubPII(value: string): string {
  return value
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[correo]')
    .replace(/(\+?\d[\d .-]{7,}\d)/g, '[teléfono]')
    .slice(0, MAX_INPUT);
}

const cleanTurn = (turn: unknown): Turn | null => {
  if (typeof turn !== 'object' || turn === null) return null;
  const record = turn as Record<string, unknown>;
  if (record['role'] !== 'user' && record['role'] !== 'assistant') return null;
  if (typeof record['content'] !== 'string' || record['content'].trim() === '') return null;
  return { role: record['role'], content: scrubPII(record['content']) };
};

/** Build the chat payload. Pure. */
export function buildMessages(task: Task, lang: Lang, history: Turn[], input: string): { role: string; content: string }[] {
  return [
    { role: 'system', content: SYSTEMS[task][lang] },
    ...history.slice(-MAX_HISTORY).map((turn) => ({ role: turn.role, content: turn.content })),
    { role: 'user', content: scrubPII(input) },
  ];
}

/** Labeled sample reply when no API key is configured. Pure. */
export function buildSampleReply(task: Task, lang: Lang, input: string): string {
  const short = input.trim().slice(0, 120);
  if (task === 'triage') {
    return lang === 'es'
      ? `¡Gracias por tu mensaje! Lo leímos con atención: “${short}”. Te contactaremos pronto con los siguientes pasos. Mientras tanto, puedes explorar los talleres gratuitos en esta misma página.`
      : `Thanks for your message! We read it carefully: “${short}”. We will follow up soon with next steps. Meanwhile, feel free to explore the free workshops on this site.`;
  }
  return lang === 'es'
    ? `¡Buen intento! Para practicar con tu ejemplo (“${short}”), prueba esta fórmula: tarea + tema + formato. Por ejemplo: “Dame 3 ideas para una cena saludable, en lista numerada y con palabras fáciles”. Practica siempre con datos inventados. Esta es una respuesta de ejemplo: conecta la API para tutoria en vivo.`
    : `Good try! To practice with your example (“${short}”), try this formula: task + topic + format. For example: “Give me 3 healthy dinner ideas, as a numbered list in simple words.” Always practice with made-up data. This is a sample reply: connect the API for live tutoring.`;
}

/** Extract the assistant text from a chat-completions payload. Pure. */
export function parseReply(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const choices = (payload as Record<string, unknown>)['choices'];
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const message = (choices[0] as Record<string, unknown>)?.['message'] as Record<string, unknown> | undefined;
  const content = message?.['content'];
  if (typeof content === 'string' && content.trim() !== '') return content.trim().slice(0, 2000);
  return null;
}

// Best-effort per-IP rate limit (per function instance).
const hits = new Map<string, { count: number; reset: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now >= entry.reset) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

async function liveReply(task: Task, lang: Lang, history: Turn[], input: string, key: string): Promise<string | null> {
  const started = Date.now();
  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages: buildMessages(task, lang, history, input), max_tokens: MAX_TOKENS, temperature: 0.6 }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      console.error(`ai-assist: upstream ${response.status} for task ${task}`);
      return null;
    }
    const payload = (await response.json()) as unknown;
    const usage = (payload as Record<string, unknown>)['usage'] as Record<string, unknown> | undefined;
    console.log(
      `ai-assist: task=${task} model=${MODEL} ms=${Date.now() - started} ` +
        `prompt=${String(usage?.['prompt_tokens'] ?? '?')} completion=${String(usage?.['completion_tokens'] ?? '?')}`,
    );
    return parseReply(payload);
  } catch (error) {
    console.error(`ai-assist: upstream failed: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(ip)) return new Response('Too many requests', { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  if (typeof body !== 'object' || body === null) return new Response('Bad request', { status: 400 });
  const record = body as Record<string, unknown>;
  if (record['task'] !== 'tutor' && record['task'] !== 'triage') return new Response('Bad request', { status: 400 });
  if (record['lang'] !== 'es' && record['lang'] !== 'en') return new Response('Bad request', { status: 400 });
  if (typeof record['input'] !== 'string' || record['input'].trim() === '') return new Response('Bad request', { status: 400 });
  const history = Array.isArray(record['history']) ? record['history'].map(cleanTurn).filter((turn): turn is Turn => turn !== null) : [];
  const task = record['task'] as Task;
  const lang = record['lang'] as Lang;
  const input = (record['input'] as string).slice(0, MAX_INPUT);

  const key = process.env['META_MUSE_API_KEY'];
  if (key && key.trim() !== '') {
    const reply = await liveReply(task, lang, history, input, key.trim());
    if (reply) return Response.json({ reply, demo: false });
    // Upstream failed: fall through to a labeled sample reply.
  }
  return Response.json({ reply: buildSampleReply(task, lang, input), demo: true });
};

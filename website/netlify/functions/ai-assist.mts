import type { Config, Context } from '@netlify/functions';
import * as security from '../lib/ai-security.mts';

// Live AI uses a shared admin switch and simple per-instance limits.
// These limits intentionally do not enforce a global dollar budget.
//
// POST { task: 'tutor' | 'triage', lang: 'es' | 'en',
//        history: [{ role: 'user' | 'assistant', content: string }],
//        input: string }
// -> { reply: string, demo: boolean }

const MAX_INPUT = 2000;
const MAX_HISTORY = 6;

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
    ? `¡Buen intento! Para practicar con tu ejemplo (“${short}”), prueba esta fórmula: tarea + tema + formato. Por ejemplo: “Dame 3 ideas para una cena saludable, en lista numerada y con palabras fáciles”. Practica siempre con datos inventados. Esta es una respuesta de ejemplo.`
    : `Good try! To practice with your example (“${short}”), try this formula: task + topic + format. For example: “Give me 3 healthy dinner ideas, as a numbered list in simple words.” Always practice with made-up data. This is a sample reply.`;
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

export interface Dependencies {
  control: security.LiveControl;
  limits: security.LocalLimits;
  fetch: typeof fetch;
  getUser: typeof security.adminUser;
  now: () => number;
}
const defaults: Dependencies = { control: security.liveControl, limits: new security.LocalLimits(), fetch: (...args) => fetch(...args), getUser: security.adminUser, now: Date.now };

function validate(body: Record<string, unknown>): { task: Task; lang: Lang; input: string; history: Turn[] } {
  if (Object.keys(body).some(key => !['task', 'lang', 'input', 'history', 'acknowledged'].includes(key))) throw new security.HttpError(400, 'unsupported_field');
  if (body['task'] !== 'tutor' && body['task'] !== 'triage') throw new security.HttpError(400, 'invalid_task');
  if (body['lang'] !== 'es' && body['lang'] !== 'en') throw new security.HttpError(400, 'invalid_language');
  if (typeof body['input'] !== 'string' || !body['input'].trim() || body['input'].length > MAX_INPUT) throw new security.HttpError(400, 'invalid_input');
  const history = body['history'] ?? [];
  if (!Array.isArray(history) || history.length > MAX_HISTORY || history.some(turn => !cleanTurn(turn) || typeof turn.content !== 'string' || turn.content.length > MAX_INPUT || Object.keys(turn).some(k => !['role', 'content'].includes(k)))) throw new security.HttpError(400, 'invalid_history');
  return { task: body['task'], lang: body['lang'], input: scrubPII(body['input']), history: history.map(cleanTurn) as Turn[] };
}
function responseText(payload: Record<string, unknown>): string | null {
  const output = payload['output'];
  if (!Array.isArray(output)) return null;
  const text = output.filter(item => item?.type === 'message' && item?.role === 'assistant')
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .filter(item => item?.type === 'output_text' && typeof item?.text === 'string').map(item => item.text).join('\n').trim();
  return text ? text.slice(0, 2000) : null;
}
export function createHandler(deps: Dependencies = defaults) {
  return async (req: Request, context: Context): Promise<Response> => {
    try {
      if (req.method !== 'POST') return security.json({ reason: 'method_not_allowed' }, 405, { Allow: 'POST' });
      if (!security.allowedOrigin(req)) throw new security.HttpError(403, 'origin_not_allowed');
      const awaitedBody = await security.readJSON(req);
      const { task, lang, input, history } = validate(awaitedBody);
      // Authenticate triage even when live AI is disabled or no API key is set.
      if (task === 'triage') await security.requireAdmin(deps.getUser);
      const sample = (reason: string) => {
        security.audit(context, { task, reason, demo: true });
        return security.json({ reply: buildSampleReply(task, lang, input), demo: true, reason });
      };
      if (!security.liveConfigured(context)) return sample('unavailable');
      try { if (!await deps.control.read()) return sample('paused'); } catch { return sample('unavailable'); }
      if (task === 'tutor' && (awaitedBody['acknowledged'] !== true)) return sample('acknowledgement_required');
      const now = deps.now();
      const admission = deps.limits.admit(context.ip, now);
      if (!admission.allowed) {
        const reason = admission.reason ?? 'unavailable';
        if (!admission.retryAt) return sample(reason);
        security.audit(context, { task, reason, demo: true });
        return security.json({ reason, retryAt: admission.retryAt }, 429,
          { 'Retry-After': String(Math.max(1, Math.ceil((Date.parse(admission.retryAt) - now) / 1000))) });
      }
      const model = security.MODELS[task];
      let reply: string | null = null;
      let usageInput = -1, usageOutput = -1;
      let failureReason = 'upstream_unavailable';
      let upstreamStatus = 0;
      let reasoningTokens = -1;
      let incompleteReason: string | null = null;
      const payload = { model, instructions: SYSTEMS[task][lang],
        input: [...history, { role: 'user', content: input }], tools: [], reasoning: { effort: security.REASONING_EFFORT } };
      const signal = AbortSignal.timeout(20000);
      const headers = { Authorization: `Bearer ${security.env('META_MUSE_API_KEY').trim()}`, 'Content-Type': 'application/json' };
      try {
        if (!await deps.control.read()) return sample('paused');
        const response = await deps.fetch('https://api.meta.ai/v1/responses', {
          method: 'POST', headers, signal, redirect: 'error',
          body: JSON.stringify({ ...payload, max_output_tokens: security.OUTPUT_TOKEN_CAP, store: false }),
        });
        upstreamStatus = response.status;
        if (!response.ok) {
          failureReason = response.status === 401 || response.status === 403 ? 'provider_authentication_failed'
            : response.status === 429 ? 'provider_rate_limited' : 'upstream_unavailable';
          throw new Error('upstream_unavailable');
        }
        const result = await response.json() as Record<string, unknown>;
        const usage = result['usage'] as Record<string, unknown> | undefined;
        const uin = usage?.['input_tokens'], uout = usage?.['output_tokens'];
        if (Number.isSafeInteger(uin) && Number.isSafeInteger(uout) && (uin as number) >= 0 && (uout as number) >= 0) {
          usageInput = uin as number; usageOutput = uout as number;
        }
        const details = usage?.['output_tokens_details'] as Record<string, unknown> | undefined;
        if (Number.isSafeInteger(details?.['reasoning_tokens'])) reasoningTokens = details!['reasoning_tokens'] as number;
        const incomplete = result['incomplete_details'] as Record<string, unknown> | undefined;
        const reportedReason = incomplete?.['reason'];
        incompleteReason = typeof reportedReason === 'string' && ['max_output_tokens', 'content_filter', 'context_window_exceeded'].includes(reportedReason) ? reportedReason : null;
        reply = responseText(result);
        if (!reply) failureReason = result['status'] === 'incomplete' ? 'provider_output_limit' : 'provider_empty_response';
      } catch { /* No retries and no provider error bodies in logs. */ }
      finally { admission.release?.(); }
      security.audit(context, { task, model, inputTokens: usageInput, outputTokens: usageOutput,
        reasoningTokens, upstreamStatus, incompleteReason: incompleteReason ?? 'none', reason: reply ? 'ok' : failureReason, demo: !reply });
      return security.json({ reply: reply ?? buildSampleReply(task, lang, input), demo: !reply,
        reason: reply ? undefined : failureReason, remaining: admission.remaining,
        generation: { upstreamStatus, incompleteReason, inputTokens: usageInput, outputTokens: usageOutput, reasoningTokens } });
    } catch (error) {
      if (error instanceof security.HttpError) {
        security.audit(context, { reason: error.message, status: error.status });
        return security.json({ reason: error.message }, error.status);
      }
      security.audit(context, { reason: 'unavailable', demo: true });
      return security.json({ reason: 'unavailable' }, 503);
    }
  };
}
export default createHandler();
// Keep a plain object initializer: Netlify's static parser ignores named exports wrapped in `satisfies`.
export const config: Config = {
  path: '/api/ai-assist',
  rateLimit: { action: 'rate_limit', windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

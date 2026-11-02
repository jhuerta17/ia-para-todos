import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

interface ChatMessage { from: 'user' | 'ai'; text: string; demo: boolean }
const copy = {
  es: {
    heading: 'Practica con IA', lead: 'Hazle preguntas al tutor y ensaya tu primer prompt aquí mismo.',
    placeholder: 'Escribe tu pregunta o tu prompt…', send: 'Enviar', thinking: 'Escribiendo…', sample: 'Respuesta de ejemplo',
    privacy: 'Usa ejemplos inventados. No compartas datos personales.',
    greeting: '¡Hola! Soy tu tutor de práctica. Escríbeme un prompt y te ayudo a mejorarlo, paso a paso.',
    disclosure: 'La práctica en vivo usa Meta en modo Contributor: Meta puede usar tus preguntas y sus respuestas para entrenar sus modelos. Usa solo ejemplos inventados. Eliminar correos y teléfonos no elimina todos los datos personales.',
    acknowledge: 'Entiendo y acepto este uso para practicar con datos inventados.', verify: 'Usar práctica en vivo',
    verification: 'Acepta el aviso para practicar en vivo, o continúa con ejemplos.',
    cooldown: 'Espera un momento para volver a usar la IA en vivo. Mientras tanto, practica con ejemplos.',
    allowance: 'Llegaste al límite de práctica en vivo de hoy. Puedes continuar con ejemplos.',
    unavailable: 'La práctica en vivo no está disponible. Puedes continuar con respuestas de ejemplo.',
    paused: 'La práctica en vivo está apagada. Puedes continuar con respuestas de ejemplo.',
    ready: 'Práctica en vivo activada.',
    localSample: 'Para mejorar tu prompt, incluye tarea + tema + formato. Por ejemplo: “Dame 3 ideas para una cena saludable, en lista numerada y con palabras fáciles”. Practica con datos inventados. Esta es una respuesta de ejemplo.',
  },
  en: {
    heading: 'Practice with AI', lead: 'Ask the tutor questions and rehearse your first prompt right here.',
    placeholder: 'Type your question or prompt…', send: 'Send', thinking: 'Typing…', sample: 'Sample reply',
    privacy: 'Use made-up examples. Do not share personal data.',
    greeting: 'Hi! I am your practice tutor. Write me a prompt and I will help you improve it, step by step.',
    disclosure: 'Live practice uses Meta Contributor mode: Meta may use your questions and its replies to train its models. Use fictional examples only. Removing emails and phone numbers does not remove all personal data.',
    acknowledge: 'I understand and accept this use for practice with fictional data.', verify: 'Use live practice',
    verification: 'Accept the notice to practice with live AI, or continue with samples.',
    cooldown: 'Please wait before using live AI again. You can practice with samples meanwhile.',
    allowance: 'You reached today’s live practice allowance. You can continue with samples.',
    unavailable: 'Live practice is unavailable. You can continue with sample replies.',
    paused: 'Live practice is turned off. You can continue with sample replies.',
    ready: 'Live practice enabled.',
    localSample: 'To improve your prompt, include task + topic + format. For example: “Give me 3 healthy dinner ideas, as a numbered list in simple words.” Practice with made-up data. This is a sample reply.',
  },
} satisfies Record<Lang, Record<string, string>>;

@Component({ selector: 'app-ai-tutor', imports: [RevealOnEnter], templateUrl: './ai-tutor.html', styleUrl: './ai-tutor.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class AiTutor {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly sending = signal(false);
  protected readonly available = signal(false);
  protected readonly acknowledged = signal(false);
  protected readonly reason = signal('unavailable');
  protected readonly status = computed(() => {
    switch (this.reason()) {
      case 'acknowledgement_required': return this.c().verification;
      case 'busy': case 'cooldown': return this.c().cooldown;
      case 'allowance_exhausted': return this.c().allowance;
      case 'paused': return this.c().paused;
      case 'ok': return this.c().ready;
      default: return this.c().unavailable;
    }
  });
  private retryAt = 0;
  constructor() { afterNextRender(() => void this.loadStatus()); }
  protected greeting(): ChatMessage { return { from: 'ai', text: this.c().greeting, demo: false }; }
  private async loadStatus(): Promise<void> {
    try {
      const response = await fetch('/api/ai-status', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error();
      const payload = await response.json() as { live?: boolean };
      this.available.set(payload.live === true);
      this.reason.set(payload.live ? (this.acknowledged() ? 'ok' : 'acknowledgement_required') : 'paused');
    } catch { this.available.set(false); this.reason.set('unavailable'); }
  }
  protected enable(): void { if (this.acknowledged()) this.reason.set('ok'); }
  protected async send(value: string): Promise<void> {
    const input = value.trim().slice(0, 2000);
    if (!input || this.sending()) return;
    this.sending.set(true);
    const prior = this.messages();
    this.messages.set([...prior, { from: 'user', text: input, demo: false }].slice(-100) as ChatMessage[]);
    let reply: string = this.c().localSample;
    let demo = true;
    try {
      if (Date.now() >= this.retryAt) await this.loadStatus();
      if (this.available() && this.acknowledged() && Date.now() >= this.retryAt) {
        const history = prior.slice(-6).map(turn => ({ role: turn.from === 'user' ? 'user' : 'assistant', content: turn.text }));
        const response = await fetch('/api/ai-assist', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: 'tutor', lang: this.language.lang(), history, input, acknowledged: true }), signal: AbortSignal.timeout(30000),
        });
        const payload = await response.json() as { reply?: string; demo?: boolean; reason?: string; retryAt?: string };
        if (response.status === 429) {
          this.reason.set(payload.reason ?? 'cooldown');
          this.retryAt = Date.parse(payload.retryAt ?? '') || Date.now() + 60000;
        } else if (response.ok && typeof payload.reply === 'string' && payload.reply.trim()) {
          reply = payload.reply; demo = payload.demo !== false; this.reason.set(payload.reason ?? 'ok');
          if (demo && payload.reason !== 'acknowledgement_required') this.available.set(false);
        } else throw new Error();
      }
    } catch { this.reason.set('unavailable'); this.available.set(false); }
    finally {
      this.messages.set([...this.messages(), { from: 'ai', text: reply, demo }].slice(-100) as ChatMessage[]);
      this.sending.set(false);
    }
  }
}

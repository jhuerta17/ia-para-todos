import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
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
    acknowledge: 'Entiendo y acepto este uso para practicar con datos inventados.', verify: 'Activar práctica en vivo',
    verification: 'Completa la verificación para usar la IA en vivo. Puedes seguir con ejemplos sin activarla.',
    cooldown: 'Espera un momento para volver a usar la IA en vivo. Mientras tanto, practica con ejemplos.',
    allowance: 'Llegaste al límite de práctica en vivo de hoy. Puedes continuar con ejemplos.',
    unavailable: 'La práctica en vivo no está disponible. Puedes continuar con respuestas de ejemplo.',
    budget: 'La práctica en vivo alcanzó su límite compartido. Puedes continuar con ejemplos.',
    ready: 'Práctica en vivo activada: máximo 10 preguntas al día.', remaining: 'Preguntas en vivo restantes hoy:',
    localSample: 'Para mejorar tu prompt, incluye tarea + tema + formato. Por ejemplo: “Dame 3 ideas para una cena saludable, en lista numerada y con palabras fáciles”. Practica con datos inventados. Esta es una respuesta de ejemplo.',
  },
  en: {
    heading: 'Practice with AI', lead: 'Ask the tutor questions and rehearse your first prompt right here.',
    placeholder: 'Type your question or prompt…', send: 'Send', thinking: 'Typing…', sample: 'Sample reply',
    privacy: 'Use made-up examples. Do not share personal data.',
    greeting: 'Hi! I am your practice tutor. Write me a prompt and I will help you improve it, step by step.',
    disclosure: 'Live practice uses Meta Contributor mode: Meta may use your questions and its replies to train its models. Use fictional examples only. Removing emails and phone numbers does not remove all personal data.',
    acknowledge: 'I understand and accept this use for practice with fictional data.', verify: 'Enable live practice',
    verification: 'Complete verification to use live AI. You can keep practicing with samples without enabling it.',
    cooldown: 'Please wait before using live AI again. You can practice with samples meanwhile.',
    allowance: 'You reached today’s live practice allowance. You can continue with samples.',
    unavailable: 'Live practice is unavailable. You can continue with sample replies.',
    budget: 'Live practice reached its shared usage limit. You can continue with samples.',
    ready: 'Live practice enabled: up to 10 questions per day.', remaining: 'Live questions remaining today:',
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
  protected readonly verified = signal(false);
  protected readonly acknowledged = signal(false);
  protected readonly verifying = signal(false);
  protected readonly reason = signal('unavailable');
  protected readonly remaining = signal<number | null>(null);
  protected readonly status = computed(() => {
    switch (this.reason()) {
      case 'verification_required': return this.c().verification;
      case 'busy': case 'cooldown': return this.c().cooldown;
      case 'allowance_exhausted': return this.c().allowance;
      case 'budget_exhausted': return this.c().budget;
      case 'ok': return this.c().ready;
      default: return this.c().unavailable;
    }
  });
  private readonly challenge = viewChild<ElementRef<HTMLDivElement>>('challenge');
  private siteKey = '';
  private widget: string | null = null;
  private retryAt = 0;
  private disposed = false;
  constructor() {
    afterNextRender(() => void this.loadSession());
    inject(DestroyRef).onDestroy(() => {
      this.disposed = true;
      if (this.widget !== null) window.turnstile?.remove(this.widget);
    });
  }
  protected greeting(): ChatMessage { return { from: 'ai', text: this.c().greeting, demo: false }; }
  private async loadSession(): Promise<void> {
    try {
      const response = await fetch('/api/ai-session', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return;
      const payload = await response.json() as { live?: boolean; verified?: boolean; siteKey?: string };
      if (this.disposed) return;
      this.available.set(payload.live === true); this.verified.set(payload.verified === true);
      this.siteKey = typeof payload.siteKey === 'string' ? payload.siteKey : '';
      this.reason.set(payload.live ? (payload.verified ? 'ok' : 'verification_required') : 'unavailable');
    } catch { /* Offline practice stays local. */ }
  }
  protected async verify(): Promise<void> {
    if (!this.acknowledged() || this.verifying() || !this.siteKey) return;
    this.verifying.set(true);
    try {
      await loadTurnstile();
      if (this.disposed) return;
      const node = this.challenge()?.nativeElement;
      if (!node || !window.turnstile) throw new Error();
      if (this.widget !== null) window.turnstile.remove(this.widget);
      this.widget = window.turnstile.render(node, {
        sitekey: this.siteKey, action: 'ai_trial', callback: (token: string) => void this.finishVerification(token),
        'error-callback': () => { this.verifying.set(false); this.reason.set('verification_required'); },
        'expired-callback': () => { this.verifying.set(false); this.reason.set('verification_required'); },
      });
    } catch { this.verifying.set(false); this.reason.set('unavailable'); }
  }
  private async finishVerification(token: string): Promise<void> {
    try {
      const response = await fetch('/api/ai-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, acknowledged: this.acknowledged() }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok || (await response.json()).verified !== true) throw new Error();
      this.verified.set(true); this.reason.set('ok');
    } catch { this.reason.set('verification_required'); }
    finally { this.verifying.set(false); }
  }
  protected async send(value: string): Promise<void> {
    const input = value.trim().slice(0, 2000);
    if (!input || this.sending()) return;
    this.sending.set(true);
    const prior = this.messages();
    this.messages.set([...prior, { from: 'user', text: input, demo: false }].slice(-100) as ChatMessage[]);
    let reply: string = this.c().localSample;
    let demo = true;
    try {
      if (this.available() && this.verified() && Date.now() >= this.retryAt) {
        const history = prior.slice(-6).map(turn => ({ role: turn.from === 'user' ? 'user' : 'assistant', content: turn.text }));
        const response = await fetch('/api/ai-assist', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: 'tutor', lang: this.language.lang(), history, input }), signal: AbortSignal.timeout(30000),
        });
        const payload = await response.json() as { reply?: string; demo?: boolean; reason?: string; remaining?: number; retryAt?: string };
        if (response.status === 429) {
          this.reason.set(payload.reason ?? 'cooldown');
          this.retryAt = Date.parse(payload.retryAt ?? '') || Date.now() + 60000;
        } else if (response.ok && typeof payload.reply === 'string' && payload.reply.trim()) {
          reply = payload.reply; demo = payload.demo !== false; this.reason.set(payload.reason ?? 'ok');
          if (demo) { this.verified.set(false); if (payload.reason !== 'verification_required') this.available.set(false); }
        } else throw new Error();
        if (typeof payload.remaining === 'number') this.remaining.set(payload.remaining);
      }
    } catch { this.reason.set('unavailable'); this.available.set(false); this.verified.set(false); }
    finally {
      this.messages.set([...this.messages(), { from: 'ai', text: reply, demo }].slice(-100) as ChatMessage[]);
      this.sending.set(false);
    }
  }
}
interface Turnstile { render(node: HTMLElement, options: Record<string, unknown>): string; remove(id: string): void }
declare global { interface Window { turnstile?: Turnstile } }
let turnstileLoading: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!turnstileLoading) turnstileLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true;
    const timer = setTimeout(() => { script.remove(); reject(new Error('verification_unavailable')); }, 10000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('verification_unavailable')); };
    document.head.appendChild(script);
  }).catch(error => { turnstileLoading = null; throw error; });
  return turnstileLoading;
}

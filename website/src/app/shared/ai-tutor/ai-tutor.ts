import { ActionButton } from '../action-button';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { tutorCopy as copy } from './tutor-copy';
import { TUTOR_INPUT_LIMIT, TUTOR_CONTEXT_LIMIT } from './tutor-core';

interface ChatMessage { from: 'user' | 'ai'; text: string; demo: boolean }


@Component({ selector: 'app-ai-tutor', imports: [ActionButton, RevealOnEnter], templateUrl: './ai-tutor.html', styleUrl: './ai-tutor.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class AiTutor {
  readonly challenge = input('');
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
      case 'provider_authentication_failed': case 'provider_rate_limited': case 'upstream_unavailable':
      case 'provider_output_limit': case 'provider_empty_response': return this.c().connectionError;
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
      const payload = await response.json() as { live?: boolean; reason?: string };
      this.available.set(payload.live === true);
      this.reason.set(payload.live ? (this.acknowledged() ? 'ok' : 'acknowledgement_required') : (payload.reason ?? 'paused'));
    } catch { this.available.set(false); this.reason.set('unavailable'); }
  }
  protected enable(): void { if (this.acknowledged()) this.reason.set('ok'); }
  protected async send(value: string): Promise<void> {
    const input = value.trim().slice(0, TUTOR_INPUT_LIMIT);
    if (!input || this.sending()) return;
    this.sending.set(true);
    const prior = this.messages();
    this.messages.set([...prior, { from: 'user', text: input, demo: false }].slice(-100) as ChatMessage[]);
    let reply: string = this.challenge() ? (this.language.lang() === 'es' ? 'Respuesta de ejemplo: revisa si tu instrucción incluye tarea, contexto y formato. Para este reto, especifica el público y el tono. Pide después un cambio concreto y compara las dos versiones. Usa solo datos inventados y verifica cualquier fecha, precio o promesa.' : 'Sample reply: check whether your prompt includes task, context, and format. For this challenge, specify the audience and tone. Request a specific change next and compare both versions. Use fictional details and verify any dates, prices, or promises.') : this.c().localSample;
    let demo = true;
    try {
      if (Date.now() >= this.retryAt) await this.loadStatus();
      if (this.available() && this.acknowledged() && Date.now() >= this.retryAt) {
        const history = prior.filter(turn => !turn.demo).slice(-TUTOR_CONTEXT_LIMIT).map(turn => ({ role: turn.from === 'user' ? 'user' : 'assistant', content: turn.text }));
        const response = await fetch('/api/ai-assist', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: 'tutor', lang: this.language.lang(), history, input, challenge: this.challenge() || undefined, acknowledged: true }), signal: AbortSignal.timeout(30000),
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

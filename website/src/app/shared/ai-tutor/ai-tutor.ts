import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

interface ChatMessage {
  from: 'user' | 'ai';
  text: string;
  demo: boolean;
}

const copy: Record<Lang, { heading: string; lead: string; placeholder: string; send: string; thinking: string; sample: string; error: string; privacy: string; greeting: string }> = {
  es: {
    heading: 'Practica con IA',
    lead: 'Hazle preguntas al tutor y ensaya tu primer prompt aquí mismo.',
    placeholder: 'Escribe tu pregunta o tu prompt…',
    send: 'Enviar',
    thinking: 'Escribiendo…',
    sample: 'Respuesta de ejemplo',
    error: 'No pudimos contactar al tutor. Inténtalo de nuevo.',
    privacy: 'Usa ejemplos inventados. No compartas datos personales.',
    greeting: '¡Hola! Soy tu tutor de práctica. Escríbeme un prompt y te ayudo a mejorarlo, paso a paso.',
  },
  en: {
    heading: 'Practice with AI',
    lead: 'Ask the tutor questions and rehearse your first prompt right here.',
    placeholder: 'Type your question or prompt…',
    send: 'Send',
    thinking: 'Typing…',
    sample: 'Sample reply',
    error: 'Could not reach the tutor. Try again.',
    privacy: 'Use made-up examples. Do not share personal data.',
    greeting: 'Hi! I am your practice tutor. Write me a prompt and I will help you improve it, step by step.',
  },
};

// Interactive beginner tutor backed by the ai-assist proxy. Renders a
// static greeting at prerender time; network happens only on send.
@Component({selector: 'app-ai-tutor', imports: [RevealOnEnter], templateUrl: './ai-tutor.html', styleUrl: './ai-tutor.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class AiTutor {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly sending = signal(false);
  protected readonly failed = signal(false);

  protected greeting(): ChatMessage {
    return { from: 'ai', text: this.c().greeting, demo: false };
  }

  protected async send(value: string): Promise<void> {
    const input = value.trim();
    if (input === '' || this.sending()) return;
    this.failed.set(false);
    this.sending.set(true);
    const prior = this.messages();
    this.messages.set([...prior, { from: 'user', text: input.slice(0, 2000), demo: false }]);
    try {
      const history = [...prior, { from: 'user' as const, text: input.slice(0, 2000), demo: false }]
        .slice(-6)
        .map((turn) => ({ role: turn.from === 'user' ? 'user' : 'assistant', content: turn.text }));
      const response = await fetch('/.netlify/functions/ai-assist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ task: 'tutor', lang: this.language.lang(), history: history.slice(0, -1), input }),
      });
      if (!response.ok) throw new Error(`tutor ${response.status}`);
      const payload = (await response.json()) as { reply?: unknown; demo?: unknown };
      if (typeof payload.reply !== 'string' || payload.reply.trim() === '') throw new Error('tutor empty reply');
      this.messages.set([...this.messages(), { from: 'ai', text: payload.reply, demo: payload.demo === true }]);
    } catch {
      this.failed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}

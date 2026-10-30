import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

const copy: Record<Lang, { heading: string; lead: string; label: string; ph: string; error: string; button: string; sending: string; result: string; failed: string; honeypot: string; interest: string }> = {
  es: {
    heading: 'Avísame cuando abran los cursos',
    lead: 'Déjanos tu correo y te escribiremos cuando cada curso esté listo. Sin spam.',
    label: 'Correo electrónico', ph: 'nombre@ejemplo.com', error: 'Escribe un correo válido.',
    button: 'Avisarme', sending: 'Enviando…', result: '¡Listo! Te avisaremos cuando abran los cursos.',
    failed: 'No pudimos registrarte. Inténtalo de nuevo.', honeypot: 'No completar este campo',
    interest: 'Cursos en línea',
  },
  en: {
    heading: 'Notify me when courses open',
    lead: 'Leave your email and we will write when each course is ready. No spam.',
    label: 'Email', ph: 'name@example.com', error: 'Write a valid email.',
    button: 'Notify me', sending: 'Sending…', result: 'Done! We will let you know when courses open.',
    failed: 'We could not sign you up. Try again.', honeypot: 'Do not fill in this field',
    interest: 'Online courses',
  },
};

// Course waitlist: posts to the newsletter Netlify form tagged with the
// course interest, so signups land in the admin inbox like any other row.
@Component({selector: 'app-course-waitlist', imports: [ReactiveFormsModule, RevealOnEnter], templateUrl: './course-waitlist.html', styleUrl: './course-waitlist.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class CourseWaitlist {
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly complete = signal(false);
  protected readonly failed = signal(false);
  protected readonly sending = signal(false);
  protected readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.complete.set(false);
    this.failed.set(false);
    this.email.markAsTouched();
    if (this.email.invalid || this.sending()) return;
    this.sending.set(true);
    try {
      const body = new URLSearchParams({
        'form-name': 'newsletter',
        'bot-field': '',
        language: this.language.lang(),
        interest: this.c().interest,
        email: this.email.value.trim(),
      });
      const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      if (!response.ok) throw new Error(`Netlify Forms responded ${response.status}`);
      this.complete.set(true);
      this.email.reset();
    } catch {
      this.failed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}

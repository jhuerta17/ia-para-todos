import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActionButton } from '../../../shared/action-button';
import { Language } from '../../../i18n/language';
import type { Lang } from '../../../i18n/lang';

export interface PortalCredentials {
  email: string;
  password: string;
}

const copy = {
  es: {
    email: 'Correo electrónico', emailPlaceholder: 'nombre@example.com', emailRequired: 'El correo es obligatorio.',
    emailInvalid: 'Escribe un correo válido.', password: 'Contraseña', passwordPlaceholder: 'Tu contraseña',
    passwordRequired: 'La contraseña es obligatoria.', submit: 'Iniciar sesión', submitting: 'Entrando…',
  },
  en: {
    email: 'Email', emailPlaceholder: 'name@example.com', emailRequired: 'Email is required.',
    emailInvalid: 'Enter a valid email.', password: 'Password', passwordPlaceholder: 'Your password',
    passwordRequired: 'Password is required.', submit: 'Sign in', submitting: 'Signing in…',
  },
} satisfies Record<Lang, Record<string, string>>;

// Student sign-in fields in the public form style. The parent performs
// the real Identity login and feeds back errors.
@Component({
  selector: 'app-portal-login-form',
  imports: [ActionButton, ReactiveFormsModule],
  templateUrl: './portal-login-form.html',
  styleUrls: ['./portal-forms.css', '../../../shared/form-controls.css'],
})
export class PortalLoginForm {
  @Output() submitted = new EventEmitter<PortalCredentials>();

  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly submitting = signal(false);
  protected readonly failed = signal<string | null>(null);

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  /** Called by the parent when the Identity login rejects. */
  reportFailure(message: string): void {
    this.submitting.set(false);
    this.failed.set(message);
  }

  protected isInvalid(field: 'email' | 'password'): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  protected errorFor(field: 'email' | 'password'): string {
    const control = this.form.get(field);
    if (!control || !control.errors) return '';
    if (field === 'email') {
      if (control.errors['required']) return this.c().emailRequired;
      if (control.errors['email']) return this.c().emailInvalid;
    }
    if (field === 'password' && control.errors['required']) return this.c().passwordRequired;
    return '';
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.failed.set(null);
    this.submitting.set(true);
    this.submitted.emit(this.form.getRawValue());
  }
}

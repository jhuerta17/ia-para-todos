import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActionButton } from '../../../shared/action-button';
import { Language } from '../../../i18n/language';
import type { Lang } from '../../../i18n/lang';

export interface PortalSignup {
  name: string;
  email: string;
  password: string;
}

const copy = {
  es: {
    name: 'Nombre', namePlaceholder: '¿Cómo te llamas?', nameRequired: 'Tu nombre es obligatorio.',
    email: 'Correo electrónico', emailPlaceholder: 'nombre@example.com', emailRequired: 'El correo es obligatorio.',
    emailInvalid: 'Escribe un correo válido.', password: 'Contraseña', passwordPlaceholder: 'Mínimo 8 caracteres',
    passwordRequired: 'La contraseña es obligatoria.', passwordShort: 'Usa al menos 8 caracteres.',
    adult: 'Tengo 18 años o más y entiendo que se guarda mi progreso y mis conversaciones vencen a los 30 días.', adultRequired: 'Confirma que tienes 18 años o más y que leíste el aviso.', submit: 'Crear cuenta', submitting: 'Creando cuenta…',
  },
  en: {
    name: 'Name', namePlaceholder: 'What is your name?', nameRequired: 'Your name is required.',
    email: 'Email', emailPlaceholder: 'name@example.com', emailRequired: 'Email is required.',
    emailInvalid: 'Enter a valid email.', password: 'Password', passwordPlaceholder: 'At least 8 characters',
    passwordRequired: 'Password is required.', passwordShort: 'Use at least 8 characters.',
    adult: 'I am 18 or older and understand that progress is saved and chats are kept for 30 days.', adultRequired: 'Confirm you are 18 or older and have read the notice.', submit: 'Create account', submitting: 'Creating account…',
  },
} satisfies Record<Lang, Record<string, string>>;

// Student registration fields. The parent performs the real Identity
// signup and feeds back errors; success shows a confirm-email state.
@Component({
  selector: 'app-portal-signup-form',
  imports: [ActionButton, ReactiveFormsModule],
  templateUrl: './portal-signup-form.html',
  styleUrls: ['./portal-forms.css', '../../../shared/form-controls.css'],
})
export class PortalSignupForm {
  @Output() submitted = new EventEmitter<PortalSignup>();

  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly submitting = signal(false);
  protected readonly failed = signal<string | null>(null);

  protected readonly form = new FormGroup({
    adult: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  /** Called by the parent when the Identity signup rejects. */
  reportFailure(message: string): void {
    this.submitting.set(false);
    this.failed.set(message);
  }

  protected isInvalid(field: 'name' | 'email' | 'password'): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  protected errorFor(field: 'name' | 'email' | 'password'): string {
    const control = this.form.get(field);
    if (!control || !control.errors) return '';
    if (field === 'name' && control.errors['required']) return this.c().nameRequired;
    if (field === 'email') {
      if (control.errors['required']) return this.c().emailRequired;
      if (control.errors['email']) return this.c().emailInvalid;
    }
    if (field === 'password') {
      if (control.errors['required']) return this.c().passwordRequired;
      if (control.errors['minlength']) return this.c().passwordShort;
    }
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

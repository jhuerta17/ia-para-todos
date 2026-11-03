import { Component, computed, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActionButton } from '../../../shared/action-button';
import { Language } from '../../../i18n/language';
import type { Lang } from '../../../i18n/lang';

const copy = {
  es: {
    password: 'Nueva contraseña', passwordPlaceholder: 'Mínimo 8 caracteres',
    passwordRequired: 'La contraseña es obligatoria.', passwordShort: 'Usa al menos 8 caracteres.',
    confirm: 'Confirma tu contraseña', confirmPlaceholder: 'Repite tu contraseña',
    confirmRequired: 'Confirma tu contraseña.', mismatch: 'Las contraseñas no coinciden.',
    save: 'Guardar contraseña', saving: 'Guardando…',
  },
  en: {
    password: 'New password', passwordPlaceholder: 'At least 8 characters',
    passwordRequired: 'Password is required.', passwordShort: 'Use at least 8 characters.',
    confirm: 'Confirm your password', confirmPlaceholder: 'Repeat your password',
    confirmRequired: 'Confirm your password.', mismatch: 'Passwords do not match.',
    save: 'Save password', saving: 'Saving…',
  },
} satisfies Record<Lang, Record<string, string>>;

// Password-set form for recovery completion. Same submit contract as
// the admin password form, in the public form style.
@Component({
  selector: 'app-portal-password-form',
  imports: [ActionButton, ReactiveFormsModule],
  templateUrl: './portal-password-form.html',
  styleUrls: ['./portal-forms.css', '../../../shared/form-controls.css'],
})
export class PortalPasswordForm {
  readonly submitLabel = input<string | null>(null);
  @Output() submitted = new EventEmitter<string>();

  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly submitting = signal(false);
  protected readonly failed = signal<string | null>(null);

  protected readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirm: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  /** Called by the parent when the Identity call rejects. */
  reportFailure(message: string): void {
    this.submitting.set(false);
    this.failed.set(message);
  }

  protected passwordError(): string {
    const control = this.form.get('password');
    if (!control || !control.errors || !(control.dirty || control.touched)) return '';
    if (control.errors['required']) return this.c().passwordRequired;
    if (control.errors['minlength']) return this.c().passwordShort;
    return '';
  }

  protected confirmError(): string {
    const control = this.form.get('confirm');
    if (!control || !(control.dirty || control.touched)) return '';
    if (control.errors?.['required']) return this.c().confirmRequired;
    if (this.form.get('password')?.value !== control.value) return this.c().mismatch;
    return '';
  }

  protected invalid(field: 'password' | 'confirm'): boolean {
    return field === 'password' ? this.passwordError() !== '' : this.confirmError() !== '';
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.form.get('password')?.value !== this.form.get('confirm')?.value) {
      this.form.markAllAsTouched();
      return;
    }
    this.failed.set(null);
    this.submitting.set(true);
    this.submitted.emit(this.form.get('password')?.value ?? '');
  }
}

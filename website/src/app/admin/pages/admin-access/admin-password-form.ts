import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Password-set form for invite acceptance and recovery completion.
// Same TailAdmin field styling as the sign-in form.
@Component({
  selector: 'app-admin-password-form',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-password-form.html',
  host: { class: 'contents' },
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class AdminPasswordForm {
  @Input() submitLabel = 'Save password';
  @Output() submitted = new EventEmitter<string>();

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
    if (control.errors['required']) return 'Password is required.';
    if (control.errors['minlength']) return 'Use at least 8 characters.';
    return '';
  }

  protected confirmError(): string {
    const control = this.form.get('confirm');
    if (!control || !(control.dirty || control.touched)) return '';
    if (control.errors?.['required']) return 'Confirm your password.';
    if (this.form.get('password')?.value !== control.value) return 'Passwords do not match.';
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

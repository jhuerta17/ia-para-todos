import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface AdminCredentials {
  email: string;
  password: string;
}

// Sign-in form styled after TailAdmin's sign-in fields (see
// THIRD_PARTY_NOTICES.md), Spanish copy, no demo submit: the parent
// performs the real Identity login and feeds back errors.
@Component({
  selector: 'app-admin-access-form',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-access-form.html',
  host: { class: 'contents' },
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class AdminAccessForm {
  @Output() submitted = new EventEmitter<AdminCredentials>();

  protected showPassword = false;
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
      if (control.errors['required']) return 'Email is required.';
      if (control.errors['email']) return 'Enter a valid email.';
    }
    if (field === 'password' && control.errors['required']) return 'Password is required.';
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

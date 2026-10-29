import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Icon, IconName } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';

@Component({selector: 'app-participation-section', imports: [ReactiveFormsModule, Icon, RevealOnEnter], templateUrl: './participation-section.html', styleUrls: ['./participation-section.css', '../form-controls.css'], changeDetection: ChangeDetectionStrategy.OnPush})
export class ParticipationSection {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly complete = signal(false);
  protected readonly steps: { title: string; text: string; icon: IconName }[] = [
    { title: 'Elige tu interés', text: 'Explora los cuatro temas y elige lo que te gustaría practicar.', icon: 'book' },
    { title: 'Usa datos de prueba', text: 'Completa esta práctica con información inventada, nunca real.', icon: 'pencil' },
    { title: 'Revisa la demostración', text: 'Nada se envía, se guarda ni te registra en un taller.', icon: 'shield-check' },
  ];
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true }),
    workshop: new FormControl('', { nonNullable: true, validators: Validators.required }),
    message: new FormControl('', { nonNullable: true }),
    consent: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  protected invalid(name: 'name' | 'email' | 'workshop' | 'consent'): boolean { const field = this.form.controls[name]; return field.touched && field.invalid; }
  protected submit(): void {
    this.complete.set(false);
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.element.nativeElement.querySelector<HTMLElement>('.ng-invalid:not(form)')?.focus(); return; }
    this.complete.set(true);
    this.form.reset();
  }
}

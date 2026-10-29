import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Icon, IconName } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';

@Component({selector: 'app-participation-section', imports: [ReactiveFormsModule, Icon, RevealOnEnter], templateUrl: './participation-section.html', styleUrls: ['./participation-section.css', '../form-controls.css'], host: { '[class.page]': 'page()' }, changeDetection: ChangeDetectionStrategy.OnPush})
export class ParticipationSection {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly complete = signal(false);
  readonly page = input(false);
  readonly context = input<'workshops' | 'community'>('workshops');
  protected readonly choices = computed(() => this.context() === 'community' ? ['Facilitar talleres', 'Acompañar prácticas', 'Traducir contenidos', 'Compartir la iniciativa'] : ['Introducción a la IA', 'Vida diaria', 'Trabajo y negocios', 'Padres y familias']);
  protected readonly steps = computed<{ title: string; text: string; icon: IconName }[]>(() => this.context() === 'community' ? [
    { title: 'Imagina cómo ayudar', text: 'Facilitación, acompañamiento, traducción o difusión: roles aún por definir.', icon: 'users' },
    { title: 'Prueba el formulario', text: 'Usa solo datos inventados; no es una solicitud de voluntariado real.', icon: 'pencil' },
    { title: 'Revisa el aviso', text: 'Nada se envía ni se guarda, y no te registra como colaborador.', icon: 'shield-check' },
  ] : [
    { title: 'Elige tu interés', text: 'Explora los cuatro temas y elige lo que te gustaría practicar.', icon: 'book' },
    { title: 'Usa datos de prueba', text: 'Completa esta práctica con información inventada, nunca real.', icon: 'pencil' },
    { title: 'Revisa la demostración', text: 'Nada se envía, se guarda ni te registra en un taller.', icon: 'shield-check' },
  ]);
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

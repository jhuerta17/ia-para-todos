import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Icon, IconName } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy = {
  es: { heading: 'Aprendamos paso a paso', lead: 'Cuéntanos tu interés en participar. Esta es una práctica local: nada se envía, se guarda, te suscribe ni te registra.', hiddenHeading: 'Formulario de práctica y pasos', collaborate: 'Colaboración', participate: 'Participa', note: 'Usa datos inventados. Los campos con * son obligatorios.', name: 'Nombre de prueba *', namePh: 'Persona de ejemplo', nameError: 'Este campo es obligatorio.', email: 'Correo de prueba *', emailPh: 'nombre@ejemplo.com', emailError: 'Escribe un correo válido, por ejemplo nombre@ejemplo.com.', phone: 'Teléfono de prueba (opcional)', interest: 'Taller de interés', collaborateWay: 'Forma de colaborar', choose: 'Selecciona una opción', interestError: 'Elige una opción de interés.', message: 'Mensaje de prueba (opcional)', consent: 'Entiendo que esto es una demostración y que mis datos de prueba no se envían ni se guardan. *', consentError: 'Confirma que entiendes la demostración.', submit: 'Enviar demostración', result: 'Demostración: no se enviaron datos. Los campos de prueba se han vaciado.' },
  en: { heading: 'Let’s learn step by step', lead: 'Tell us about your interest in participating. This is a local practice: nothing is sent, saved, subscribed, or registered.', hiddenHeading: 'Practice form and steps', collaborate: 'Collaborate', participate: 'Participate', note: 'Use made-up data. Fields with * are required.', name: 'Test name *', namePh: 'Sample person', nameError: 'This field is required.', email: 'Test email *', emailPh: 'name@example.com', emailError: 'Write a valid email, for example name@example.com.', phone: 'Test phone (optional)', interest: 'Workshop of interest', collaborateWay: 'Way to collaborate', choose: 'Choose an option', interestError: 'Choose an option of interest.', message: 'Test message (optional)', consent: 'I understand this is a demonstration and that my test data is not sent or saved. *', consentError: 'Confirm that you understand the demonstration.', submit: 'Send demonstration', result: 'Demonstration: no data was sent. The test fields were cleared.' },
};

const steps: Record<Lang, Record<'workshops' | 'community', { title: string; text: string; icon: IconName }[]>> = {
  es: {
    workshops: [
      { title: 'Elige tu interés', text: 'Explora los cuatro temas y elige lo que te gustaría practicar.', icon: 'book' },
      { title: 'Usa datos de prueba', text: 'Completa esta práctica con información inventada, nunca real.', icon: 'pencil' },
      { title: 'Revisa el aviso', text: 'Nada se envía, se guarda ni te registra en un taller.', icon: 'shield-check' },
    ],
    community: [
      { title: 'Imagina cómo ayudar', text: 'Facilitación, acompañamiento, traducción o difusión: elige el tuyo en el formulario.', icon: 'users' },
      { title: 'Prueba el formulario', text: 'Usa solo datos inventados; no es una solicitud de voluntariado real.', icon: 'pencil' },
      { title: 'Revisa el aviso', text: 'Nada se envía ni se guarda, y no te registra como colaborador.', icon: 'shield-check' },
    ],
  },
  en: {
    workshops: [
      { title: 'Choose your interest', text: 'Explore the four topics and choose what you would like to practice.', icon: 'book' },
      { title: 'Use test data', text: 'Complete this practice with made-up information, never real.', icon: 'pencil' },
      { title: 'Read the notice', text: 'Nothing is sent, saved, or registered for a workshop.', icon: 'shield-check' },
    ],
    community: [
      { title: 'Imagine how to help', text: 'Facilitation, guidance, translation, or outreach: choose yours in the form.', icon: 'users' },
      { title: 'Try the form', text: 'Use only made-up data; it is not a real volunteer application.', icon: 'pencil' },
      { title: 'Read the notice', text: 'Nothing is sent or saved, and it does not register you as a collaborator.', icon: 'shield-check' },
    ],
  },
};

const choices: Record<Lang, Record<'workshops' | 'community', string[]>> = {
  es: {
    workshops: ['Introducción a la IA', 'Vida diaria', 'Trabajo y negocios', 'Padres y familias'],
    community: ['Facilitar talleres', 'Acompañar prácticas', 'Traducir contenidos', 'Compartir la iniciativa'],
  },
  en: {
    workshops: ['Intro to AI', 'Everyday life', 'Work and business', 'Parents and families'],
    community: ['Facilitate workshops', 'Guide practice', 'Translate content', 'Share the initiative'],
  },
};

@Component({selector: 'app-participation-section', imports: [ReactiveFormsModule, Icon, RevealOnEnter], templateUrl: './participation-section.html', styleUrls: ['./participation-section.css', '../form-controls.css'], host: { '[class.page]': 'page()' }, changeDetection: ChangeDetectionStrategy.OnPush})
export class ParticipationSection {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly language = inject(Language);
  protected readonly complete = signal(false);
  readonly page = input(false);
  readonly context = input<'workshops' | 'community'>('workshops');
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly choices = computed(() => choices[this.language.lang()][this.context()]);
  protected readonly steps = computed(() => steps[this.language.lang()][this.context()]);
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

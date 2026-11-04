import { RouterLink } from '@angular/router';
import { ActionButton } from '../action-button';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Icon, IconName } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy = {
  es: { details: 'Tus datos de contacto', messageGroup: 'Tu mensaje', privacy: 'Cómo cuidamos tus datos', heading: 'Aprendamos paso a paso', lead: 'Cuéntanos tu interés. Usamos tus datos solo para contactarte sobre talleres y actividades.', hiddenHeading: 'Formulario de contacto y pasos', collaborate: 'Colaboración', participate: 'Participa', donate: 'Donar', contact: 'Contacto', note: 'Los campos con * son obligatorios.', name: 'Nombre *', namePh: 'Tu nombre', nameError: 'Este campo es obligatorio.', email: 'Correo electrónico *', emailPh: 'nombre@ejemplo.com', emailError: 'Escribe un correo válido, por ejemplo nombre@ejemplo.com.', phone: 'Teléfono (opcional)', phonePh: '(555) 000-0000', interest: 'Taller de interés', collaborateWay: 'Forma de colaborar', supportWay: 'Forma de apoyo', topic: 'Tema', choose: 'Selecciona una opción', interestError: 'Elige una opción de interés.', message: 'Mensaje (opcional)', messagePh: '¿Qué te gustaría practicar?', consent: 'Acepto que usen mis datos para contactarme sobre talleres y actividades. *', consentError: 'Debes aceptar para enviar el formulario.', submit: 'Enviar', sending: 'Enviando…', result: '¡Gracias! Hemos recibido tu mensaje y te contactaremos pronto.', failed: 'No pudimos enviar el formulario. Inténtalo de nuevo.', honeypot: 'No completar este campo' },
  en: { details: 'Your contact details', messageGroup: 'Your message', privacy: 'How we handle your data', heading: 'Let’s learn step by step', lead: 'Tell us about your interest. We use your data only to contact you about workshops and activities.', hiddenHeading: 'Contact form and steps', collaborate: 'Collaborate', participate: 'Participate', donate: 'Donate', contact: 'Contact', note: 'Fields with * are required.', name: 'Name *', namePh: 'Your name', nameError: 'This field is required.', email: 'Email *', emailPh: 'name@example.com', emailError: 'Write a valid email, for example name@example.com.', phone: 'Phone (optional)', phonePh: '(555) 000-0000', interest: 'Workshop of interest', collaborateWay: 'Way to collaborate', supportWay: 'Way to support', topic: 'Topic', choose: 'Choose an option', interestError: 'Choose an option of interest.', message: 'Message (optional)', messagePh: 'What would you like to practice?', consent: 'I agree that my data will be used to contact me about workshops and activities. *', consentError: 'You must accept to send the form.', submit: 'Send', sending: 'Sending…', result: 'Thanks! We received your message and will contact you soon.', failed: 'We could not send the form. Please try again.', honeypot: 'Do not fill in this field' },
};

/** Copy overrides applied on top of the base copy for the donate context. */
const donateCopy = {
  es: { heading: 'Apoya la causa', lead: 'Cuéntanos cómo te gustaría apoyar. Usamos tus datos solo para coordinar tu donación.', hiddenHeading: 'Formulario de donaciones y pasos', messagePh: '¿Cómo te gustaría apoyar?', consent: 'Acepto que usen mis datos para contactarme sobre mi donación. *', result: '¡Gracias! Hemos recibido tu mensaje y te contactaremos pronto para coordinar tu apoyo.' },
  en: { heading: 'Support the cause', lead: 'Tell us how you would like to support. We use your data only to coordinate your donation.', hiddenHeading: 'Donations form and steps', messagePh: 'How would you like to support?', consent: 'I agree that my data will be used to contact me about my donation. *', result: 'Thanks! We received your message and will contact you soon to coordinate your support.' },
};

/** Copy overrides applied on top of the base copy for the contact context. */
const contactCopy = {
  es: { heading: 'Escríbenos', lead: 'Cuéntanos tu pregunta o idea. Usamos tus datos solo para responder a tu mensaje.', hiddenHeading: 'Formulario de contacto y pasos', messagePh: '¿En qué te podemos ayudar?', consent: 'Acepto que usen mis datos para responder a mi mensaje. *', result: '¡Gracias! Hemos recibido tu mensaje y te responderemos pronto.' },
  en: { heading: 'Write to us', lead: 'Tell us your question or idea. We use your data only to answer your message.', hiddenHeading: 'Contact form and steps', messagePh: 'How can we help?', consent: 'I agree that my data will be used to answer my message. *', result: 'Thanks! We received your message and will answer soon.' },
};

export type ParticipationContext = 'workshops' | 'community' | 'donate' | 'contact';

const steps: Record<Lang, Record<ParticipationContext, { title: string; text: string; icon: IconName }[]>> = {
  es: {
    workshops: [
      { title: 'Elige tu interés', text: 'Explora los cuatro temas y elige lo que te gustaría practicar.', icon: 'book' },
      { title: 'Completa el formulario', text: 'Déjanos tus datos de contacto y tu mensaje.', icon: 'pencil' },
      { title: 'Te contactamos', text: 'Revisamos cada mensaje y te escribimos pronto.', icon: 'shield-check' },
    ],
    community: [
      { title: 'Imagina cómo ayudar', text: 'Facilitación, acompañamiento, traducción o difusión: elige el tuyo en el formulario.', icon: 'users' },
      { title: 'Completa el formulario', text: 'Cuéntanos cómo te gustaría colaborar.', icon: 'pencil' },
      { title: 'Te contactamos', text: 'Revisamos cada mensaje y te escribimos pronto.', icon: 'shield-check' },
    ],
    donate: [
      { title: 'Elige cómo apoyar', text: 'Donación individual, patrocinio empresarial o apoyo en especie.', icon: 'users' },
      { title: 'Completa el formulario', text: 'Déjanos tus datos y te contactamos para coordinar.', icon: 'pencil' },
      { title: 'Te contactamos', text: 'Revisamos cada mensaje y te escribimos pronto.', icon: 'shield-check' },
    ],
    contact: [
      { title: 'Elige el tema', text: 'Preguntas, talleres, colaboración o donaciones: elige el tuyo en el formulario.', icon: 'mail' },
      { title: 'Completa el formulario', text: 'Déjanos tus datos de contacto y tu mensaje.', icon: 'pencil' },
      { title: 'Te respondemos', text: 'Revisamos cada mensaje y te escribimos pronto.', icon: 'shield-check' },
    ],
  },
  en: {
    workshops: [
      { title: 'Choose your interest', text: 'Explore the four topics and choose what you would like to practice.', icon: 'book' },
      { title: 'Complete the form', text: 'Leave your contact details and your message.', icon: 'pencil' },
      { title: 'We contact you', text: 'We review every message and write back soon.', icon: 'shield-check' },
    ],
    community: [
      { title: 'Imagine how to help', text: 'Facilitation, guidance, translation, or outreach: choose yours in the form.', icon: 'users' },
      { title: 'Complete the form', text: 'Tell us how you would like to collaborate.', icon: 'pencil' },
      { title: 'We contact you', text: 'We review every message and write back soon.', icon: 'shield-check' },
    ],
    donate: [
      { title: 'Choose how to support', text: 'Individual donation, company sponsorship, or in-kind support.', icon: 'users' },
      { title: 'Complete the form', text: 'Leave your details and we will contact you to coordinate.', icon: 'pencil' },
      { title: 'We contact you', text: 'We review every message and write back soon.', icon: 'shield-check' },
    ],
    contact: [
      { title: 'Choose the topic', text: 'Questions, workshops, collaboration, or donations: choose yours in the form.', icon: 'mail' },
      { title: 'Complete the form', text: 'Leave your contact details and your message.', icon: 'pencil' },
      { title: 'We answer you', text: 'We review every message and write back soon.', icon: 'shield-check' },
    ],
  },
};

const choices: Record<Lang, Record<ParticipationContext, string[]>> = {
  es: {
    workshops: ['Introducción a la IA', 'Vida diaria', 'Trabajo y negocios', 'Padres y familias'],
    community: ['Facilitar talleres', 'Acompañar prácticas', 'Traducir contenidos', 'Compartir la misión'],
    donate: ['Donación individual', 'Patrocinio empresarial', 'Apoyo en especie', 'Otra forma de apoyo'],
    contact: ['Pregunta general', 'Talleres y cursos', 'Colaborar', 'Donaciones', 'Prensa y alianzas'],
  },
  en: {
    workshops: ['Intro to AI', 'Everyday life', 'Work and business', 'Parents and families'],
    community: ['Facilitate workshops', 'Guide practice', 'Translate content', 'Share the mission'],
    donate: ['Individual donation', 'Company sponsorship', 'In-kind support', 'Another way to support'],
    contact: ['General question', 'Workshops and courses', 'Collaborate', 'Donations', 'Press and partnerships'],
  },
};

@Component({selector: 'app-participation-section', imports: [RouterLink, ActionButton, ReactiveFormsModule, Icon, RevealOnEnter], templateUrl: './participation-section.html', styleUrls: ['./participation-section.css', '../form-controls.css'], host: { '[class.page]': 'page()' }, changeDetection: ChangeDetectionStrategy.OnPush})
export class ParticipationSection {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly language = inject(Language);
  protected readonly complete = signal(false);
  protected readonly failed = signal(false);
  protected readonly sending = signal(false);
  readonly page = input(false);
  readonly context = input<ParticipationContext>('workshops');
  protected readonly c = computed(() => {
    const lang = this.language.lang();
    const context = this.context();
    const overrides = context === 'donate' ? donateCopy[lang] : context === 'contact' ? contactCopy[lang] : null;
    return overrides ? { ...copy[lang], ...overrides } : copy[lang];
  });
  protected readonly choices = computed(() => choices[this.language.lang()][this.context()]);
  protected readonly steps = computed(() => steps[this.language.lang()][this.context()]);
  protected readonly formTitle = computed(() => {
    const context = this.context();
    return context === 'community' ? this.c().collaborate : context === 'donate' ? this.c().donate : context === 'contact' ? this.c().contact : this.c().participate;
  });
  protected readonly interestLabel = computed(() => {
    const context = this.context();
    return context === 'community' ? this.c().collaborateWay : context === 'donate' ? this.c().supportWay : context === 'contact' ? this.c().topic : this.c().interest;
  });
  /** Netlify Forms name. Rendered into the prerendered HTML for detection. */
  protected readonly formName = computed(() => this.context() === 'donate' ? 'donate' : this.context() === 'community' ? 'collaborate' : this.context() === 'contact' ? 'contact' : 'participate');
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true }),
    workshop: new FormControl('', { nonNullable: true, validators: Validators.required }),
    message: new FormControl('', { nonNullable: true }),
    consent: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  protected invalid(name: 'name' | 'email' | 'workshop' | 'consent'): boolean { const field = this.form.controls[name]; return field.touched && field.invalid; }
  protected async submit(): Promise<void> {
    this.complete.set(false);
    this.failed.set(false);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.sending()) { this.element.nativeElement.querySelector<HTMLElement>('.ng-invalid:not(form)')?.focus(); return; }
    this.sending.set(true);
    try {
      const value = this.form.getRawValue();
      const body = new URLSearchParams({
        'form-name': this.formName(),
        'bot-field': '',
        language: this.language.lang(),
        name: value.name.trim(),
        email: value.email.trim(),
        phone: value.phone.trim(),
        interest: value.workshop,
        message: value.message.trim(),
        consent: 'yes',
      });
      const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      if (!response.ok) throw new Error(`Netlify Forms responded ${response.status}`);
      this.complete.set(true);
      this.form.reset();
    } catch {
      this.failed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}

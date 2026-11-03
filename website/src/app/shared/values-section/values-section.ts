import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icon, IconName } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

const copy = {
  es: { heading: 'Lo que nos guía', lead: 'Seis valores que se notan en cada taller, del primer saludo a la última pregunta.' },
  en: { heading: 'What guides us', lead: 'Six values you will notice in every workshop, from the first greeting to the last question.' },
};

const values: Record<Lang, { title: string; body: string; icon: IconName }[]> = {
  es: [
    { title: 'Accesibilidad', body: 'Aprende con tu teléfono, en español y cerca de ti. Quitamos cada barrera que podamos para que venir y aprender sea fácil.', icon: 'device-mobile' },
    { title: 'Inclusión', body: 'Todas las personas son bienvenidas, sin importar edad, estudios o creencias. Nuestros talleres no tienen contenido religioso.', icon: 'users' },
    { title: 'Empoderamiento comunitario', body: 'Enseñamos a aprender, verificar y seguir adelante. La meta es que no nos necesites después del taller.', icon: 'bulb' },
    { title: 'IA responsable', body: 'Explicamos lo que la IA puede y no puede hacer, sin exageraciones: sus límites, sus errores y sus riesgos.', icon: 'search' },
    { title: 'Privacidad y seguridad', body: 'Practicamos solo con datos inventados y te enseñamos a cuidar tu información y a detectar engaños.', icon: 'shield-check' },
    { title: 'Transparencia', body: 'Trabajamos en abierto: contamos lo que funciona y lo que no, y corregimos el rumbo a la vista de todos.', icon: 'clipboard-check' },
  ],
  en: [
    { title: 'Accessibility', body: 'Learn with your phone, in Spanish, and near you. We remove every barrier we can so showing up and learning stays easy.', icon: 'device-mobile' },
    { title: 'Inclusion', body: 'Everyone is welcome, whatever your age, education, or beliefs. Our workshops contain no religious content.', icon: 'users' },
    { title: 'Community empowerment', body: 'We teach you to learn, verify, and keep going. The goal is that you do not need us after the workshop.', icon: 'bulb' },
    { title: 'Responsible AI', body: 'We explain what AI can and cannot do, with no hype: its limits, its mistakes, and its risks.', icon: 'search' },
    { title: 'Privacy and safety', body: 'We practice only with made-up data, and we teach you to protect your information and spot scams.', icon: 'shield-check' },
    { title: 'Transparency', body: 'We work in the open: we share what works and what does not, and we correct course where everyone can see.', icon: 'clipboard-check' },
  ],
};

@Component({selector: 'app-values-section', imports: [Icon, RevealOnEnter], templateUrl: './values-section.html', styleUrl: './values-section.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class ValuesSection {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly values = computed(() => values[this.language.lang()]);
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PageCover } from '../../shared/page-cover/page-cover';
import { AiTutor } from '../../shared/ai-tutor/ai-tutor';
import { CourseWaitlist } from '../../shared/course-waitlist/course-waitlist';
import { ActionLink } from '../../shared/action-link';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

interface Tier {
  name: string;
  summary: string;
  status: string;
  available: boolean;
}

const copy: Record<Lang, { coverAlt: string; title: string; lead: string; ladderHeading: string; ladderLead: string; free: string; note: string; donate: string; tiers: Tier[]; explore: string; exploreTo: string; lessonHeading: string; lessonLead: string; steps: string[] }> = {
  es: {
    coverAlt: 'Personas adultas aprendiendo con una computadora.',
    title: 'Cursos en línea',
    lead: 'Lleva los talleres a tu ritmo: lecciones cortas en español, con práctica guiada por IA. Siempre gratis.',
    ladderHeading: 'El camino',
    ladderLead: 'Del primer prompt a facilitar talleres en tu comunidad.',
    free: 'Gratis',
    note: 'Todos los cursos son gratuitos para la comunidad y seguirán siéndolo. Empresas y donaciones hacen esto posible.',
    donate: 'Apoyar con una donación',
    tiers: [
      { name: 'Mini-curso gratuito', summary: 'Tu primer prompt en 5 minutos, con el tutor de práctica.', status: 'Disponible ahora', available: true },
      { name: 'IA para el Trabajo', summary: 'Currículum, mensajes profesionales y entrevistas.', status: 'En preparación', available: false },
      { name: 'IA para tu Negocio', summary: 'Anuncios, clientes y organización, con sesiones en vivo.', status: 'En preparación', available: false },
      { name: 'Facilitador Certificado', summary: 'Enseña los talleres en tu comunidad.', status: 'En preparación', available: false },
    ],
    explore: 'Probar el mini-curso',
    exploreTo: '/actividades/primer-prompt',
    lessonHeading: 'Lección 0: tu primer prompt en 5 minutos',
    lessonLead: 'Así se siente un curso aquí: una idea, un ejemplo inventado y práctica inmediata con el tutor.',
    steps: [
      'Lee la fórmula: tarea + tema + formato.',
      'Escríbele al tutor y pide tu primera lista.',
      'Pide un cambio y observa qué pasa con la respuesta.',
    ],
  },
  en: {
    coverAlt: 'Adults learning with a computer.',
    title: 'Online courses',
    lead: 'Take the workshops at your pace: short lessons in Spanish, with AI-guided practice. Always free.',
    ladderHeading: 'The path',
    ladderLead: 'From your first prompt to facilitating workshops in your community.',
    free: 'Free',
    note: 'Every course is free for the community and will stay that way. Companies and donations make this possible.',
    donate: 'Support with a donation',
    tiers: [
      { name: 'Free mini-course', summary: 'Your first prompt in 5 minutes, with the practice tutor.', status: 'Available now', available: true },
      { name: 'AI for Work', summary: 'Résumés, professional messages, and interviews.', status: 'In preparation', available: false },
      { name: 'AI for your Business', summary: 'Ads, customers, and organization, with live sessions.', status: 'In preparation', available: false },
      { name: 'Certified Facilitator', summary: 'Teach the workshops in your community.', status: 'In preparation', available: false },
    ],
    explore: 'Try the mini-course',
    exploreTo: '/actividades/first-prompt',
    lessonHeading: 'Lesson 0: your first prompt in 5 minutes',
    lessonLead: 'This is what a course feels like here: one idea, one made-up example, and instant practice with the tutor.',
    steps: [
      'Read the formula: task + topic + format.',
      'Write to the tutor and ask for your first list.',
      'Ask for a change and watch what happens to the answer.',
    ],
  },
};

@Component({selector: 'app-courses', imports: [PageCover, AiTutor, CourseWaitlist, ActionLink, RevealOnEnter], templateUrl: './courses.html', styleUrl: './courses.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class Courses {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}

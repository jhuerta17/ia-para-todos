import type { Lang } from '../i18n/lang';

export interface Workshop {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  summary: string;
  image: string;
  alt: string;
}

/** Workshop catalog per language. Both arrays share index pairing for hreflang. */
export const workshops: Record<Lang, Workshop[]> = {
  es: [
    {
      "slug": "introduccion-ia",
      "title": "Introducción a la inteligencia artificial",
      "shortTitle": "Introducción a la IA",
      "category": "Primeros pasos",
      "summary": "Tu primera instrucción a la IA, con privacidad y verificación.",
      "image": "community-learning",
      "alt": "Personas adultas aprendiendo con computadoras en un aula."
    },
    {
      "slug": "vida-diaria",
      "title": "IA para la vida diaria",
      "shortTitle": "IA para la vida diaria",
      "category": "Vida diaria",
      "summary": "Mensajes, horarios y traducciones para tu día a día.",
      "image": "everyday-phone",
      "alt": "Tres mujeres mirando juntas la pantalla de un teléfono."
    },
    {
      "slug": "trabajo-negocios",
      "title": "IA para el trabajo y los negocios",
      "shortTitle": "IA para trabajo y negocios",
      "category": "Trabajo y negocios",
      "summary": "Currículum y comunicación profesional con datos ficticios.",
      "image": "work-business",
      "alt": "Personas preparando pedidos junto a una computadora."
    },
    {
      "slug": "padres-familias",
      "title": "IA para padres y familias",
      "shortTitle": "IA para padres y familias",
      "category": "Padres y familias",
      "summary": "IA en casa: acompañamiento, seguridad y pensamiento crítico.",
      "image": "family-learning",
      "alt": "Una madre y su hija usando una computadora en casa."
    }
  ],
  en: [
    {
      "slug": "introduction-to-ai",
      "title": "Introduction to artificial intelligence",
      "shortTitle": "Intro to AI",
      "category": "First steps",
      "summary": "Your first instruction to AI, with privacy and verification.",
      "image": "community-learning",
      "alt": "Adults learning with computers in a classroom."
    },
    {
      "slug": "everyday-life",
      "title": "AI for everyday life",
      "shortTitle": "AI for everyday life",
      "category": "Everyday life",
      "summary": "Messages, schedules, and translations for your day to day.",
      "image": "everyday-phone",
      "alt": "Three women looking together at a phone screen."
    },
    {
      "slug": "work-and-business",
      "title": "AI for work and business",
      "shortTitle": "AI for work and business",
      "category": "Work and business",
      "summary": "Résumés and professional communication with fictional data.",
      "image": "work-business",
      "alt": "People preparing orders next to a computer."
    },
    {
      "slug": "parents-and-families",
      "title": "AI for parents and families",
      "shortTitle": "AI for parents and families",
      "category": "Parents and families",
      "summary": "AI at home: guidance, safety, and critical thinking.",
      "image": "family-learning",
      "alt": "A mother and daughter using a computer at home."
    }
  ],
};

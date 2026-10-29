import type { Lang } from '../i18n/lang';

export interface PlannedActivity {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  summary: string;
  focus: string;
  image: string;
  alt: string;
}

/** Activity catalog per language. Both arrays share index pairing for hreflang. */
export const activities: Record<Lang, PlannedActivity[]> = {
  es: [
    {
      "slug": "primer-prompt",
      "title": "Tu primer prompt, paso a paso",
      "shortTitle": "Tu primer prompt",
      "category": "Primeros pasos",
      "summary": "Escribe una instrucción clara y aprende a revisar la respuesta con práctica guiada.",
      "focus": "Preguntar",
      "image": "peer-support",
      "alt": "Dos personas revisando apuntes y una computadora."
    },
    {
      "slug": "mensajes-planes",
      "title": "Mensajes y planes para tu semana",
      "shortTitle": "Mensajes y planes",
      "category": "Vida diaria",
      "summary": "Practica mensajes educados y organiza una semana con ejemplos inventados.",
      "focus": "Organizar",
      "image": "accessible-technology",
      "alt": "Dos personas compartiendo información en un teléfono."
    },
    {
      "slug": "practica-entrevista",
      "title": "Currículum y práctica de entrevista",
      "shortTitle": "Practica tu entrevista",
      "category": "Trabajo",
      "summary": "Ordena una experiencia ficticia y ensaya preguntas. Sin promesas de empleo ni certificación.",
      "focus": "Expresarte",
      "image": "collaboration",
      "alt": "Dos personas conversando con un teléfono y una computadora."
    },
    {
      "slug": "verificar-en-familia",
      "title": "Detecta lo sospechoso en familia",
      "shortTitle": "Verifica en familia",
      "category": "Familias",
      "summary": "Aprende a dudar de mensajes e imágenes sospechosas antes de compartirlos.",
      "focus": "Verificar",
      "image": "family-phone",
      "alt": "Una madre y su hijo mirando un teléfono en casa."
    }
  ],
  en: [
    {
      "slug": "first-prompt",
      "title": "Your first prompt, step by step",
      "shortTitle": "Your first prompt",
      "category": "First steps",
      "summary": "Write a clear instruction and learn to review the answer with guided practice.",
      "focus": "Asking",
      "image": "peer-support",
      "alt": "Two people reviewing notes and a computer."
    },
    {
      "slug": "messages-and-plans",
      "title": "Messages and plans for your week",
      "shortTitle": "Messages and plans",
      "category": "Everyday life",
      "summary": "Practice polite messages and organize a week with made-up examples.",
      "focus": "Organizing",
      "image": "accessible-technology",
      "alt": "Two people sharing information on a phone."
    },
    {
      "slug": "interview-practice",
      "title": "Résumé and interview practice",
      "shortTitle": "Practice your interview",
      "category": "Work",
      "summary": "Organize fictional experience and rehearse questions. No job or certification promises.",
      "focus": "Expressing yourself",
      "image": "collaboration",
      "alt": "Two people talking with a phone and a computer."
    },
    {
      "slug": "verify-with-family",
      "title": "Spot the suspicious, as a family",
      "shortTitle": "Verify as a family",
      "category": "Families",
      "summary": "Learn to question suspicious messages and images before sharing them.",
      "focus": "Verifying",
      "image": "family-phone",
      "alt": "A mother and child looking at a phone at home."
    }
  ],
};

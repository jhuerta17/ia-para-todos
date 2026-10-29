import type { Lang } from '../i18n/lang';

export interface Resource {
  slug: string;
  title: string;
  category: string;
  summary: string;
  image: string;
}

/** Resource catalog per language. Both arrays share index pairing for hreflang. */
export const resources: Record<Lang, Resource[]> = {
  es: [
    { slug: 'que-es-ia', title: 'Qué es la IA (y qué no es)', category: 'Primeros pasos', summary: 'Una explicación sencilla de la inteligencia artificial, la IA generativa y sus límites, con ejemplos cotidianos.', image: 'guided-practice' },
    { slug: 'ia-vida-diaria', title: 'La IA en tu día a día', category: 'Vida diaria', summary: 'Ideas para mensajes, avisos, horarios y traducciones, cuidando tu privacidad.', image: 'everyday-phone' },
    { slug: 'ia-trabajo', title: 'La IA en el trabajo', category: 'Trabajo', summary: 'Currículum, mensajes profesionales y organización de tareas sin compartir datos sensibles.', image: 'work-business' },
    { slug: 'seguridad-familia', title: 'Seguridad digital en familia', category: 'Familias', summary: 'Verifica antes de compartir, cuida tus fotos y conversa en casa sobre tecnología.', image: 'family-phone' },
  ],
  en: [
    { slug: 'what-is-ai', title: 'What AI is (and isn’t)', category: 'First steps', summary: 'A simple explanation of artificial intelligence, generative AI, and its limits, with everyday examples.', image: 'guided-practice' },
    { slug: 'everyday-ai', title: 'AI in your day to day', category: 'Everyday life', summary: 'Ideas for messages, notices, schedules, and translations, while protecting your privacy.', image: 'everyday-phone' },
    { slug: 'ai-at-work', title: 'AI at work', category: 'Work', summary: 'Résumés, professional messages, and task organization without sharing sensitive data.', image: 'work-business' },
    { slug: 'family-safety', title: 'Digital safety for families', category: 'Families', summary: 'Verify before sharing, protect your photos, and talk about technology at home.', image: 'family-phone' },
  ],
};

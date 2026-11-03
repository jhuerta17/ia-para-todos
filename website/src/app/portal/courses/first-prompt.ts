import type { ContentDetail } from '../../data/content-detail';
import { resourceDetails } from '../../data/resource-details';
import type { Lang } from '../../i18n/lang';
import { LESSON_IDS, type LessonId } from './course-paths';

interface Lesson {
  id: LessonId;
  title: string;
  summary: string;
  sections: ContentDetail['sections'];
  practice: string;
  reflection: string;
}
interface Course {
  title: string;
  summary: string;
  lessons: Lesson[];
}

export function firstPrompt(lang: Lang): Course {
  const guide = resourceDetails[lang][0]!;
  const everyday = resourceDetails[lang][1]!;
  return lang === 'es' ? {
    title: 'Tu primer prompt',
    summary: 'Aprende a pedir algo con claridad, mejorar la respuesta y comprobarla. Tres lecciones cortas, a tu ritmo y con ejemplos inventados.',
    lessons: [
      { id: LESSON_IDS[0], title: 'Escribe una instrucción clara', summary: 'Una tarea, un contexto y un formato.',
        sections: [guide.sections[0]!, guide.sections[2]!, { heading: 'Prueba una fórmula sencilla', paragraphs: ['Tarea + contexto + formato. Por ejemplo: “Propón tres cenas con arroz y verduras para una familia ficticia de tres personas. Responde con una lista breve”. No necesitas compartir nombres ni datos reales.'] }],
        practice: guide.practice!, reflection: '¿Tu instrucción dice qué necesitas y cómo quieres recibirlo?' },
      { id: LESSON_IDS[1], title: 'Mejora la respuesta', summary: 'Una conversación te permite ajustar el resultado.',
        sections: [everyday.sections[0]!, { heading: 'Pide un cambio concreto', paragraphs: ['Lee el primer borrador. Si es largo, pide una versión más corta. Si no es claro, pide palabras sencillas. Puedes cambiar el tono, el formato o una condición sin empezar desde cero.'], bullets: ['Compara la primera versión con la segunda.', 'Elige qué conservar y qué cambiar.', 'No aceptes compromisos ni detalles que no pediste.'] }],
        practice: 'Con el ejemplo de la cena, pide: “Convierte la primera idea en una lista de compras corta”. Luego pide: “Agrupa los ingredientes por categoría”. Compara las versiones. Puedes escribir estas instrucciones en tus apuntes; no necesitas un servicio de IA para completar la lección.',
        reflection: '¿Qué cambio mejoró la respuesta? ¿Qué corregirías tú?' },
      { id: LESSON_IDS[2], title: 'Verifica y protege tus datos', summary: 'Tu criterio y tu privacidad van primero.',
        sections: [guide.sections[1]!, everyday.sections[2]!, { heading: 'Haz una pausa antes de usarla', bullets: ['Comprueba nombres, cantidades y fechas con otra fuente.', 'Usa datos inventados y elimina detalles que identifiquen a alguien.', 'Para decisiones importantes, busca una fuente adecuada o una persona de confianza.'] }],
        practice: 'Revisa tu lista de compras inventada. Señala una cantidad que debas comprobar y explica cómo lo harías. Después identifica qué datos personales no hacen falta para este ejercicio.',
        reflection: '¿Qué verificaste y qué información decidiste no compartir?' },
    ],
  } : {
    title: 'Your first prompt',
    summary: 'Learn to ask clearly, improve the response, and check it. Three short lessons, at your pace, using made-up examples.',
    lessons: [
      { id: LESSON_IDS[0], title: 'Write a clear request', summary: 'A task, some context, and a format.',
        sections: [guide.sections[0]!, guide.sections[2]!, { heading: 'Try a simple formula', paragraphs: ['Task + context + format. For example: “Suggest three dinners with rice and vegetables for a fictional family of three. Answer with a short list.” You do not need to share real names or personal details.'] }],
        practice: guide.practice!, reflection: 'Does your instruction say what you need and how you want to receive it?' },
      { id: LESSON_IDS[1], title: 'Improve the response', summary: 'A conversation lets you adjust the result.',
        sections: [everyday.sections[0]!, { heading: 'Ask for a specific change', paragraphs: ['Read the first draft. If it is long, ask for a shorter version. If it is unclear, ask for simpler words. Change the tone, format, or one condition without starting over.'], bullets: ['Compare the first and second versions.', 'Choose what to keep and what to change.', 'Do not accept commitments or details you did not request.'] }],
        practice: 'Using the dinner example, ask: “Turn the first idea into a short shopping list.” Then ask: “Group the ingredients by category.” Compare the versions. You can write these instructions in your notes; you do not need an AI service to complete the lesson.',
        reflection: 'Which change improved the response? What would you correct yourself?' },
      { id: LESSON_IDS[2], title: 'Verify and protect your data', summary: 'Your judgment and privacy come first.',
        sections: [guide.sections[1]!, everyday.sections[2]!, { heading: 'Pause before using it', bullets: ['Check names, quantities, and dates with another source.', 'Use made-up data and remove details that identify anyone.', 'For important decisions, consult an appropriate source or trusted person.'] }],
        practice: 'Review your fictional shopping list. Identify a quantity you need to check and explain how you would check it. Then identify personal information that is unnecessary for this exercise.',
        reflection: 'What did you verify, and what information did you choose not to share?' },
    ],
  };
}

import { activities } from './activities';
import { ContentDetail } from './content-detail';
import type { Lang } from '../i18n/lang';

const practices: Record<Lang, string[][]> = {
  es: [
    ['Escribir una instrucción que explique qué necesitas y cómo quieres la respuesta.', 'Comparar una instrucción general con otra que incluya contexto y formato.', 'Detectar algo que debas comprobar antes de usar una respuesta.'],
    ['Preparar un mensaje educado para una situación inventada.', 'Pedir dos versiones y elegir palabras que suenen a tu propia voz.', 'Revisar un plan semanal ficticio y corregir los horarios que no funcionen.'],
    ['Organizar experiencia laboral inventada en un borrador de currículum.', 'Ensayar una pregunta de entrevista y mejorar la claridad de la respuesta.', 'Identificar información del trabajo o de clientes que no debes compartir.'],
    ['Buscar señales de urgencia, promesas exageradas o remitentes desconocidos.', 'Revisar un texto o imagen ficticios sin asumir que son auténticos.', 'Elegir otra fuente o un canal conocido para verificar antes de compartir.'],
  ],
  en: [
    ['Write an instruction that explains what you need and how you want the answer.', 'Compare a general instruction with one that includes context and format.', 'Spot something you should check before using an answer.'],
    ['Prepare a polite message for a made-up situation.', 'Ask for two versions and choose words that sound like your own voice.', 'Review a fictional weekly plan and fix the times that do not work.'],
    ['Organize made-up work experience in a résumé draft.', 'Rehearse an interview question and improve the clarity of the answer.', 'Identify work or customer information you must not share.'],
    ['Look for signs of urgency, exaggerated promises, or unknown senders.', 'Review a fictional text or image without assuming it is genuine.', 'Choose another source or a known channel to verify before sharing.'],
  ],
};

const tryIt: Record<Lang, string[]> = {
  es: [
    'Escribe: “Dame tres ideas sencillas para una cena entre semana. Explícalas con palabras fáciles y en lista numerada”. Luego pide: “Convierte la idea uno en una lista de compras corta”. Compara cómo cambia la respuesta.',
    'Escribe: “Un grupo de madres y padres quiere organizar turnos de transporte escolar ficticios. Propón una tabla sencilla con días y horarios”. Revisa que los horarios tengan sentido y redacta un mensaje breve para proponerlos.',
    'Escribe: “Actúa como entrevistadora para un puesto ficticio de atención al cliente. Hazme una pregunta a la vez y espera mi respuesta”. Responde con experiencia inventada y pide una sugerencia para mejorar.',
    'Escribe: “Inventa un mensaje sospechoso de premio inesperado para practicar”. Sin abrir enlaces ni usar datos reales, anota las señales de alerta y explica en voz alta cómo lo verificarías.',
  ],
  en: [
    'Write: “Give me three simple weeknight dinner ideas. Explain them in easy words as a numbered list.” Then ask: “Turn idea one into a short shopping list.” Compare how the answer changes.',
    'Write: “A group of parents wants to organize fictional school carpool shifts. Suggest a simple table with days and times.” Check that the times make sense and draft a short message to propose them.',
    'Write: “Act as an interviewer for a fictional customer-service job. Ask me one question at a time and wait for my answer.” Answer with made-up experience and ask for one suggestion to improve.',
    'Write: “Invent a suspicious unexpected-prize message for practice.” Without opening links or using real data, note the warning signs and explain out loud how you would verify it.',
  ],
};

const galleries: Record<Lang, { image: string; alt: string }[][]> = {
  es: [
    [{ image: 'peer-support', alt: 'Dos personas revisando apuntes y una computadora.' }, { image: 'guided-practice', alt: 'Aprendizaje acompañado con una computadora.' }],
    [{ image: 'accessible-technology', alt: 'Dos personas compartiendo información en un teléfono.' }, { image: 'everyday-phone', alt: 'Tres mujeres mirando juntas la pantalla de un teléfono.' }],
    [{ image: 'collaboration', alt: 'Dos personas conversando con un teléfono y una computadora.' }, { image: 'work-business', alt: 'Personas preparando pedidos junto a una computadora.' }],
    [{ image: 'family-phone', alt: 'Una madre y su hijo mirando un teléfono en casa.' }, { image: 'family-learning', alt: 'Una madre y su hija usando una computadora en casa.' }],
  ],
  en: [
    [{ image: 'peer-support', alt: 'Two people reviewing notes and a computer.' }, { image: 'guided-practice', alt: 'Guided learning with a computer.' }],
    [{ image: 'accessible-technology', alt: 'Two people sharing information on a phone.' }, { image: 'everyday-phone', alt: 'Three women looking together at a phone screen.' }],
    [{ image: 'collaboration', alt: 'Two people talking with a phone and a computer.' }, { image: 'work-business', alt: 'People preparing orders next to a computer.' }],
    [{ image: 'family-phone', alt: 'A mother and her son looking at a phone at home.' }, { image: 'family-learning', alt: 'A mother and daughter using a computer at home.' }],
  ],
};

const meta: Record<Lang, { status: string; parentLabel: string; focus: string; practice: string; practiceValue: string; device: string; deviceValue: string; intro: string; practiceHeading: string; needsHeading: string; needs: string; dataHeading: string; data: string }> = {
  es: {
    status: 'Actividad guiada', parentLabel: 'Volver a actividades', focus: 'Enfoque', practice: 'Práctica', practiceValue: 'Guiada',
    device: 'Dispositivo', deviceValue: 'Teléfono', intro: 'Una práctica cercana a tu vida', practiceHeading: 'Lo que practicarías',
    needsHeading: 'Qué necesitas', needs: 'Un teléfono inteligente y ganas de preguntar. Hay alternativas impresas, demostraciones guiadas o trabajo en pareja si falta dispositivo, cuenta o conexión.',
    dataHeading: 'Con datos inventados', data: 'Usamos nombres, mensajes y situaciones ficticios. No compartas información personal ni documentos reales en las herramientas. Esta actividad es para personas adultas.',
  },
  en: {
    status: 'Guided activity', parentLabel: 'Back to activities', focus: 'Focus', practice: 'Practice', practiceValue: 'Guided',
    device: 'Device', deviceValue: 'Phone', intro: 'A practice close to your life', practiceHeading: 'What you would practice',
    needsHeading: 'What you need', needs: 'A smartphone and curiosity. There are printed alternatives, guided demonstrations, or pair work if a device, account, or connection is missing.',
    dataHeading: 'With made-up data', data: 'We use fictional names, messages, and situations. Do not share personal information or real documents in the tools. This activity is for adults.',
  },
};

/** Activity details per language. Arrays share index pairing with `activities`. */
function build(lang: Lang): ContentDetail[] {
  return activities[lang].map((activity, index) => ({
    ...activity, status: meta[lang].status, parent: '/actividades', parentLabel: meta[lang].parentLabel,
    facts: [{ value: activity.focus, label: meta[lang].focus }, { value: meta[lang].practiceValue, label: meta[lang].practice }, { value: meta[lang].deviceValue, label: meta[lang].device }],
    sections: [
      { heading: meta[lang].intro, paragraphs: [activity.summary, lang === 'es' ? 'Forma parte de las prácticas guiadas de los talleres.' : 'It is part of the guided workshop practices.'] },
      { heading: meta[lang].practiceHeading, bullets: practices[lang][index], ordered: true },
      { heading: meta[lang].needsHeading, paragraphs: [meta[lang].needs] },
      { heading: meta[lang].dataHeading, paragraphs: [meta[lang].data] },
    ],
    practice: tryIt[lang][index],
    gallery: galleries[lang][index],
    ...(index === 0 ? { tutor: true } : {}),
  }));
}
export const activityDetails: Record<Lang, ContentDetail[]> = { es: build('es'), en: build('en') };

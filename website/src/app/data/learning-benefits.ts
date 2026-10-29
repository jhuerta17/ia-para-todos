import type { IconName } from '../shared/icon';
import type { Lang } from '../i18n/lang';

export interface LearningBenefit {
  title: string;
  body: string;
  icon: IconName;
  image: string;
  alt: string;
}

/** Learning benefits per language. Arrays share index pairing. */
export const learningBenefits: Record<Lang, LearningBenefit[]> = {
  es: [
    {
      "title": "Practica desde el primer día",
      "body": "Queremos que cada taller incluya una práctica guiada: una instrucción clara y una tarea cotidiana con datos inventados.",
      "icon": "clipboard-check",
      "image": "guided-practice",
      "alt": "Fotografía ilustrativa: Personas adultas practicando con una computadora y apoyo cercano."
    },
    {
      "title": "Aprende a verificar en otro lado",
      "body": "Si una respuesta es importante, la práctica recomendada es contrastarla con otra fuente o una persona de confianza. La IA también se equivoca.",
      "icon": "search",
      "image": "peer-support",
      "alt": "Fotografía ilustrativa: Dos personas revisando apuntes y una computadora."
    },
    {
      "title": "Cuida tu privacidad",
      "body": "Las prácticas usan datos inventados. Aprendes a reconocer qué información personal no compartir en las herramientas.",
      "icon": "shield-check",
      "image": "family-phone",
      "alt": "Fotografía ilustrativa: Una madre y su hijo mirando un teléfono en casa."
    },
    {
      "title": "Resuelve cosas cotidianas",
      "body": "Mensajes, avisos, horarios, traducciones y planes: ejercicios cercanos a tu vida, con instrucciones claras.",
      "icon": "device-mobile",
      "image": "work-business",
      "alt": "Fotografía ilustrativa: Personas preparando pedidos junto a una computadora."
    },
    {
      "title": "Aprende a tu ritmo",
      "body": "Queremos crear un espacio para preguntar sin pena, repetir lo que haga falta y avanzar paso a paso, con acompañamiento.",
      "icon": "users",
      "image": "community-learning",
      "alt": "Fotografía ilustrativa: Personas adultas aprendiendo con computadoras en un aula."
    }
  ],
  en: [
    {
      "title": "Practice from day one",
      "body": "We want every workshop to include guided practice: a clear instruction and an everyday task with made-up data.",
      "icon": "clipboard-check",
      "image": "guided-practice",
      "alt": "Illustrative photo: Adults practicing with a computer and close support."
    },
    {
      "title": "Learn to verify elsewhere",
      "body": "If an answer matters, the recommended practice is to check it against another source or a trusted person. AI makes mistakes too.",
      "icon": "search",
      "image": "peer-support",
      "alt": "Illustrative photo: Two people reviewing notes and a computer."
    },
    {
      "title": "Protect your privacy",
      "body": "Practices use made-up data. You learn to recognize which personal information not to share in the tools.",
      "icon": "shield-check",
      "image": "family-phone",
      "alt": "Illustrative photo: A mother and child looking at a phone at home."
    },
    {
      "title": "Solve everyday things",
      "body": "Messages, notices, schedules, translations, and plans: exercises close to your life, with clear instructions.",
      "icon": "device-mobile",
      "image": "work-business",
      "alt": "Illustrative photo: People preparing orders next to a computer."
    },
    {
      "title": "Learn at your pace",
      "body": "We want to create a space to ask without embarrassment, repeat what you need, and move step by step, with guidance.",
      "icon": "users",
      "image": "community-learning",
      "alt": "Illustrative photo: Adults learning with computers in a classroom."
    }
  ],
};

import type { IconName } from '../shared/icon';

export interface LearningBenefit {
  title: string;
  body: string;
  icon: IconName;
  image: string;
  alt: string;
}

export const learningBenefits: LearningBenefit[] = [
  {
    "title": "Practica desde el primer día",
    "body": "Queremos que cada taller incluya una práctica guiada: una instrucción clara y una tarea cotidiana con datos inventados.",
    "icon": "clipboard-check",
    "image": "guided-practice",
    "alt": "Fotografía ilustrativa: Personas adultas practicando con una computadora y apoyo cercano."
  },
  {
    "title": "Aprende a verificar en otro lado",
    "body": "Si una respuesta es importante, la práctica propuesta es contrastarla con otra fuente o una persona de confianza. La IA también se equivoca.",
    "icon": "search",
    "image": "peer-support",
    "alt": "Fotografía ilustrativa: Dos personas revisando apuntes y una computadora."
  },
  {
    "title": "Cuida tu privacidad",
    "body": "Las prácticas propuestas usan datos inventados. Aprenderías a reconocer qué información personal no compartir en las herramientas.",
    "icon": "shield-check",
    "image": "family-phone",
    "alt": "Fotografía ilustrativa: Una madre y su hijo mirando un teléfono en casa."
  },
  {
    "title": "Resuelve cosas cotidianas",
    "body": "Mensajes, avisos, horarios, traducciones y planes: proponemos ejercicios cercanos a tu vida, con instrucciones claras.",
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
];

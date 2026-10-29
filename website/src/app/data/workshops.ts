export interface Workshop {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  summary: string;
  image: string;
  alt: string;
}

export const workshops: Workshop[] = [
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
];

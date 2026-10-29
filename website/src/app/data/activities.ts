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

export const activities: PlannedActivity[] = [
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
];

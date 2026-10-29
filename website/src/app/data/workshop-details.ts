import { workshops } from './workshops';
import { ContentDetail } from './content-detail';

const curriculum = {
  "introduccion-ia": {
    "sections": [
      {
        "heading": "A quién está dirigido",
        "paragraphs": [
          "Personas adultas hispanohablantes sin experiencia previa con inteligencia artificial: padres y madres, adultos trabajadores, adultos mayores y cualquier principiante curioso. No se necesita experiencia con tecnología avanzada."
        ]
      },
      {
        "heading": "Qué necesitas",
        "bullets": [
          "Ninguno obligatorio. Ideal: saber abrir el navegador o una aplicación en el teléfono.",
          "Quienes necesiten ayuda con lo básico del teléfono pueden tomar primero la orientación de habilidades digitales.",
          "No se necesita computadora ni cuenta de IA. Si falta una cuenta o internet, hay demostración guiada, trabajo en pareja o material impreso."
        ]
      },
      {
        "heading": "Objetivos",
        "ordered": true,
        "bullets": [
          "Explicar con sus palabras qué es la inteligencia artificial y qué es la IA generativa.",
          "Nombrar al menos dos ejemplos de herramientas de IA gratuitas.",
          "Describir al menos una cosa que la IA hace bien y una que hace mal.",
          "Escribir un prompt (instrucción) sencillo y obtener una respuesta útil.",
          "Reconocer una \"alucinación\" (respuesta inventada) y explicar por qué hay que verificar.",
          "Nombrar al menos dos tipos de información que nunca deben compartirse con la IA."
        ]
      },
      {
        "heading": "Privacidad en cada práctica",
        "paragraphs": [
          "Los ejercicios usan datos ficticios. Nunca se pide información personal, médica, financiera, migratoria o legal real. La retroalimentación es anónima."
        ]
      }
    ],
    "agenda": [
      {
        "time": "10 min",
        "block": "Bienvenida, presentación, reglas de privacidad"
      },
      {
        "time": "15 min",
        "block": "¿Qué es la IA? ¿Qué es la IA generativa? Ejemplos cotidianos"
      },
      {
        "time": "15 min",
        "block": "Qué puede y no puede hacer + herramientas gratuitas"
      },
      {
        "time": "20 min",
        "block": "Práctica 1: tu primer prompt (guiado, paso a paso)"
      },
      {
        "time": "15 min",
        "block": "Alucinaciones: cuando la IA inventa + cómo verificar"
      },
      {
        "time": "15 min",
        "block": "Práctica 2: detecta el error + privacidad y uso responsable"
      },
      {
        "time": "10 min",
        "block": "Actividad de salida, preguntas, retroalimentación"
      }
    ]
  },
  "vida-diaria": {
    "sections": [
      {
        "heading": "A quién está dirigido",
        "paragraphs": [
          "Personas adultas hispanohablantes que ya tomaron el Taller 1 o tienen nociones básicas de IA, y quieren usarla en tareas cotidianas: mensajes, correos, citas, escuela de los hijos, hogar y traducciones."
        ]
      },
      {
        "heading": "Qué necesitas",
        "bullets": [
          "Recomendado: Taller 1 (o saber qué es un prompt y cómo abrir una herramienta gratuita de IA).",
          "Saber abrir el navegador o una aplicación en el teléfono (con apoyo de parejas y asistentes).",
          "No se necesita computadora ni cuenta de IA. Si falta una cuenta o internet, hay demostración guiada, trabajo en pareja o material impreso."
        ]
      },
      {
        "heading": "Objetivos",
        "ordered": true,
        "bullets": [
          "Redactar con ayuda de la IA un mensaje o correo claro y educado.",
          "Pedir a la IA que explique información complicada (avisos, cartas, instrucciones) con palabras sencillas.",
          "Crear un horario o plan semanal sencillo con ayuda de la IA.",
          "Usar la IA para aprender lo básico de un tema nuevo.",
          "Organizar tareas del hogar en una lista clara.",
          "Traducir textos cortos entre inglés y español y revisar la traducción con criterio.",
          "Aplicar las reglas de privacidad: qué datos nunca se comparten."
        ]
      },
      {
        "heading": "Privacidad en cada práctica",
        "paragraphs": [
          "Los ejercicios usan datos ficticios. Nunca se pide información personal, médica, financiera, migratoria o legal real. La retroalimentación es anónima."
        ]
      }
    ],
    "agenda": [
      {
        "time": "10 min",
        "block": "Bienvenida, repaso exprés (prompt + verificar + privacidad)"
      },
      {
        "time": "20 min",
        "block": "Mensajes y correos + Práctica 1: redacta un mensaje educado"
      },
      {
        "time": "15 min",
        "block": "Entender lo complicado: avisos, cartas e instrucciones"
      },
      {
        "time": "15 min",
        "block": "Horarios, planes y tareas del hogar + Práctica 2: tu plan semanal"
      },
      {
        "time": "20 min",
        "block": "Aprender temas nuevos y traducir + Práctica 3: traduce y verifica"
      },
      {
        "time": "10 min",
        "block": "Reglas de privacidad aplicadas a la vida diaria"
      },
      {
        "time": "10 min",
        "block": "Actividad de salida, preguntas, retroalimentación"
      }
    ]
  },
  "trabajo-negocios": {
    "sections": [
      {
        "heading": "A quién está dirigido",
        "paragraphs": [
          "Adultos trabajadores, personas buscando empleo y dueños de pequeños negocios o emprendedores hispanohablantes que ya tomaron el Taller 1 (o tienen nociones básicas) y quieren aplicar la IA al trabajo."
        ]
      },
      {
        "heading": "Qué necesitas",
        "bullets": [
          "Recomendado: Taller 1 (prompts básicos, alucinaciones, privacidad).",
          "Saber abrir el navegador o una aplicación en el teléfono (con apoyo de parejas y asistentes).",
          "No se necesita computadora ni cuenta de IA. Si falta una cuenta o internet, hay demostración guiada, trabajo en pareja o material impreso.",
          "Aclaración honesta desde el inicio: este taller no ofrece empleo, certificación ni clientes; enseña a usar una herramienta."
        ]
      },
      {
        "heading": "Objetivos",
        "ordered": true,
        "bullets": [
          "Crear con la IA un borrador de currículum ordenado usando información general (sin datos sensibles reales).",
          "Redactar un mensaje profesional (solicitud de empleo, seguimiento, aviso a clientes).",
          "Practicar respuestas para una entrevista de trabajo con la IA como entrevistadora.",
          "Generar ideas básicas de marketing (anuncios, promociones, mensajes para redes) para un negocio ficticio o el suyo (sin datos sensibles).",
          "Organizar tareas de trabajo en un plan semanal.",
          "Identificar qué información del trabajo o negocio nunca debe compartirse con la IA."
        ]
      },
      {
        "heading": "Privacidad en cada práctica",
        "paragraphs": [
          "Los ejercicios usan datos ficticios. Nunca se pide información personal, médica, financiera, migratoria o legal real. La retroalimentación es anónima."
        ]
      }
    ],
    "agenda": [
      {
        "time": "10 min",
        "block": "Bienvenida, repaso exprés, aclaración: no ofrecemos empleo ni certificación"
      },
      {
        "time": "20 min",
        "block": "Currículum + Práctica 1: borrador de tu experiencia"
      },
      {
        "time": "15 min",
        "block": "Comunicación profesional (solicitudes, seguimientos, avisos)"
      },
      {
        "time": "15 min",
        "block": "Entrevistas + Práctica 2: ensaya con la IA"
      },
      {
        "time": "20 min",
        "block": "Negocios: marketing, clientes, organización + Práctica 3: anuncio ficticio"
      },
      {
        "time": "10 min",
        "block": "Cuidado de la información del trabajo y del negocio"
      },
      {
        "time": "10 min",
        "block": "Actividad de salida, preguntas, retroalimentación"
      }
    ]
  },
  "padres-familias": {
    "sections": [
      {
        "heading": "A quién está dirigido",
        "paragraphs": [
          "Padres, madres, abuelos y tutores hispanohablantes que quieren entender cómo la IA afecta la educación de sus hijos y proteger a su familia en línea. No se necesita experiencia previa (el repaso inicial cubre lo esencial)."
        ]
      },
      {
        "heading": "Qué necesitas",
        "bullets": [
          "Ninguno obligatorio; recomendado: Taller 1 (o el repaso de 10 minutos incluido aquí).",
          "Saber abrir el navegador o una aplicación en el teléfono (con apoyo de parejas y asistentes).",
          "No se necesita computadora ni cuenta de IA. Si falta una cuenta o internet, hay demostración guiada, trabajo en pareja o material impreso.",
          "Nota: este taller es para adultos. No se recomienda traer niñas o niños como participantes; los ejemplos sobre menores usan casos ficticios."
        ]
      },
      {
        "heading": "Objetivos",
        "ordered": true,
        "bullets": [
          "Explicar cómo la IA está cambiando la educación y las tareas escolares.",
          "Describir formas comunes (buenas y problemáticas) en que los estudiantes usan la IA.",
          "Usar la IA para apoyar el aprendizaje de sus hijos sin reemplazar su pensamiento.",
          "Reconocer señales de desinformación generada con IA (textos e imágenes sospechosas).",
          "Aplicar reglas básicas de seguridad digital familiar (contraseñas, fotos, permisos, estafas).",
          "Proteger la información personal de la familia frente a herramientas de IA.",
          "Practicar y enseñar el hábito de verificar antes de creer y compartir."
        ]
      },
      {
        "heading": "Privacidad en cada práctica",
        "paragraphs": [
          "Los ejercicios usan datos ficticios. Nunca se pide información personal, médica, financiera, migratoria o legal real. La retroalimentación es anónima."
        ]
      }
    ],
    "agenda": [
      {
        "time": "10 min",
        "block": "Bienvenida, repaso exprés de IA, reglas de privacidad"
      },
      {
        "time": "15 min",
        "block": "La IA en la educación: qué cambió en las escuelas"
      },
      {
        "time": "20 min",
        "block": "Cómo usan los estudiantes la IA + Práctica 1: ayuda con la tarea (bien vs. mal)"
      },
      {
        "time": "20 min",
        "block": "Desinformación con IA + Práctica 2: ¿real o inventado?"
      },
      {
        "time": "15 min",
        "block": "Seguridad digital familiar: contraseñas, fotos, estafas, permisos"
      },
      {
        "time": "10 min",
        "block": "Protección de datos familiares + acuerdo familiar de ejemplo"
      },
      {
        "time": "10 min",
        "block": "Actividad de salida, preguntas, retroalimentación"
      }
    ]
  }
};

export const workshopDetails: ContentDetail[] = workshops.map(workshop => ({ ...workshop, status: 'Taller gratuito', parent: '/talleres', parentLabel: 'Volver a talleres', facts: [{ value: '90–120 min', label: 'Duración' }, { value: 'Teléfono', label: 'Dispositivo' }], ...curriculum[workshop.slug as keyof typeof curriculum] }));

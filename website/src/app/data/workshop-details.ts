import { workshops } from './workshops';
import { ContentDetail } from './content-detail';
import type { Lang } from '../i18n/lang';

const curriculumEs = {
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
      { "time": "10 min", "block": "Bienvenida, presentación, reglas de privacidad" },
      { "time": "15 min", "block": "¿Qué es la IA? ¿Qué es la IA generativa? Ejemplos cotidianos" },
      { "time": "15 min", "block": "Qué puede y no puede hacer + herramientas gratuitas" },
      { "time": "20 min", "block": "Práctica 1: tu primer prompt (guiado, paso a paso)" },
      { "time": "15 min", "block": "Alucinaciones: cuando la IA inventa + cómo verificar" },
      { "time": "15 min", "block": "Práctica 2: detecta el error + privacidad y uso responsable" },
      { "time": "10 min", "block": "Actividad de salida, preguntas, retroalimentación" }
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
      { "time": "10 min", "block": "Bienvenida, repaso exprés (prompt + verificar + privacidad)" },
      { "time": "20 min", "block": "Mensajes y correos + Práctica 1: redacta un mensaje educado" },
      { "time": "15 min", "block": "Entender lo complicado: avisos, cartas e instrucciones" },
      { "time": "15 min", "block": "Horarios, planes y tareas del hogar + Práctica 2: tu plan semanal" },
      { "time": "20 min", "block": "Aprender temas nuevos y traducir + Práctica 3: traduce y verifica" },
      { "time": "10 min", "block": "Reglas de privacidad aplicadas a la vida diaria" },
      { "time": "10 min", "block": "Actividad de salida, preguntas, retroalimentación" }
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
      { "time": "10 min", "block": "Bienvenida, repaso exprés, aclaración: no ofrecemos empleo ni certificación" },
      { "time": "20 min", "block": "Currículum + Práctica 1: borrador de tu experiencia" },
      { "time": "15 min", "block": "Comunicación profesional (solicitudes, seguimientos, avisos)" },
      { "time": "15 min", "block": "Entrevistas + Práctica 2: ensaya con la IA" },
      { "time": "20 min", "block": "Negocios: marketing, clientes, organización + Práctica 3: anuncio ficticio" },
      { "time": "10 min", "block": "Cuidado de la información del trabajo y del negocio" },
      { "time": "10 min", "block": "Actividad de salida, preguntas, retroalimentación" }
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
      { "time": "10 min", "block": "Bienvenida, repaso exprés de IA, reglas de privacidad" },
      { "time": "15 min", "block": "La IA en la educación: qué cambió en las escuelas" },
      { "time": "20 min", "block": "Cómo usan los estudiantes la IA + Práctica 1: ayuda con la tarea (bien vs. mal)" },
      { "time": "20 min", "block": "Desinformación con IA + Práctica 2: ¿real o inventado?" },
      { "time": "15 min", "block": "Seguridad digital familiar: contraseñas, fotos, estafas, permisos" },
      { "time": "10 min", "block": "Protección de datos familiares + acuerdo familiar de ejemplo" },
      { "time": "10 min", "block": "Actividad de salida, preguntas, retroalimentación" }
    ]
  }
};

const curriculumEn = {
  "introduction-to-ai": {
    "sections": [
      {
        "heading": "Who it is for",
        "paragraphs": [
          "Spanish-speaking adults with no previous experience with artificial intelligence: parents, working adults, older adults, and any curious beginner. No advanced technology experience needed."
        ]
      },
      {
        "heading": "What you need",
        "bullets": [
          "Nothing required. Ideal: knowing how to open the browser or an app on your phone.",
          "Anyone who needs help with phone basics can first take the digital skills orientation.",
          "No computer or AI account needed. If an account or internet is missing, there is a guided demonstration, pair work, or printed material."
        ]
      },
      {
        "heading": "Goals",
        "ordered": true,
        "bullets": [
          "Explain in their own words what artificial intelligence and generative AI are.",
          "Name at least two examples of free AI tools.",
          "Describe at least one thing AI does well and one it does poorly.",
          "Write a simple prompt (instruction) and get a useful answer.",
          "Recognize a “hallucination” (made-up answer) and explain why to verify.",
          "Name at least two kinds of information that must never be shared with AI."
        ]
      },
      {
        "heading": "Privacy in every practice",
        "paragraphs": [
          "Exercises use fictional data. Personal, medical, financial, immigration, or legal information is never requested. Feedback is anonymous."
        ]
      }
    ],
    "agenda": [
      { "time": "10 min", "block": "Welcome, introductions, privacy ground rules" },
      { "time": "15 min", "block": "What is AI? What is generative AI? Everyday examples" },
      { "time": "15 min", "block": "What it can and cannot do + free tools" },
      { "time": "20 min", "block": "Practice 1: your first prompt (guided, step by step)" },
      { "time": "15 min", "block": "Hallucinations: when AI makes things up + how to verify" },
      { "time": "15 min", "block": "Practice 2: spot the mistake + privacy and responsible use" },
      { "time": "10 min", "block": "Exit activity, questions, feedback" }
    ]
  },
  "everyday-life": {
    "sections": [
      {
        "heading": "Who it is for",
        "paragraphs": [
          "Spanish-speaking adults who already took Workshop 1 or have basic AI notions, and want to use it for everyday tasks: messages, email, appointments, school, home, and translations."
        ]
      },
      {
        "heading": "What you need",
        "bullets": [
          "Recommended: Workshop 1 (or knowing what a prompt is and how to open a free AI tool).",
          "Knowing how to open the browser or an app on your phone (with pair and assistant support).",
          "No computer or AI account needed. If an account or internet is missing, there is a guided demonstration, pair work, or printed material."
        ]
      },
      {
        "heading": "Goals",
        "ordered": true,
        "bullets": [
          "Draft a clear and polite message or email with AI help.",
          "Ask AI to explain complicated information (notices, letters, instructions) in simple words.",
          "Create a simple schedule or weekly plan with AI help.",
          "Use AI to learn the basics of a new topic.",
          "Organize household tasks into a clear list.",
          "Translate short texts between English and Spanish and review the translation with judgment.",
          "Apply the privacy rules: which data is never shared."
        ]
      },
      {
        "heading": "Privacy in every practice",
        "paragraphs": [
          "Exercises use fictional data. Personal, medical, financial, immigration, or legal information is never requested. Feedback is anonymous."
        ]
      }
    ],
    "agenda": [
      { "time": "10 min", "block": "Welcome, express review (prompt + verify + privacy)" },
      { "time": "20 min", "block": "Messages and email + Practice 1: draft a polite message" },
      { "time": "15 min", "block": "Understanding the complicated: notices, letters, and instructions" },
      { "time": "15 min", "block": "Schedules, plans, and household tasks + Practice 2: your weekly plan" },
      { "time": "20 min", "block": "Learning new topics and translating + Practice 3: translate and verify" },
      { "time": "10 min", "block": "Privacy rules applied to everyday life" },
      { "time": "10 min", "block": "Exit activity, questions, feedback" }
    ]
  },
  "work-and-business": {
    "sections": [
      {
        "heading": "Who it is for",
        "paragraphs": [
          "Working adults, job seekers, and Spanish-speaking small business owners or entrepreneurs who already took Workshop 1 (or have basic notions) and want to apply AI to work."
        ]
      },
      {
        "heading": "What you need",
        "bullets": [
          "Recommended: Workshop 1 (basic prompts, hallucinations, privacy).",
          "Knowing how to open the browser or an app on your phone (with pair and assistant support).",
          "No computer or AI account needed. If an account or internet is missing, there is a guided demonstration, pair work, or printed material.",
          "Honest note from the start: this workshop offers no jobs, certification, or clients; it teaches how to use a tool."
        ]
      },
      {
        "heading": "Goals",
        "ordered": true,
        "bullets": [
          "Create an organized résumé draft with AI using general information (no real sensitive data).",
          "Draft a professional message (job application, follow-up, customer notice).",
          "Practice interview answers with AI as the interviewer.",
          "Generate basic marketing ideas (ads, promotions, social posts) for a fictional business or your own (no sensitive data).",
          "Organize work tasks into a weekly plan.",
          "Identify which work or business information must never be shared with AI."
        ]
      },
      {
        "heading": "Privacy in every practice",
        "paragraphs": [
          "Exercises use fictional data. Personal, medical, financial, immigration, or legal information is never requested. Feedback is anonymous."
        ]
      }
    ],
    "agenda": [
      { "time": "10 min", "block": "Welcome, express review, note: we offer no jobs or certification" },
      { "time": "20 min", "block": "Résumé + Practice 1: draft of your experience" },
      { "time": "15 min", "block": "Professional communication (applications, follow-ups, notices)" },
      { "time": "15 min", "block": "Interviews + Practice 2: rehearse with AI" },
      { "time": "20 min", "block": "Business: marketing, customers, organization + Practice 3: fictional ad" },
      { "time": "10 min", "block": "Caring for work and business information" },
      { "time": "10 min", "block": "Exit activity, questions, feedback" }
    ]
  },
  "parents-and-families": {
    "sections": [
      {
        "heading": "Who it is for",
        "paragraphs": [
          "Spanish-speaking parents, grandparents, and guardians who want to understand how AI affects their children's education and protect their family online. No previous experience needed (the opening review covers the essentials)."
        ]
      },
      {
        "heading": "What you need",
        "bullets": [
          "Nothing required; recommended: Workshop 1 (or the 10-minute review included here).",
          "Knowing how to open the browser or an app on your phone (with pair and assistant support).",
          "No computer or AI account needed. If an account or internet is missing, there is a guided demonstration, pair work, or printed material.",
          "Note: this workshop is for adults. Bringing girls or boys as participants is not recommended; examples about minors use fictional cases."
        ]
      },
      {
        "heading": "Goals",
        "ordered": true,
        "bullets": [
          "Explain how AI is changing education and schoolwork.",
          "Describe common (good and problematic) ways students use AI.",
          "Use AI to support their children's learning without replacing their thinking.",
          "Recognize signs of AI-generated misinformation (suspicious texts and images).",
          "Apply basic family digital safety rules (passwords, photos, permissions, scams).",
          "Protect family personal information from AI tools.",
          "Practice and teach the habit of verifying before believing and sharing."
        ]
      },
      {
        "heading": "Privacy in every practice",
        "paragraphs": [
          "Exercises use fictional data. Personal, medical, financial, immigration, or legal information is never requested. Feedback is anonymous."
        ]
      }
    ],
    "agenda": [
      { "time": "10 min", "block": "Welcome, express AI review, privacy rules" },
      { "time": "15 min", "block": "AI in education: what changed in schools" },
      { "time": "20 min", "block": "How students use AI + Practice 1: homework help (good vs. bad)" },
      { "time": "20 min", "block": "AI misinformation + Practice 2: real or made up?" },
      { "time": "15 min", "block": "Family digital safety: passwords, photos, scams, permissions" },
      { "time": "10 min", "block": "Protecting family data + sample family agreement" },
      { "time": "10 min", "block": "Exit activity, questions, feedback" }
    ]
  }
};

const curriculum: Record<Lang, Record<string, (typeof curriculumEs)['introduccion-ia']>> = {
  es: curriculumEs,
  en: curriculumEn,
};

const meta: Record<Lang, { status: string; parentLabel: string; duration: string; device: string }> = {
  es: { status: 'Taller gratuito', parentLabel: 'Volver a talleres', duration: 'Duración', device: 'Dispositivo' },
  en: { status: 'Free workshop', parentLabel: 'Back to workshops', duration: 'Duration', device: 'Device' },
};

/** Workshop details per language. Arrays share index pairing with `workshops`. */
function build(lang: Lang): ContentDetail[] {
  return workshops[lang].map(workshop => ({
    ...workshop,
    status: meta[lang].status,
    parent: '/talleres',
    parentLabel: meta[lang].parentLabel,
    facts: [
      { value: '90–120 min', label: meta[lang].duration },
      { value: lang === 'es' ? 'Teléfono' : 'Phone', label: meta[lang].device },
    ],
    ...curriculum[lang][workshop.slug],
  }));
}
export const workshopDetails: Record<Lang, ContentDetail[]> = { es: build('es'), en: build('en') };

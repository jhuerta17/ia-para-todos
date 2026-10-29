import { resources } from './resources';
import { ContentDetail } from './content-detail';
import type { Lang } from '../i18n/lang';

const articlesEs = [
  {
    sections: [
      { heading: 'Una herramienta para trabajar con información', paragraphs: ['La inteligencia artificial es un conjunto de herramientas que reconocen patrones y producen resultados a partir de ejemplos y datos. La IA generativa puede crear borradores de texto, imágenes u otros contenidos a partir de una instrucción.', 'Puedes pedirle que organice ideas, proponga un ejemplo o explique algo de otra manera. Una respuesta fluida no significa que la herramienta comprenda tu situación ni que todo lo que dice sea correcto.'] },
      { heading: 'Una respuesta no es una garantía', paragraphs: ['La IA puede inventar datos, omitir detalles o repetir sesgos. A veces presenta un error con mucha seguridad. Conviene revisar nombres, fechas, cálculos y cualquier información que vayas a usar para una decisión importante.'] },
      { heading: 'Empieza con algo pequeño', paragraphs: ['Un prompt es la instrucción que escribes. Explica qué quieres, añade contexto ficticio y pide un formato sencillo. Después lee la respuesta, corrige lo que no encaje y vuelve a preguntar.'], bullets: ['Di qué tarea quieres resolver.', 'Pide palabras sencillas y un formato claro.', 'Revisa y adapta el resultado con tu propio criterio.'] },
    ],
    practice: 'Escribe: “Imagina una cena para tres personas con arroz y verduras. Propón una lista de compras breve y separa los ingredientes por categoría”. Revisa si las cantidades y los ingredientes tienen sentido para ese ejemplo.',
  },
  {
    sections: [
      { heading: 'Un primer borrador para tareas cotidianas', paragraphs: ['La IA puede ayudarte a comenzar un mensaje, ordenar una lista o preparar un horario. Tú decides qué conservar, qué cambiar y qué quitar. El objetivo es apoyar tu tarea, sin reemplazar tu criterio.', 'Para practicar, inventa una situación sencilla: un aviso para un grupo de vecinos o un plan de estudio. Explica a quién va dirigido y qué tono buscas.'] },
      { heading: 'Comprueba que diga lo que tú quieres', paragraphs: ['Lee el mensaje antes de usarlo. Asegúrate de que no añada compromisos, fechas ni hechos que no escribiste. Si una traducción es importante, compárala con otra fuente o revísala con una persona que conozca ambos idiomas.'] },
      { heading: 'Deja los documentos reales fuera de la práctica', paragraphs: ['No hace falta pegar cartas personales, recibos ni datos de tu familia para aprender. Cambia nombres, direcciones y cualquier detalle que identifique a una persona. En los talleres usamos ejemplos inventados.'] },
    ],
    practice: 'Pide dos versiones de un mensaje ficticio: “Un grupo de vecinos quiere cambiar una reunión de las cinco a las seis. Escribe un aviso breve y amable, sin añadir más datos”. Compara las versiones y elige tus propias palabras.',
  },
  {
    sections: [
      { heading: 'Organiza tus ideas antes de redactar', paragraphs: ['Una herramienta de IA puede convertir apuntes generales en un esquema de currículum, un mensaje profesional o una lista de tareas. Para aprender, usa una persona o negocio ficticios.', 'El borrador debe reflejar información verdadera cuando lo adaptes por tu cuenta. No añadas experiencia, habilidades ni resultados que no puedas sostener. La herramienta puede ayudarte a redactar, pero no conoce tu trayectoria.'] },
      { heading: 'Ensaya y revisa', paragraphs: ['Puedes practicar una pregunta de entrevista y pedir una respuesta más clara. Observa si el ejemplo responde a la pregunta y si las palabras suenan naturales. Aprender a usar la herramienta no garantiza empleo, clientes ni certificación.'] },
      { heading: 'Cuida la información del trabajo', paragraphs: ['No compartas datos de clientes, cuentas, salarios, ventas ni documentos internos. Un ejercicio inventado sirve para practicar sin exponer información de otras personas o del negocio.'] },
    ],
    practice: 'Imagina una tienda de plantas llamada Jardín de Ejemplo. Pide un mensaje breve para avisar de un cambio ficticio de horario. Revisa que no invente descuentos, dirección ni promesas sobre el servicio.',
  },
  {
    sections: [
      { heading: 'Conversar antes de compartir', paragraphs: ['La IA puede producir textos e imágenes convincentes que no describen algo real. Un mensaje urgente o una imagen llamativa merecen una pausa antes de reenviarlos.', 'En familia, puedes practicar con ejemplos inventados: quién envía el mensaje, qué pide, de dónde viene y cómo comprobarlo por otro medio. Una sola señal visual no basta para demostrar que algo es falso o verdadero.'] },
      { heading: 'Protege los detalles de tu familia', paragraphs: ['No subas fotos familiares, nombres de menores, escuelas, contraseñas ni documentos personales para practicar. Usa personajes y situaciones ficticios. Revisa los permisos y las opciones de privacidad de las herramientas que decidas usar.'] },
      { heading: 'Apoya el aprendizaje sin reemplazarlo', paragraphs: ['Para una actividad escolar ficticia, pide pistas o preguntas en vez de una respuesta para copiar. Habla sobre el razonamiento y contrasta los datos con el material educativo. El taller para padres y familias está dirigido a personas adultas.'] },
    ],
    practice: 'Inventa un mensaje que anuncie un premio inesperado y pida actuar de inmediato. Sin abrir enlaces ni usar datos reales, anota qué te hace dudar y qué canal conocido consultarías para verificarlo.',
  },
];

const articlesEn = [
  {
    sections: [
      { heading: 'A tool for working with information', paragraphs: ['Artificial intelligence is a set of tools that recognize patterns and produce results from examples and data. Generative AI can create drafts of text, images, or other content from an instruction.', 'You can ask it to organize ideas, suggest an example, or explain something another way. A fluent answer does not mean the tool understands your situation or that everything it says is correct.'] },
      { heading: 'An answer is not a guarantee', paragraphs: ['AI can invent data, omit details, or repeat biases. Sometimes it presents a mistake with great confidence. Review names, dates, calculations, and any information you will use for an important decision.'] },
      { heading: 'Start with something small', paragraphs: ['A prompt is the instruction you write. Explain what you want, add fictional context, and ask for a simple format. Then read the answer, fix what does not fit, and ask again.'], bullets: ['Say which task you want to solve.', 'Ask for simple words and a clear format.', 'Review and adapt the result with your own judgment.'] },
    ],
    practice: 'Write: “Imagine dinner for three people with rice and vegetables. Suggest a short shopping list and separate the ingredients by category.” Check whether the quantities and ingredients make sense for that example.',
  },
  {
    sections: [
      { heading: 'A first draft for everyday tasks', paragraphs: ['AI can help you start a message, organize a list, or prepare a schedule. You decide what to keep, what to change, and what to remove. The goal is to support your task, not replace your judgment.', 'To practice, invent a simple situation: a notice for a neighbors group or a study plan. Explain who it is for and which tone you want.'] },
      { heading: 'Check that it says what you want', paragraphs: ['Read the message before using it. Make sure it adds no commitments, dates, or facts you did not write. If a translation matters, compare it with another source or review it with someone who knows both languages.'] },
      { heading: 'Keep real documents out of the practice', paragraphs: ['There is no need to paste personal letters, receipts, or your family data to learn. Change names, addresses, and any detail that identifies a person. In the workshops we use made-up examples.'] },
    ],
    practice: 'Ask for two versions of a fictional message: “A neighbors group wants to move a meeting from five to six. Write a short, kind notice without adding more details.” Compare the versions and choose your own words.',
  },
  {
    sections: [
      { heading: 'Organize your ideas before drafting', paragraphs: ['An AI tool can turn general notes into a résumé outline, a professional message, or a task list. To learn, use a fictional person or business.', 'The draft must reflect true information when you adapt it on your own. Do not add experience, skills, or results you cannot support. The tool can help you write, but it does not know your background.'] },
      { heading: 'Rehearse and review', paragraphs: ['You can practice an interview question and ask for a clearer answer. Notice whether the example answers the question and whether the words sound natural. Learning to use the tool guarantees no jobs, clients, or certification.'] },
      { heading: 'Protect work information', paragraphs: ['Do not share customer data, accounts, salaries, sales, or internal documents. A made-up exercise works for practice without exposing other people’s or the business’s information.'] },
    ],
    practice: 'Imagine a plant shop called Sample Garden. Ask for a short message announcing a fictional schedule change. Check that it invents no discounts, address, or service promises.',
  },
  {
    sections: [
      { heading: 'Talk before sharing', paragraphs: ['AI can produce convincing texts and images that describe nothing real. An urgent message or a striking image deserves a pause before forwarding.', 'As a family, you can practice with made-up examples: who sends the message, what it asks, where it comes from, and how to check it another way. A single visual cue is not enough to prove something false or true.'] },
      { heading: 'Protect your family’s details', paragraphs: ['Do not upload family photos, minors’ names, schools, passwords, or personal documents to practice. Use fictional characters and situations. Review the permissions and privacy options of the tools you decide to use.'] },
      { heading: 'Support learning without replacing it', paragraphs: ['For a fictional school activity, ask for hints or questions instead of an answer to copy. Talk about the reasoning and compare the data with the school material. The workshop for parents and families is aimed at adults.'] },
    ],
    practice: 'Invent a message announcing an unexpected prize and asking to act immediately. Without opening links or using real data, note what makes you doubt and which known channel you would check to verify it.',
  },
];

const articles: Record<Lang, typeof articlesEs> = { es: articlesEs, en: articlesEn };

const meta: Record<Lang, { status: string; parentLabel: string }> = {
  es: { status: 'Recurso educativo', parentLabel: 'Volver a recursos' },
  en: { status: 'Learning resource', parentLabel: 'Back to resources' },
};

/** Resource details per language. Arrays share index pairing with `resources`. */
function build(lang: Lang): ContentDetail[] {
  return resources[lang].map((resource, index) => ({
    ...resource, status: meta[lang].status, parent: '/recursos', parentLabel: meta[lang].parentLabel, ...articles[lang][index],
  }));
}
export const resourceDetails: Record<Lang, ContentDetail[]> = { es: build('es'), en: build('en') };

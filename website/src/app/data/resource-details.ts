import { resources } from './resources';
import { ContentDetail } from './content-detail';
const articles = [
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
export const resourceDetails: ContentDetail[] = resources.map((resource, index) => ({ ...resource, status: 'Recurso educativo', parent: '/recursos', parentLabel: 'Volver a recursos', ...articles[index] }));

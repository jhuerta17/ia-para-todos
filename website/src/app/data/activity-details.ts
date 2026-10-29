import { activities } from './activities';
import { ContentDetail } from './content-detail';
const practices = [
  ['Escribir una instrucción que explique qué necesitas y cómo quieres la respuesta.', 'Comparar una instrucción general con otra que incluya contexto y formato.', 'Detectar algo que debas comprobar antes de usar una respuesta.'],
  ['Preparar un mensaje educado para una situación inventada.', 'Pedir dos versiones y elegir palabras que suenen a tu propia voz.', 'Revisar un plan semanal ficticio y corregir los horarios que no funcionen.'],
  ['Organizar experiencia laboral inventada en un borrador de currículum.', 'Ensayar una pregunta de entrevista y mejorar la claridad de la respuesta.', 'Identificar información del trabajo o de clientes que no debes compartir.'],
  ['Buscar señales de urgencia, promesas exageradas o remitentes desconocidos.', 'Revisar un texto o imagen ficticios sin asumir que son auténticos.', 'Elegir otra fuente o un canal conocido para verificar antes de compartir.'],
];
export const activityDetails: ContentDetail[] = activities.map((activity, index) => ({
  ...activity, status: 'Actividad prevista · Sin fecha ni sede confirmadas', parent: '/actividades', parentLabel: 'Volver a actividades',
  facts: [{ value: activity.focus, label: 'Enfoque' }, { value: 'Guiada', label: 'Práctica prevista' }, { value: 'Teléfono', label: 'Dispositivo' }],
  sections: [
    { heading: 'Una práctica cercana a tu vida', paragraphs: [activity.summary, 'Esta propuesta forma parte de los contenidos en borrador para futuros talleres piloto. No es un evento programado ni abre una inscripción.'] },
    { heading: 'Lo que practicarías', bullets: practices[index], ordered: true },
    { heading: 'Qué necesitas', paragraphs: ['Un teléfono inteligente y ganas de preguntar. Se contemplan alternativas impresas, demostraciones guiadas o trabajo en pareja si falta dispositivo, cuenta o conexión.'] },
    { heading: 'Con datos inventados', paragraphs: ['Usaríamos nombres, mensajes y situaciones ficticios. No compartas información personal ni documentos reales en las herramientas. La propuesta de trabajo es para personas adultas.'] },
  ],
  gallery: index === 0 ? [{ image: 'guided-practice', alt: 'Escena ilustrativa de aprendizaje acompañado con una computadora.' }, { image: 'peer-support', alt: 'Escena ilustrativa de dos personas revisando apuntes.' }] : undefined,
}));

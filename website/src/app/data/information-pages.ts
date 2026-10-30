import type { Lang } from '../i18n/lang';

export interface InformationPage {
  path: string;
  title: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
}

/** Information pages per language. Arrays share index pairing for hreflang. */
export const informationPages: Record<Lang, InformationPage[]> = {
  es: [
    { path: 'privacidad', title: 'Privacidad', intro: 'Cómo funcionan los datos en este sitio.', sections: [
      { heading: 'Formularios locales', paragraphs: ['Los formularios de participación, colaboración y boletín son prácticas locales. Sus campos no se envían a un servidor ni se guardan en una base de datos o en el almacenamiento del navegador. Usa información inventada, nunca datos reales.', 'Al completar una práctica válida, los campos se vacían y aparece un aviso que confirma que no hubo envío ni registro. Salir de la página también descarta el contenido de esos formularios.'] },
      { heading: 'Búsquedas del sitio', paragraphs: ['El texto y el tema elegidos en los catálogos aparecen en la dirección de la página para poder volver a los resultados. No escribas datos personales en la búsqueda. La dirección puede quedar en el historial de tu navegador.'] },
      { heading: 'Prácticas educativas', paragraphs: ['Los ejercicios usan datos ficticios. No se pide información médica, financiera, migratoria o legal real. La retroalimentación es anónima.'] },
    ] },
    { path: 'terminos', title: 'Acerca de este sitio', intro: 'Información sobre esta iniciativa educativa.', sections: [
      { heading: 'Lo que puedes hacer aquí', paragraphs: ['Puedes leer los talleres, recorrer ejemplos y practicar con formularios locales usando datos inventados. Esto no abre una inscripción, una suscripción, un puesto de voluntariado ni un pago.'] },
      { heading: 'Aprendizaje, sin promesas de resultados', paragraphs: ['Cada taller anuncia sus objetivos y tiempos en su página. No se ofrecen garantías de empleo, certificaciones, clientes ni resultados personales. Los escenarios y fotografías son ilustrativos, no testimonios.'] },
    ] },
    { path: 'seguridad', title: 'Aprender con cuidado', intro: 'Hábitos sencillos para practicar con IA y pensar antes de compartir.', sections: [
      { heading: 'Usa ejemplos inventados', paragraphs: ['Puedes aprender con personajes, mensajes y negocios ficticios. Evita nombres reales, documentos, contraseñas, datos de cuentas, fotos familiares o información de otras personas.'] },
      { heading: 'Verifica lo importante', paragraphs: ['La IA puede equivocarse o inventar respuestas que parecen seguras. Compara la información importante con otra fuente o con una persona de confianza. Una respuesta convincente no demuestra que algo sea cierto.'] },
      { heading: 'Conserva tu criterio', paragraphs: ['Lee, revisa y adapta los borradores antes de usarlos. Si una respuesta no tiene sentido, haz otra pregunta o deja de usarla. La herramienta no conoce toda tu situación.'] },
      { heading: 'Pausa ante la urgencia', paragraphs: ['En una práctica con mensajes ficticios, observa quién habla, qué pide y cómo verificar por un canal conocido. No hace falta abrir enlaces sospechosos ni introducir información real para aprender a detectar señales de alerta.'] },
      { heading: 'Un recordatorio importante', paragraphs: ['Estos consejos no son una garantía de seguridad de herramientas ajenas. Antes de usar una herramienta, revisa sus opciones y la información que decides compartir.'] },
    ] },
  ],
  en: [
    { path: 'en/privacy', title: 'Privacy', intro: 'How data works on this site.', sections: [
      { heading: 'Local forms', paragraphs: ['The participation, collaboration, and newsletter forms are local practices. Their fields are not sent to a server nor stored in a database or browser storage. Use made-up information, never real data.', 'When you complete a valid practice, the fields clear and a notice confirms nothing was sent or registered. Leaving the page also discards those forms’ contents.'] },
      { heading: 'Site searches', paragraphs: ['The text and topic chosen in the catalogs appear in the page address so you can return to the results. Do not type personal data into the search. The address may stay in your browser history.'] },
      { heading: 'Learning practices', paragraphs: ['Exercises use fictional data. Medical, financial, immigration, or legal information is never requested. Feedback is anonymous.'] },
    ] },
    { path: 'en/terms', title: 'About this site', intro: 'Information about this educational initiative.', sections: [
      { heading: 'What you can do here', paragraphs: ['You can read the workshops, browse examples, and practice with local forms using made-up data. This opens no registration, subscription, volunteer position, or payment.'] },
      { heading: 'Learning, with no promises of results', paragraphs: ['Each workshop announces its goals and timing on its page. There are no guarantees of jobs, certifications, clients, or personal results. Scenarios and photographs are illustrative, not testimonials.'] },
    ] },
    { path: 'en/safety', title: 'Learn with care', intro: 'Simple habits for practicing with AI and thinking before sharing.', sections: [
      { heading: 'Use made-up examples', paragraphs: ['You can learn with fictional characters, messages, and businesses. Avoid real names, documents, passwords, account data, family photos, or other people’s information.'] },
      { heading: 'Verify what matters', paragraphs: ['AI can be wrong or invent confident-sounding answers. Compare important information with another source or a trusted person. A convincing answer does not prove something is true.'] },
      { heading: 'Keep your judgment', paragraphs: ['Read, review, and adapt drafts before using them. If an answer makes no sense, ask another question or stop using it. The tool does not know your whole situation.'] },
      { heading: 'Pause when rushed', paragraphs: ['In a practice with fictional messages, notice who is speaking, what they ask, and how to verify through a known channel. You do not need to open suspicious links or enter real information to learn to spot warning signs.'] },
      { heading: 'One important reminder', paragraphs: ['This advice is no guarantee of other tools’ safety. Before using a tool, review its options and the information you decide to share.'] },
    ] },
  ],
};

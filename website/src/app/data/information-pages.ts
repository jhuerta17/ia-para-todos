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
      { heading: 'Formularios de contacto', paragraphs: ['Los formularios de participación, colaboración y boletín envían tus datos a Netlify Forms, el servicio que usamos para recibir mensajes. Solo pedimos los datos necesarios para responderte: nombre, correo electrónico, teléfono opcional y tu mensaje.', 'Usamos esos datos únicamente para contactarte sobre talleres, actividades y novedades de la iniciativa. No los vendemos ni los compartimos con terceros con fines publicitarios. Puedes pedir en cualquier momento que eliminemos tus datos respondiendo a nuestros mensajes.'] },
      { heading: 'Búsquedas del sitio', paragraphs: ['El texto y el tema elegidos en los catálogos aparecen en la dirección de la página para poder volver a los resultados. No escribas datos personales en la búsqueda. La dirección puede quedar en el historial de tu navegador.'] },
      { heading: 'Prácticas educativas', paragraphs: ['Los ejercicios usan datos ficticios. No se pide información médica, financiera, migratoria o legal real. La retroalimentación es anónima.'] },
    ] },
    { path: 'terminos', title: 'Acerca de este sitio', intro: 'Información sobre esta iniciativa educativa.', sections: [
      { heading: 'Lo que puedes hacer aquí', paragraphs: ['Puedes leer los talleres, recorrer ejemplos y escribirnos con los formularios. El boletín te suscribe a las novedades; los formularios de participación y colaboración nos envían tu mensaje para contactarte. No hay pagos en este sitio.'] },
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
      { heading: 'Contact forms', paragraphs: ['The participation, collaboration, and newsletter forms send your data to Netlify Forms, the service we use to receive messages. We only ask for the data needed to reply: name, email, optional phone, and your message.', 'We use that data only to contact you about the initiative’s workshops, activities, and news. We do not sell it or share it with third parties for advertising. You can ask at any time for us to delete your data by replying to our messages.'] },
      { heading: 'Site searches', paragraphs: ['The text and topic chosen in the catalogs appear in the page address so you can return to the results. Do not type personal data into the search. The address may stay in your browser history.'] },
      { heading: 'Learning practices', paragraphs: ['Exercises use fictional data. Medical, financial, immigration, or legal information is never requested. Feedback is anonymous.'] },
    ] },
    { path: 'en/terms', title: 'About this site', intro: 'Information about this educational initiative.', sections: [
      { heading: 'What you can do here', paragraphs: ['You can read the workshops, browse examples, and write to us through the forms. The newsletter subscribes you to news; the participation and collaboration forms send us your message so we can contact you. There are no payments on this site.'] },
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

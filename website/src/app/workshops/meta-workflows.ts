import type { WorkshopSession } from './workshop-types';
export type WorkflowLang = 'es' | 'en';
export function workshopLink(base: string, session: WorkshopSession, lang: WorkflowLang): string {
  return `${base}${lang === 'es' ? '/agenda' : '/en/schedule'}?session=${encodeURIComponent(session.id)}`;
}
export function workshopFacts(s: WorkshopSession, lang: WorkflowLang, base: string): string {
  return [lang === 'es' ? s.titleEs : s.titleEn,
    new Intl.DateTimeFormat(lang === 'es' ? 'es-MX' : 'en-US', {dateStyle:'full',timeStyle:'short',timeZone:s.timeZone}).format(new Date(s.startsAt)) + ` (${s.timeZone})`,
    s.venue, s.address, lang === 'es' ? 'Idioma: '+s.language : 'Language: '+s.language,
    lang === 'es' ? 'Gratis. Disponibilidad al reservar.' : 'Free. Availability checked when booking.', workshopLink(base,s,lang)].join('\n');
}
export function outreachSample(facts: string, lang: WorkflowLang): string {
  const intro = lang === 'es' ? 'Aprende con nosotros. Consulta los detalles y reserva en el sitio.' : 'Learn with us. Check the details and book on the website.';
  return ['Instagram','Facebook','WhatsApp'].map(channel => `${channel}\n${intro}\n${facts}`).join('\n\n');
}
export function discoveryReply(text: string, sessions: WorkshopSession[], base: string, saved?: {language: WorkflowLang; sessionIds: string[]}, now = Date.now()) {
  const value = text.trim().toLowerCase();
  const lang: WorkflowLang = value === 'workshops' || value === 'english' ? 'en' : value === 'talleres' || value === 'español' ? 'es' : saved?.language ?? 'es';
  const upcoming = sessions.filter(s => s.status === 'published' && Date.parse(s.startsAt) > now).sort((a,b)=>a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id));
  const listing = ['talleres','workshops','english','español','hola','hello','hi'].includes(value);
  if (listing) {
    const list = upcoming.slice(0,5);
    return {lang, sessionIds:list.map(s=>s.id), reply:list.length ?
      (lang === 'es' ? 'Próximos talleres. Responde con un número. La lista vence en una hora.\n' : 'Upcoming workshops. Reply with a number. This list expires in one hour.\n') + list.map((s,i)=>`${i+1}. ${lang==='es'?s.titleEs:s.titleEn} — ${new Intl.DateTimeFormat(lang==='es'?'es-MX':'en-US',{dateStyle:'short',timeStyle:'short',timeZone:s.timeZone}).format(new Date(s.startsAt))} (${s.timeZone})`).join('\n') :
      (lang === 'es' ? 'Todavía no hay talleres publicados. Consulta ' : 'No workshops are published yet. Check ') + base + (lang==='es'?'/agenda':'/en/schedule')};
  }
  if (/^\d+$/.test(value)) {
    const id = saved?.sessionIds[Number(value)-1];
    const selected = id && upcoming.find(s=>s.id===id);
    return {lang, reply:selected ? workshopFacts(selected,lang,base) + (lang==='es'?'\nReserva en el sitio; este mensaje no guarda un lugar.':'\nBook on the website; this message does not reserve a place.') :
      (lang==='es'?'Selección inválida, vencida o taller no disponible. Escribe Talleres para actualizar.':'Invalid or expired selection, or workshop unavailable. Send Workshops to refresh.')};
  }
  return {lang, reply:lang==='es' ? `Escribe Talleres para consultar fechas o Workshops para inglés. Para otras preguntas: ${base}/contacto. Este chat no ofrece atención de voluntarios.` : `Send Workshops for dates or Talleres for Spanish. Other questions: ${base}/en/contact. This chat does not provide volunteer support.`};
}

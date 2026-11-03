import type { WorkshopSession } from './workshop-types';
export function workshopDate(s: WorkshopSession, lang: string): string {
  const date=new Date(s.startsAt), end=new Date(s.endsAt);
  return `${new Intl.DateTimeFormat(lang,{timeZone:s.timeZone,dateStyle:'full',timeStyle:'short'}).format(date)} – ${new Intl.DateTimeFormat(lang,{timeZone:s.timeZone,timeStyle:'short'}).format(end)} (${s.timeZone})`;
}
export function venueDay(s: WorkshopSession): string {
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:s.timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(s.startsAt));
  return ['year','month','day'].map(type=>parts.find(p=>p.type===type)!.value).join('-');
}
/** Wall-clock input is interpreted in the venue zone, never the browser zone. */
export function venueWallTime(iso: string, timeZone: string): string {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso));
  const get=(type:string)=>parts.find(p=>p.type===type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
export function venueInstant(wall: string, timeZone: string): string {
  if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(wall))throw new Error('invalid_dates');
  const base=Date.parse(wall+'Z');
  if(!Number.isFinite(base))throw new Error('invalid_dates');
  const candidates=new Set<string>();
  for(let hours=-36;hours<=36;hours+=3){
    const sample=base+hours*3600000;
    const offset=Date.parse(venueWallTime(new Date(sample).toISOString(),timeZone)+'Z')-sample;
    const iso=new Date(base-offset).toISOString();
    if(venueWallTime(iso,timeZone)===wall)candidates.add(iso);
  }
  if(candidates.size!==1)throw new Error('ambiguous_venue_time');
  return [...candidates][0];
}

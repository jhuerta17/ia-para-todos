/** Supported content languages. Spanish is primary (served at `/`), English is
 * secondary (served under `/en/` with localized slugs). */
export type Lang = 'es' | 'en';

export const LANGS: Lang[] = ['es', 'en'];

/** Brand name per language (rendered as live HTML text next to the symbol). */
export const BRAND_NAME: Record<Lang, string> = {
  es: 'IA para todos',
  en: 'AI for everyone',
};

/** Open Graph locale per language. */
export const OG_LOCALE: Record<Lang, string> = {
  es: 'es_ES',
  en: 'en_US',
};

/** Static section keys (Spanish key names are internal identifiers only). */
export type StaticKey =
  | 'home' | 'talleres' | 'actividades' | 'recursos' | 'nosotros' | 'comunidad'
  | 'participar' | 'historias' | 'contacto' | 'privacidad' | 'terminos' | 'seguridad';

/** Full route path per section and language (no leading slash). */
export const PATHS: Record<StaticKey, Record<Lang, string>> = {
  home: { es: '', en: 'en' },
  talleres: { es: 'talleres', en: 'en/workshops' },
  actividades: { es: 'actividades', en: 'en/activities' },
  recursos: { es: 'recursos', en: 'en/resources' },
  nosotros: { es: 'nosotros', en: 'en/about' },
  comunidad: { es: 'comunidad', en: 'en/community' },
  participar: { es: 'participar', en: 'en/participate' },
  historias: { es: 'historias', en: 'en/stories' },
  contacto: { es: 'contacto', en: 'en/contact' },
  privacidad: { es: 'privacidad', en: 'en/privacy' },
  terminos: { es: 'terminos', en: 'en/terms' },
  seguridad: { es: 'seguridad', en: 'en/safety' },
};

/** Detail sections share the listing keys. */
export type DetailKind = 'talleres' | 'actividades' | 'recursos';

/** Absolute URL for a static section in a language. */
export function sectionUrl(key: StaticKey, lang: Lang): string {
  return `/${PATHS[key][lang]}`;
}

/** Absolute URL for a detail page. Slugs are already language-specific. */
export function detailUrl(kind: DetailKind, slug: string, lang: Lang): string {
  return `/${PATHS[kind][lang]}/${slug}`;
}

/** Shared stock-photo note (singular caption/alt, plural caption). */
export const PHOTO_NOTE: Record<Lang, { single: string; plural: string }> = {
  es: { single: 'Fotografía ilustrativa de archivo.', plural: 'Fotografías ilustrativas de archivo.' },
  en: { single: 'Illustrative stock photo.', plural: 'Illustrative stock photos.' },
};

/** The peer URL of a localized absolute path (adds or strips the `/en` prefix
 * for static routes; detail peers are resolved by index at the call site). */
export function staticPeer(url: string): string {
  return url === '/en' || url.startsWith('/en/') ? url.slice(3) || '/' : `/en${url}`;
}

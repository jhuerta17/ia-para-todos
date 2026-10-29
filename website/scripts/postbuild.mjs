// Postbuild: emit crawl files, the Netlify 404 document, and verify launch invariants.
// Runs automatically after `npm run build` (npm lifecycle) on Netlify and locally.
// Route entries come from the same data modules as the Angular router config,
// SITE_URL in src/app/shared/metadata/site.ts is the only canonical host,
// and both language arrays share index pairing for hreflang.
import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from '../src/app/shared/metadata/site.ts';
import { LANGS, PATHS } from '../src/app/i18n/lang.ts';
import { workshops } from '../src/app/data/workshops.ts';
import { activities } from '../src/app/data/activities.ts';
import { resources } from '../src/app/data/resources.ts';
import { informationPages } from '../src/app/data/information-pages.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publish = join(root, 'dist', 'website', 'browser');
const failures = [];
const fail = (message) => failures.push(message);

// 0. Index pairing integrity between language arrays.
const pairs = [
  ['workshops', workshops.es, workshops.en],
  ['activities', activities.es, activities.en],
  ['resources', resources.es, resources.en],
  ['informationPages', informationPages.es, informationPages.en],
];
for (const [name, es, en] of pairs) {
  if (es.length !== en.length) fail(`${name}: es has ${es.length} entries, en has ${en.length}; index pairing broken`);
}

const STATIC_KEYS = ['home', 'talleres', 'actividades', 'recursos', 'nosotros', 'comunidad', 'participar', 'historias', 'contacto'];
// Route records with their language peer for hreflang.
const routes = [];
for (const lang of LANGS) {
  const peer = lang === 'es' ? 'en' : 'es';
  for (const key of STATIC_KEYS) routes.push({ lang, path: PATHS[key][lang], peer: PATHS[key][peer] });
  informationPages[lang].forEach((page, index) => routes.push({ lang, path: page.path, peer: informationPages[peer][index].path }));
  workshops[lang].forEach((entry, index) => routes.push({ lang, path: `${PATHS.talleres[lang]}/${entry.slug}`, peer: `${PATHS.talleres[peer]}/${workshops[peer][index].slug}` }));
  activities[lang].forEach((entry, index) => routes.push({ lang, path: `${PATHS.actividades[lang]}/${entry.slug}`, peer: `${PATHS.actividades[peer]}/${activities[peer][index].slug}` }));
  resources[lang].forEach((entry, index) => routes.push({ lang, path: `${PATHS.recursos[lang]}/${entry.slug}`, peer: `${PATHS.recursos[peer]}/${resources[peer][index].slug}` }));
}
const canonical = (route) => (route === '' ? `${SITE_URL}/` : `${SITE_URL}/${route}`);

// 1. robots.txt: allow-by-default launch, absolute sitemap URL.
writeFileSync(join(publish, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// 2. sitemap.xml: canonical indexable URLs only, with reciprocal hreflang.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${routes
  .map(({ lang, path, peer }) => {
    const es = lang === 'es' ? canonical(path) : canonical(peer);
    const en = lang === 'en' ? canonical(path) : canonical(peer);
    return `  <url><loc>${canonical(path)}</loc><xhtml:link rel="alternate" hreflang="es" href="${es}"/><xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${es}"/></url>`;
  })
  .join('\n')}\n</urlset>\n`;
writeFileSync(join(publish, 'sitemap.xml'), sitemap);

// 3. 404.html from the client shell so Netlify can serve the branded
// recovery page with a real 404 status for unknown paths.
const csrShell = join(publish, 'index.csr.html');
if (existsSync(csrShell)) {
  copyFileSync(csrShell, join(publish, '404.html'));
  rmSync(csrShell);
} else {
  fail(`missing ${csrShell}: expected the prerender build to emit the client shell`);
}

// 4. Every indexable route prerendered with content, language, and SEO peers.
for (const { lang, path, peer } of routes) {
  const file = path === '' ? join(publish, 'index.html') : join(publish, path, 'index.html');
  const label = `/${path || ''} [${lang}]`;
  if (!existsSync(file)) {
    fail(`missing prerendered output for ${label}: ${file}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!/<h1[\s>]/.test(html)) fail(`${label} has no rendered <h1>`);
  if (!html.includes(`<html lang="${lang}">`)) fail(`${label} lacks <html lang="${lang}">`);
  if (!html.includes(`<link rel="canonical" href="${canonical(path)}">`)) fail(`${label} lacks self canonical ${canonical(path)}`);
  const es = lang === 'es' ? canonical(path) : canonical(peer);
  const en = lang === 'en' ? canonical(path) : canonical(peer);
  for (const [hreflang, href] of [['es', es], ['en', en], ['x-default', es]]) {
    if (!html.includes(`hreflang="${hreflang}" href="${href}"`)) fail(`${label} lacks hreflang ${hreflang} → ${href}`);
  }
  const locale = lang === 'es' ? 'es_ES' : 'en_US';
  if (!html.includes(`<meta property="og:locale" content="${locale}">`)) fail(`${label} lacks og:locale ${locale}`);
  if (!html.includes('<app-root') || !html.includes('</app-root>')) fail(`${label} lost the app root`);
  if (/localhost|127\.0\.0\.1/.test(html)) fail(`${label} leaks a localhost URL`);
}

// 5. Single canonical host across source template, app config, and output.
const template = readFileSync(join(root, 'src', 'index.html'), 'utf8');
const templateHosts = new Set(
  [...template.matchAll(/https:\/\/[a-z0-9.-]+/g)]
    .map((match) => match[0])
    .filter((host) => host !== 'https://schema.org'),
);
if (templateHosts.size !== 1 || !templateHosts.has(SITE_URL)) {
  fail(`src/index.html hosts ${[...templateHosts].join(', ') || '(none)'} disagree with SITE_URL ${SITE_URL}`);
}
const home = readFileSync(join(publish, 'index.html'), 'utf8');
if (!home.includes('"Organization"') || !home.includes('"WebSite"')) {
  fail('home page lost Organization/WebSite JSON-LD');
}
const homeEn = readFileSync(join(publish, 'en', 'index.html'), 'utf8');
if (!homeEn.includes('"name":"AI for everyone"') || !homeEn.includes('"inLanguage":"en"')) {
  fail('English home page lost localized JSON-LD');
}

// 6. Referenced launch assets exist in the publish directory.
for (const asset of ['/images/social/og-banner-1200x630.jpg', '/images/social/og-banner-en-1200x630.jpg', '/apple-touch-icon.png', '/site.webmanifest', '/favicon.ico']) {
  if (!existsSync(join(publish, asset))) fail(`missing publish asset ${asset}`);
}

// 7. No stray nested 404 output shadowing the Netlify document.
if (existsSync(join(publish, '404', 'index.html'))) fail('unexpected 404/index.html output');
if (existsSync(join(publish, 'en', '404', 'index.html'))) fail('unexpected en/404/index.html output');

if (failures.length > 0) {
  console.error(`postbuild: ${failures.length} launch check(s) failed:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`postbuild: ok (${routes.length} routes, sitemap + robots + 404.html)`);

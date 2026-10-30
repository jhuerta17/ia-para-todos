// Postbuild: emit crawl files, the Netlify 404 document, and verify launch invariants.
// Runs automatically after `npm run build` (npm lifecycle) on Netlify and locally.
// Route entries come from the same data modules as the Angular router config,
// SITE_URL in src/app/shared/metadata/site.ts is the only canonical host,
// and both language arrays share index pairing for hreflang.
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateDemoSubmissions } from '../src/app/admin/data/demo-generator.ts';
import { bucketByMonth, monthDeltas } from '../src/app/admin/data/analytics.ts';
import { demoImpactMonths, demoSupporters, demoSupporterTotal, demoWorkshops } from '../src/app/admin/data/demo-content.ts';
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

// 1. robots.txt: allow-by-default launch, admin excluded, absolute sitemap URL.
writeFileSync(join(publish, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// 2. sitemap.xml: canonical indexable URLs only, with reciprocal hreflang.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${routes
  .map(({ lang, path, peer }) => {
    const es = lang === 'es' ? canonical(path) : canonical(peer);
    const en = lang === 'en' ? canonical(path) : canonical(peer);
    return `  <url><loc>${canonical(path)}</loc><xhtml:link rel="alternate" hreflang="es" href="${es}"/><xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${es}"/></url>`;
  })
  .join('\n')}\n</urlset>\n`;
writeFileSync(join(publish, 'sitemap.xml'), sitemap);
if (sitemap.includes('/admin')) fail('sitemap leaks admin routes');

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

// 8. Netlify Forms detection: every prerendered form carries its name,
// detection attribute, honeypot, and named fields; no demo-form copy remains.
const formPages = [
  ['index.html', 'participate'],
  ['comunidad/index.html', 'collaborate'],
  ['participar/index.html', 'participate'],
  ['en/index.html', 'participate'],
  ['en/community/index.html', 'collaborate'],
  ['en/participate/index.html', 'participate'],
];
for (const [page, name] of formPages) {
  const html = readFileSync(join(publish, page), 'utf8');
  const formTags = [...html.matchAll(/<form[^>]*>/g)].map(match => match[0]);
  if (!formTags.some(form => form.includes(`name="${name}"`) && form.includes('data-netlify="true"') && form.includes('netlify-honeypot="bot-field"'))) {
    fail(`${page} lacks a detectable Netlify form named ${name}`);
  }
  for (const field of ['name="language"', 'name="bot-field"', 'name="name"', 'name="email"', 'name="interest"', 'name="consent"']) {
    if (!html.includes(field)) fail(`${page} form ${name} lacks ${field}`);
  }
}
for (const { path } of routes) {
  const file = path === '' ? join(publish, 'index.html') : join(publish, path, 'index.html');
  const html = readFileSync(file, 'utf8');
  const forms = [...html.matchAll(/<form[^>]*>/g)].map(match => match[0]);
  if (!forms.some(form => form.includes('name="newsletter"') && form.includes('data-netlify="true"'))) fail(`/${path || ''} lacks the newsletter form`);
  for (const leftover of ['no se enviaron datos', 'Demostración: no', 'práctica local', 'local practice', 'de prueba', 'Test email', 'Test name']) {
    if (html.includes(leftover)) fail(`/${path || ''} still mentions demo-form copy: ${leftover}`);
  }
}

// 9. Admin routes prerender as English shells: present but uncrawlable,
// with no public chrome, forms, canonicals, or hreflang peers.
const ADMIN_PATHS = ['admin', 'admin/requests', 'admin/workshops', 'admin/impact', 'admin/supporters', 'admin/plans', 'admin/sign-in'];
for (const path of ADMIN_PATHS) {
  const file = join(publish, path, 'index.html');
  const label = `/${path} [admin]`;
  if (!existsSync(file)) {
    fail(`missing prerendered output for ${label}: ${file}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!/<h1[\s>]/.test(html)) fail(`${label} has no rendered <h1>`);
  if (!html.includes('<html lang="en">')) fail(`${label} lacks <html lang="en">`);
  if (!html.includes('name="robots"') || !html.includes('content="noindex, nofollow"')) fail(`${label} lacks noindex, nofollow`);
  if (html.includes('rel="canonical"')) fail(`${label} must not set a canonical`);
  if (html.includes('hreflang=')) fail(`${label} must not set hreflang alternates`);
  if (html.includes('name="newsletter"') || html.includes('<app-site-header')) fail(`${label} renders public chrome`);
}

// 10. Demo generator is deterministic: fixed input, exact output.
{
  const NOW = Date.UTC(2026, 9, 30);
  const first = generateDemoSubmissions(NOW);
  const second = generateDemoSubmissions(NOW);
  if (JSON.stringify(first) !== JSON.stringify(second)) fail('demo generator is not deterministic');
  if (first.length !== 227) fail(`demo generator drift: expected 227 rows, got ${first.length}`);
  if (first[0]?.createdAt !== '2026-10-29T22:59:42.180Z' || first[first.length - 1]?.createdAt !== '2026-05-02T08:16:24.980Z') {
    fail('demo generator drift: boundary dates changed');
  }
  const forms = new Set(first.map((row) => row.form));
  for (const form of ['participate', 'collaborate', 'newsletter']) {
    if (!forms.has(form)) fail(`demo generator drift: form ${form} missing`);
  }
}

// 11. Analytics bucketing is exact on fixed input (mid-month UTC dates
// stay in-month under any host timezone).
{
  const rows = [
    { form: 'participate', createdAt: '2026-10-15T12:00:00.000Z' },
    { form: 'participate', createdAt: '2026-09-15T12:00:00.000Z' },
    { form: 'newsletter', createdAt: '2026-09-15T12:00:00.000Z' },
    { form: 'collaborate', createdAt: 'not-a-date' },
    { form: 'newsletter', createdAt: '2025-01-15T12:00:00.000Z' },
  ];
  const buckets = bucketByMonth(rows, 6, Date.UTC(2026, 9, 30));
  const compact = buckets.map((b) => [b.label, b.participate, b.collaborate, b.newsletter, b.total].join(':'));
  const expected = [
    'May:0:0:0:0', 'Jun:0:0:0:0', 'Jul:0:0:0:0', 'Aug:0:0:0:0',
    'Sep:1:0:1:2', 'Oct:1:0:0:1',
  ];
  if (JSON.stringify(compact) !== JSON.stringify(expected)) fail(`analytics drift: ${compact.join(' | ')}`);
  const deltas = monthDeltas(rows, Date.UTC(2026, 9, 30));
  if (deltas.participate.current !== 1 || deltas.participate.previous !== 1) fail('analytics drift: participate delta');
  if (deltas.collaborate.current !== 0 || deltas.collaborate.previous !== 0) fail('analytics drift: collaborate delta');
  if (deltas.newsletter.current !== 0 || deltas.newsletter.previous !== 1) fail('analytics drift: newsletter delta');
}

// 12. Demo content is deterministic: fixed input, exact output.
{
  const NOW = Date.UTC(2026, 9, 30);
  const workshops = demoWorkshops(NOW);
  if (workshops.length !== 8) fail(`demo content drift: expected 8 workshops, got ${workshops.length}`);
  if (workshops[0]?.title !== 'IA para Padres y Familias') fail('demo content drift: workshop order changed');
  if (workshops[workshops.length - 1]?.title !== 'Introducción a la IA') fail('demo content drift: workshop range changed');
  const registered = workshops.reduce((sum, workshop) => sum + workshop.registered, 0);
  if (registered !== 195) fail(`demo content drift: expected 195 registered, got ${registered}`);
  const venues = new Set(workshops.map((workshop) => workshop.location));
  const dfw = new Set(['Oak Cliff Community Center', 'Fort Worth Public Library', 'Arlington Community Center', 'Online session']);
  for (const venue of venues) {
    if (!dfw.has(venue)) fail(`demo content drift: unexpected venue ${venue}`);
  }
  const supporters = demoSupporters(NOW);
  if (supporters.length !== 10) fail(`demo content drift: expected 10 supporters, got ${supporters.length}`);
  if (demoSupporterTotal() !== 119500) fail(`demo content drift: expected $119,500 raised, got ${demoSupporterTotal()}`);
  if (supporters[0]?.name !== 'Fundación Lumen') fail('demo content drift: supporter order changed');
  const byId = new Map(supporters.map((supporter) => [supporter.id, supporter]));
  if (byId.get('d1')?.since !== 'Mar 2026') fail('demo content drift: supporter tenure changed');
  if (byId.get('d9')?.since !== 'Sep 2026') fail('demo content drift: supporter tenure changed');
  const months = demoImpactMonths(workshops, NOW);
  if (months.length !== 6) fail(`demo content drift: expected 6 impact months, got ${months.length}`);
  const attendees = months.reduce((sum, month) => sum + month.attendees, 0);
  if (attendees !== 170) fail(`demo content drift: expected 170 attendees, got ${attendees}`);
  if (months[months.length - 1]?.volunteers !== 9) fail('demo content drift: volunteer series changed');
}

// 13. Admin function ships with the workspace Netlify deploys.
if (!existsSync(join(root, 'netlify', 'functions', 'submissions.mts'))) {
  fail('missing netlify/functions/submissions.mts: the inbox backend would not deploy');
}

// 14. Tailwind wiring: the admin theme side-build exists, carries the
// compiled utilities, and stays out of the global stylesheet.
const themeFile = join(publish, 'admin-theme.css');
if (!existsSync(themeFile)) {
  fail('missing admin-theme.css: build:admin-css did not emit the side-built asset');
} else {
  const theme = readFileSync(themeFile, 'utf8');
  for (const marker of ['.font-sans', '.menu-item', '--color-brand-800']) {
    if (!theme.includes(marker)) fail(`admin-theme.css lacks compiled output (${marker})`);
  }
}
const globalBundle = readdirSync(publish).find((file) => /^styles.*\.css$/.test(file));
if (!globalBundle) {
  fail('missing built styles bundle');
} else if (readFileSync(join(publish, globalBundle), 'utf8').includes('.font-sans')) {
  fail(`${globalBundle} leaks admin Tailwind utilities into the initial bundle`);
}

// 15. Admin first paint is styled (FOUC guard): every prerendered admin
// shell carries the render-blocking theme link in its initial HTML, the
// source template early-loads it for client-shell admin hits, and the
// public home page never references it.
for (const path of ADMIN_PATHS) {
  const file = join(publish, path, 'index.html');
  if (!existsSync(file)) continue; // missing output is covered by check 9
  const html = readFileSync(file, 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  if (!head.includes('id="admin-theme"') || !head.includes('/admin-theme.css')) {
    fail(`/${path} [admin] lacks the render-blocking admin-theme link (FOUC regression)`);
  }
}
if (!template.includes("getElementById('admin-theme')") || !template.includes('/admin-theme.css')) {
  fail('src/index.html lost the admin early-loader: client-shell admin hits would flash unstyled');
}
if (/<link[^>]*admin-theme/.test(home)) {
  fail('public home links admin-theme: public visitors would download admin CSS');
}

// 16. Admin font preloads are static (parser-inserted): the semibold/bold
// weights ride with the 400s instead of swapping late. Script-injected
// font preloads do NOT match fetches from the media="print" stylesheet
// twin (Chromium refetches: 7 hits for 5 faces), so stamp them into the
// prerendered admin HTML here; public pages stay untouched.
const ADMIN_FONTS = [
  'fonts/instrument-sans/instrument-sans-latin-500-normal.woff2',
  'fonts/instrument-sans/instrument-sans-latin-600-normal.woff2',
  'fonts/libre-baskerville/libre-baskerville-latin-700-normal.woff2',
];
for (const href of ADMIN_FONTS) {
  if (!existsSync(join(publish, href))) fail(`missing publish font ${href}`);
}
for (const path of ADMIN_PATHS) {
  const file = join(publish, path, 'index.html');
  if (!existsSync(file)) continue; // missing output is covered by check 9
  let html = readFileSync(file, 'utf8');
  if (html.includes(ADMIN_FONTS[0])) continue; // idempotent reruns stamp once
  const anchor = html.indexOf('instrument-sans-latin-400-normal.woff2');
  if (anchor === -1) {
    fail(`/${path} [admin] lacks the 400 preload anchor for admin font preloads`);
    continue;
  }
  const tagEnd = html.indexOf('>', anchor) + 1;
  const links = ADMIN_FONTS.map((href) => `  <link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`).join('\n');
  html = `${html.slice(0, tagEnd)}\n${links}${html.slice(tagEnd)}`;
  writeFileSync(file, html);
}

if (failures.length > 0) {
  console.error(`postbuild: ${failures.length} launch check(s) failed:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`postbuild: ok (${routes.length} public + ${ADMIN_PATHS.length} admin routes, sitemap + robots + 404.html)`);

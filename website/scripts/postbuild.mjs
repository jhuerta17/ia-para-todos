// Postbuild: emit crawl files, the Netlify 404 document, and verify launch invariants.
// Runs automatically after `npm run build` (npm lifecycle) on Netlify and locally.
// Route entries come from the same data modules as the Angular router config,
// and SITE_URL in src/app/shared/metadata/site.ts is the only canonical host.
import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from '../src/app/shared/metadata/site.ts';
import { workshops } from '../src/app/data/workshops.ts';
import { activities } from '../src/app/data/activities.ts';
import { resources } from '../src/app/data/resources.ts';
import { informationPages } from '../src/app/data/information-pages.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publish = join(root, 'dist', 'website', 'browser');
const failures = [];
const fail = (message) => failures.push(message);

const staticRoutes = ['', 'talleres', 'actividades', 'recursos', 'nosotros', 'comunidad', 'participar', 'historias', 'contacto'];
const routes = [
  ...staticRoutes,
  ...informationPages.map((page) => page.path),
  ...workshops.map((entry) => `talleres/${entry.slug}`),
  ...activities.map((entry) => `actividades/${entry.slug}`),
  ...resources.map((entry) => `recursos/${entry.slug}`),
];
const canonical = (route) => (route === '' ? `${SITE_URL}/` : `${SITE_URL}/${route}`);

// 1. robots.txt: allow-by-default launch, absolute sitemap URL.
writeFileSync(join(publish, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// 2. sitemap.xml: canonical indexable URLs only. No invented dates.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .map((route) => `  <url><loc>${canonical(route).replace(/&/g, '&amp;')}</loc></url>`)
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

// 4. Every indexable route prerendered with content and a self canonical.
for (const route of routes) {
  const file = route === '' ? join(publish, 'index.html') : join(publish, route, 'index.html');
  if (!existsSync(file)) {
    fail(`missing prerendered output for /${route}: ${file}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!/<h1[\s>]/.test(html)) fail(`/${route || ''} has no rendered <h1>`);
  if (!html.includes(`<link rel="canonical" href="${canonical(route)}">`)) fail(`/${route || ''} lacks self canonical ${canonical(route)}`);
  if (!html.includes('<app-root') || !html.includes('</app-root>')) fail(`/${route || ''} lost the app root`);
  if (/localhost|127\.0\.0\.1/.test(html)) fail(`/${route || ''} leaks a localhost URL`);
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
if (!home.includes(`"@type": "Organization"`) || !home.includes(`"@type": "WebSite"`)) {
  fail('home page lost Organization/WebSite JSON-LD');
}

// 6. Referenced launch assets exist in the publish directory.
for (const asset of ['/images/social/og-banner-1200x630.jpg', '/apple-touch-icon.png', '/site.webmanifest', '/favicon.ico']) {
  if (!existsSync(join(publish, asset))) fail(`missing publish asset ${asset}`);
}

// 7. No stray nested 404 output shadowing the Netlify document.
if (existsSync(join(publish, '404', 'index.html'))) fail('unexpected 404/index.html output');

if (failures.length > 0) {
  console.error(`postbuild: ${failures.length} launch check(s) failed:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`postbuild: ok (${routes.length} routes, sitemap + robots + 404.html)`);

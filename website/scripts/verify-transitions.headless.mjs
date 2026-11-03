// Headless page-transition verification for the prerendered site.
//
// Serves dist/website/browser locally, drives home -> contact client-side
// navigations in project Chromium, and asserts the solid wipe panel covers
// the viewport before the route swaps and clears after revealing the new
// page. Screenshots land in tmp/verify-transitions/.
//
// Usage: npm run verify:transitions          (headless, default)
//        npm run verify:transitions:headed   (watch it drive)
// Requires: npm run build && npm run install:chromium
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const website = join(here, '..');
// Repo-local Chromium (see `npm run install:chromium`); honors an explicit override.
// Must precede the playwright-core import: the registry reads env at load.
process.env.PLAYWRIGHT_BROWSERS_PATH ||= join(website, '..', '.playwright-browsers');
const { chromium } = await import('playwright-core');
const publish = join(website, 'dist', 'website', 'browser');
const evidence = join(website, '..', 'tmp', 'verify-transitions');
const HEADED = process.env.HEADED === '1';

if (!existsSync(join(publish, 'index.html'))) {
  console.error('verify:transitions: missing dist output — run `npm run build` first.');
  process.exit(2);
}
mkdirSync(evidence, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

// Minimal static server with directory-index + .html fallback (mirrors
// verify-forms; no Netlify semantics needed for client-side transitions).
function serve() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405).end();
        return;
      }
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const candidates = [join(publish, path), join(publish, path, 'index.html'), `${join(publish, path)}.html`];
      const file = candidates.find((candidate) => {
        try { return existsSync(candidate) && !statSync(candidate).isDirectory(); } catch { return false; }
      });
      if (!file) {
        res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '  ok' : '  FAIL'} ${name}${detail && ok ? ` (${detail})` : ''}`);
  if (!ok) failures.push(detail ? `${name}: ${detail}` : name);
};

const results = { sequences: {}, timings: {} };
const VIEWPORT = { width: 1280, height: 800 };

// Records wipe data-state changes into window.__wipeStates via a mutation
// observer; returns false when the panel is absent (pre-feature builds).
async function armRecorder(page) {
  return page.evaluate(() => {
    const panel = document.querySelector('app-page-transition .wipe');
    if (!panel) return false;
    window.__wipeStates = [panel.getAttribute('data-state')];
    new MutationObserver(() => window.__wipeStates.push(panel.getAttribute('data-state')))
      .observe(panel, { attributes: true, attributeFilter: ['data-state'] });
    return true;
  });
}

async function wipeStates(page) {
  return page.evaluate(() => window.__wipeStates ?? null);
}

// Settle wait on the state attribute itself: the idle panel is
// visibility:hidden, so a visibility-based waitFor can never match it,
// and the covered window is too brief to poll for reliably. Midpoint
// states are asserted from the lossless mutation-observer recording.
async function waitForWipeIdle(page, timeout = 10000) {
  try {
    await page.waitForFunction(
      () => document.querySelector('app-page-transition .wipe')?.getAttribute('data-state') === 'idle',
      null,
      { timeout },
    );
    return true;
  } catch {
    return false;
  }
}

// Strict rest-state check: exactly one panel, and hidden (isHidden alone
// passes vacuously when the panel is absent, which must fail instead).
async function panelHidden(page) {
  const panel = page.locator('app-page-transition .wipe');
  return (await panel.count()) === 1 && (await panel.isHidden());
}

async function main() {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: !HEADED });
  } catch (error) {
    console.error(`verify:transitions: cannot launch Chromium (${error.message.split('\n')[0]}). Run \`npm run install:chromium\` first.`);
    server.close();
    process.exit(2);
  }
  try {
    // ---- 1. Home -> contact: wipe covers before the swap, clears after ----
    {
      const page = await browser.newPage({ viewport: VIEWPORT });
      await page.addInitScript(() => {
        window.__wipeStates = [];
        const attach = () => {
          const panel = document.querySelector('app-page-transition .wipe');
          if (!panel) return false;
          window.__wipeStates.push(panel.getAttribute('data-state'));
          new MutationObserver(() => window.__wipeStates.push(panel.getAttribute('data-state')))
            .observe(panel, { attributes: true, attributeFilter: ['data-state'] });
          return true;
        };
        const boot = () => {
          if (attach()) return;
          new MutationObserver((_mutations, observer) => { if (attach()) observer.disconnect(); })
            .observe(document.documentElement, { childList: true, subtree: true });
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
        else boot();
      });
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.locator('main h1, main h2').first().waitFor();
      const loadSequence = await wipeStates(page);
      check('home: wipe panel rendered', (loadSequence ?? []).length > 0);
      check('home: initial load never wipes', (loadSequence ?? []).every((state) => state === 'idle'), (loadSequence ?? []).join('>') || 'panel missing');
      await page.screenshot({ path: join(evidence, 'home-initial.png') });
      await page.evaluate(() => { window.__wipeStates = []; });
      const started = Date.now();
      await page.locator('nav[aria-label="Navegación principal"] a', { hasText: 'Contacto' }).click();
      await page.waitForURL('**/contacto', { timeout: 10000 });
      check('home->contact: url swaps under cover', page.url().endsWith('/contacto'), page.url());
      check('home->contact: panel settles back to rest', await waitForWipeIdle(page, 10000));
      results.timings['home-contact'] = Date.now() - started;
      const sequence = await wipeStates(page);
      results.sequences['home-contact'] = sequence;
      const order = (sequence ?? []).join('>');
      check('home->contact: panel reaches full cover', (sequence ?? []).includes('covered'), order || 'no states recorded');
      check('home->contact: cover-then-reveal order', /covering>covered>revealing>idle/.test(order), order || 'no states recorded');
      check('home->contact: contact page revealed', await page.locator('main h1, main h2').first().isVisible());
      check('home->contact: panel hidden at rest', await panelHidden(page));
      await page.screenshot({ path: join(evidence, 'contact-revealed.png') });
      await page.close();
    }

    // ---- 2. History back wipes too ----
    {
      const page = await browser.newPage({ viewport: VIEWPORT });
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.locator('main h1, main h2').first().waitFor();
      await armRecorder(page);
      await page.locator('nav[aria-label="Navegación principal"] a', { hasText: 'Contacto' }).click();
      await page.waitForURL('**/contacto', { timeout: 10000 });
      await waitForWipeIdle(page, 10000);
      await page.evaluate(() => { window.__wipeStates = []; });
      await page.goBack();
      await page.waitForURL(`${base}/`, { timeout: 10000 });
      check('back: panel settles back to rest', await waitForWipeIdle(page, 10000));
      const sequence = await wipeStates(page);
      results.sequences['back-home'] = sequence;
      check('back: wipe runs on history navigation', (sequence ?? []).includes('covered'), (sequence ?? []).join('>') || 'no states recorded');
      await page.close();
    }

    // ---- 3. Same-page navigation never wipes (filters, anchors) ----
    {
      const page = await browser.newPage({ viewport: VIEWPORT });
      await page.goto(base + '/contacto', { waitUntil: 'networkidle' });
      await page.locator('main h1, main h2').first().waitFor();
      await armRecorder(page);
      await page.evaluate(() => { window.__wipeStates = []; });
      await page.locator('nav[aria-label="Navegación principal"] a', { hasText: 'Contacto' }).click();
      await page.waitForTimeout(1200);
      const sequence = await wipeStates(page);
      results.sequences['same-page'] = sequence;
      check('same-page: no wipe states', (sequence ?? []).length === 0, (sequence ?? []).join('>') || 'clean');
      check('same-page: url unchanged', page.url().endsWith('/contacto'), page.url());
      await page.close();
    }

    // ---- 4. Reduced motion: instant swap, no wipe ----
    {
      const context = await browser.newContext({ viewport: VIEWPORT, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.locator('main h1, main h2').first().waitFor();
      await armRecorder(page);
      await page.evaluate(() => { window.__wipeStates = []; });
      const started = Date.now();
      await page.locator('nav[aria-label="Navegación principal"] a', { hasText: 'Contacto' }).click();
      await page.waitForURL('**/contacto', { timeout: 10000 });
      results.timings['reduced-motion'] = Date.now() - started;
      const sequence = await wipeStates(page);
      results.sequences['reduced-motion'] = sequence;
      check('reduced-motion: no wipe states', (sequence ?? []).length === 0, (sequence ?? []).join('>') || 'clean');
      check('reduced-motion: panel hidden', await panelHidden(page));
      await page.close();
      await context.close();
    }

    // ---- 5. Cover geometry: the covered panel fills the viewport ----
    {
      const page = await browser.newPage({ viewport: VIEWPORT });
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      const panel = page.locator('app-page-transition .wipe');
      if ((await panel.count()) === 0) {
        check('geometry: covered panel fills viewport', false, 'no panel rendered');
      } else {
        await page.evaluate(() => document.querySelector('app-page-transition .wipe').setAttribute('data-state', 'covered'));
        await page.screenshot({ path: join(evidence, 'panel-covered.png') });
        const box = await page.evaluate(() => {
          const el = document.querySelector('app-page-transition .wipe');
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const out = { x: rect.x, y: rect.y, w: rect.width, h: rect.height, visible: style.visibility, bg: style.backgroundColor };
          el.setAttribute('data-state', 'idle');
          return out;
        });
        const fills = box.x <= 0 && box.y <= 0 && box.w >= VIEWPORT.width && box.h >= VIEWPORT.height;
        check('geometry: covered panel fills viewport', fills && box.visible === 'visible', JSON.stringify(box));
        const opaque = /^rgb\(/.test(box.bg) || /^rgba\(.+,\s*1(\.0*)?\)$/.test(box.bg);
        check('geometry: panel is opaque', opaque, box.bg);
        check('geometry: panel matches page background', box.bg === 'rgb(255, 255, 255)', box.bg);
      }
      await page.close();
    }

    // ---- 6. Content slideshow: outgoing slides up/fades, incoming rises ----
    {
      const page = await browser.newPage({ viewport: VIEWPORT });
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.locator('main h1, main h2').first().waitFor();
      await page.evaluate(() => {
        document.body.setAttribute('data-page-transition', 'covering');
        document.querySelector('app-page-transition .wipe').setAttribute('data-state', 'covering');
      });
      await page.waitForTimeout(200);
      await page.screenshot({ path: join(evidence, 'mid-wipe.png') });
      await page.evaluate(() => document.querySelector('app-page-transition .wipe').setAttribute('data-state', 'idle'));
      await page.waitForTimeout(500);
      const slid = await page.evaluate(() => {
        const style = getComputedStyle(document.querySelector('main'));
        return { opacity: style.opacity, transform: style.transform };
      });
      check('content: outgoing page slides up and fades', slid.opacity === '0' && slid.transform !== 'none', JSON.stringify(slid));
      await page.evaluate(() => document.body.setAttribute('data-page-transition', 'revealing'));
      const riseName = await page.evaluate(() => getComputedStyle(document.querySelector('main')).animationName);
      check('content: incoming page rises in', riseName.includes('page-transition-rise'), riseName);
      await page.evaluate(() => document.body.removeAttribute('data-page-transition'));
      let rests = false;
      try {
        await page.waitForFunction(() => getComputedStyle(document.querySelector('main')).opacity === '1', null, { timeout: 5000 });
        rests = true;
      } catch { rests = false; }
      check('content: rests naturally after wipe', rests);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  writeFileSync(join(evidence, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`\n evidence: tmp/verify-transitions/ (${Object.keys(results.sequences).length} sequences, ${Object.keys(results.timings).length} timings)`);
  if (failures.length > 0) {
    console.error(`verify:transitions: ${failures.length} check(s) failed:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log('verify:transitions: ok');
}

main().catch((error) => {
  console.error(`verify:transitions: crashed: ${error.message}`);
  process.exit(1);
});

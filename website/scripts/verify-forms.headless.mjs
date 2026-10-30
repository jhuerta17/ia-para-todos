// Headless Netlify Forms verification for the prerendered site.
//
// Serves dist/website/browser locally, drives each form (participate,
// collaborate, newsletter) through the public UI in project Chromium, and
// asserts the submitting state, the success message, the network-error path,
// and the no-JS native POST fallback. Screenshots land in tmp/verify-forms/.
//
// Usage: npm run verify:forms            (headless, default)
//        npm run verify:forms:headed     (watch it drive)
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
const evidence = join(website, '..', 'tmp', 'verify-forms');
const HEADED = process.env.HEADED === '1';

if (!existsSync(join(publish, 'index.html'))) {
  console.error('verify:forms: missing dist output — run `npm run build` first.');
  process.exit(2);
}
mkdirSync(evidence, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

// Minimal static server with directory-index + .html fallback (no Netlify
// semantics: statuses/redirects are covered by postbuild + deploy checks).
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

const results = { viewports: {}, timings: {}, payloads: {} };

async function main() {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: !HEADED });
  } catch (error) {
    console.error(`verify:forms: cannot launch Chromium (${error.message.split('\n')[0]}). Run \`npm run install:chromium\` first.`);
    server.close();
    process.exit(2);
  }
  try {
    // ---- 1. Happy paths: participate (ES+EN), collaborate, newsletter ----
    const flows = [
      { key: 'participate-es', url: '/participar', form: 'participate', interest: 'Vida diaria', message: 'Quiero practicar desde cero.', success: 'Hemos recibido tu mensaje', sending: 'Enviando', consent: true },
      { key: 'participate-en', url: '/en/participate', form: 'participate', interest: 'Everyday life', message: 'I want to practice from scratch.', success: 'We received your message', sending: 'Sending', consent: true },
      { key: 'collaborate-es', url: '/comunidad', form: 'collaborate', interest: 'Traducir contenidos', message: 'Quiero practicar desde cero.', success: 'Hemos recibido tu mensaje', sending: 'Enviando', consent: true },
      { key: 'newsletter-es', url: '/', form: 'newsletter', success: 'Gracias por suscribirte', sending: 'Enviando', consent: false },
      { key: 'newsletter-en', url: '/en', form: 'newsletter', success: 'Thanks for subscribing', sending: 'Sending', consent: false },
    ];
    for (const flow of flows) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      let payload = null;
      let releasePost;
      const postGate = new Promise((resolve) => { releasePost = resolve; });
      await page.route('**/*', async (route) => {
        const req = route.request();
        if (req.method() === 'POST') {
          payload = req.postData();
          await postGate;
          await route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' });
        } else {
          await route.continue();
        }
      });
      const started = Date.now();
      await page.goto(base + flow.url, { waitUntil: 'domcontentloaded' });
      await page.locator('main h1, main h2').first().waitFor();
      results.timings[flow.key] = Date.now() - started;
      const form = page.locator(`form[name="${flow.form}"]`);
      await form.scrollIntoViewIfNeeded();
      await page.screenshot({ path: join(evidence, `${flow.key}-initial.png`) });
      if (flow.form !== 'newsletter') {
        await form.getByLabel(/Nombre|Name/).fill('María García');
        await form.getByLabel(/Correo|Email/).fill('maria@example.com');
        await form.getByLabel(/Teléfono|Phone/).fill('(555) 000-1234');
        await form.locator('select[name="interest"]').selectOption(flow.interest);
        await form.getByLabel(/Mensaje|Message/).fill(flow.message);
        await form.getByLabel(/Acepto|I agree/).check();
      } else {
        await form.getByLabel(/Correo|Email/).fill('maria@example.com');
      }
      const submit = form.locator('button[type="submit"]');
      await submit.click();
      let sendingOk = false;
      try {
        await form.getByText(flow.sending, { exact: false }).waitFor({ timeout: 5000 });
        sendingOk = await submit.isDisabled();
      } catch {
        sendingOk = false;
      } finally {
        releasePost();
      }
      check(`${flow.key}: submitting state`, sendingOk);
      const successOk = await form.getByText(flow.success, { exact: false }).waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check(`${flow.key}: success message`, successOk);
      check(`${flow.key}: payload has form-name`, !!payload && payload.includes(`form-name=${flow.form}`), payload ?? 'no POST captured');
      if (flow.form !== 'newsletter') {
        const lang = flow.key.endsWith('-en') ? 'en' : 'es';
        check(`${flow.key}: payload fields`, !!payload && payload.includes('language=' + lang) && payload.includes('bot-field=') && payload.includes('consent=yes'));
        results.payloads[flow.key] = payload;
      }
      await form.screenshot({ path: join(evidence, `${flow.key}-success.png`) });
      await page.close();
    }

    // ---- 2. Network-error path: abort the POST, expect the error message ----
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.route('**/*', async (route) => {
        if (route.request().method() === 'POST') await route.abort('failed');
        else await route.continue();
      });
      await page.goto(`${base}/participar`, { waitUntil: 'domcontentloaded' });
      const form = page.locator('form[name="participate"]');
      await form.getByLabel(/Nombre/).fill('María García');
      await form.getByLabel(/Correo/).fill('maria@example.com');
      await form.locator('select[name="interest"]').selectOption('Vida diaria');
      await form.getByLabel(/Acepto/).check();
      await form.locator('button[type="submit"]').click();
      const errorOk = await form.getByText('No pudimos enviar el formulario', { exact: false }).waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('network-error: message shown', errorOk);
      await form.screenshot({ path: join(evidence, 'network-error.png') });
      await page.close();
    }

    // ---- 3. No-JS fallback: static form posts natively with all fields ----
    {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      let payload = null;
      await page.route('**/*', async (route) => {
        const req = route.request();
        if (req.method() === 'POST') {
          payload = req.postData();
          await route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok (local stand-in for Netlify)' });
        } else {
          await route.continue();
        }
      });
      await page.goto(`${base}/participar`, { waitUntil: 'domcontentloaded' });
      const form = page.locator('form[name="participate"][data-netlify="true"]');
      check('no-js: detectable form present', (await form.count()) === 1);
      await form.locator('input[name="name"]').fill('María García');
      await form.locator('input[name="email"]').fill('maria@example.com');
      await form.locator('select[name="interest"]').selectOption('Vida diaria');
      await form.locator('input[name="consent"]').check();
      await Promise.all([page.waitForURL('**/', { timeout: 10000 }).catch(() => null), form.locator('button[type="submit"]').click()]);
      check('no-js: native POST payload', !!payload && payload.includes('form-name=participate') && payload.includes('bot-field=') && payload.includes('language=es'), payload ?? 'no POST captured');
      results.payloads['no-js'] = payload;
      await page.close();
      await context.close();
    }

    // ---- 4. Responsiveness + performance observation (no thresholds) ----
    for (const [key, url] of [['home', '/'], ['participate', '/participar'], ['home-en', '/en']]) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
      let requests = 0;
      page.on('request', () => { requests += 1; });
      const started = Date.now();
      await page.goto(base + url, { waitUntil: 'networkidle' });
      results.timings[`mobile:${key}`] = Date.now() - started;
      results.viewports[`mobile:${key}`] = { requests };
      await page.screenshot({ path: join(evidence, `mobile-${key}.png`) });
      await page.close();
    }
    for (const [key, url] of [['home', '/'], ['participate', '/participar']]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.goto(base + url, { waitUntil: 'networkidle' });
      await page.screenshot({ path: join(evidence, `desktop-${key}.png`), fullPage: false });
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  writeFileSync(join(evidence, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`\n evidence: tmp/verify-forms/ (${Object.keys(results.timings).length} timings, ${Object.keys(results.payloads).length} payloads)`);
  if (failures.length > 0) {
    console.error(`verify:forms: ${failures.length} check(s) failed:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log('verify:forms: ok');
}

main().catch((error) => {
  console.error(`verify:forms: crashed: ${error.message}`);
  process.exit(1);
});

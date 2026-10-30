// Admin auth matrix against the prerendered dist/ with stubbed Identity.
// Serves dist/website/browser locally, seeds gotrue sessions via
// localStorage, and stubs /.netlify/identity/* — no Netlify backend needed.
//
// Usage: npm run verify:admin (add HEADED=1 to watch the browser).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env['PLAYWRIGHT_BROWSERS_PATH'] ||= join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.playwright-browsers');
const { chromium } = await import('playwright-core');

const website = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(website, 'dist', 'website', 'browser');
const evidence = join(website, '..', 'tmp', 'verify-admin');
mkdirSync(evidence, { recursive: true });

const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`  ${ok ? 'ok' : 'FAIL'} ${name}${ok && detail ? ` (${detail})` : ''}`);
  if (!ok) failures.push(`${name}: ${detail || 'check failed'}`);
};

const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const startServer = () => new Promise((resolve) => {
  const server = createServer(async (req, res) => {
    try {
      const path = new URL(req.url, 'http://x').pathname;
      let file = join(dist, path === '/' ? 'index.html' : decodeURIComponent(path));
      try {
        if (statSync(file).isDirectory()) file = join(file, 'index.html');
      } catch {
        file = `${file}.html`;
      }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    }
  });
  server.listen(0, '127.0.0.1', () => resolve(server));
});

const fakeJwt = () => {
  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${b64({ alg: 'HS256' })}.${b64({ exp: 9_999_999_999, email: 'admin@example.com' })}.stub-signature`;
};

const seedUser = (roles, name = 'Admin User') => ({
  url: '/.netlify/identity',
  audience: '',
  token: { access_token: fakeJwt(), expires_at: Date.now() + 3_600_000, expires_in: 3600, refresh_token: 'stub-refresh', token_type: 'bearer' },
  id: 'user-1',
  email: 'admin@example.com',
  app_metadata: { provider: 'email', roles },
  user_metadata: { full_name: name },
});

const tokenResponse = () => JSON.stringify({ access_token: fakeJwt(), token_type: 'bearer', expires_in: 3600, expires_at: Date.now() + 3_600_000, refresh_token: 'stub-refresh' });
const userResponse = (roles = ['admin']) => JSON.stringify({ id: 'user-1', email: 'admin@example.com', app_metadata: { provider: 'email', roles }, user_metadata: { full_name: 'Admin User' } });

async function main() {
  const server = await startServer();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: process.env['HEADED'] !== '1' });
  const pageErrors = [];
  try {
    // ---- 1. Logged-out guard ----
    {
      const page = await browser.newPage();
      page.on('pageerror', (error) => pageErrors.push(`logged-out: ${error.message}`));
      await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
      const redirected = await page.waitForURL('**/admin/acceso', { timeout: 15000 }).then(() => true).catch(() => false);
      check('logged-out /admin redirects to acceso', redirected, page.url());
      await page.goto(`${base}/admin/acceso`, { waitUntil: 'networkidle' });
      const heading = await page.locator('h1').first().textContent();
      const fields = await page.locator('#admin-email, #admin-password').count();
      check('acceso renders login form', (heading ?? '').includes('Acceso de administración') && fields === 2, heading ?? '(no h1)');
      await page.screenshot({ path: join(evidence, 'acceso.png') });
      await page.close();
    }

    // ---- 2. Deep link return target ----
    {
      const page = await browser.newPage();
      await page.goto(`${base}/admin/solicitudes`, { waitUntil: 'domcontentloaded' });
      const redirected = await page.waitForURL('**/admin/acceso?return=*', { timeout: 15000 }).then(() => true).catch(() => false);
      check('deep link preserves return target', redirected, page.url());
      await page.close();
    }

    // ---- 3. Login validation + failure ----
    {
      const page = await browser.newPage();
      await page.goto(`${base}/admin/acceso`, { waitUntil: 'networkidle' });
      await page.locator('button[type="submit"]').click();
      await page.locator('[role="alert"]').first().waitFor({ timeout: 5000 }).catch(() => {});
      const errors = await page.locator('[role="alert"]').count();
      check('empty login shows validation errors', errors >= 2, `${errors} alert(s)`);
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ msg: 'Invalid login credentials' }) }));
      await page.locator('#admin-email').fill('admin@example.com');
      await page.locator('#admin-password').fill('wrong-password');
      await page.locator('button[type="submit"]').click();
      const shown = await page.getByText('El correo o la contraseña no son correctos.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('failed login shows Spanish error', shown);
      await page.close();
    }

    // ---- 4. Successful login ----
    {
      const page = await browser.newPage();
      page.on('pageerror', (error) => pageErrors.push(`login: ${error.message}`));
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await page.route('**/.netlify/identity/user', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() }));
      await page.goto(`${base}/admin/acceso`, { waitUntil: 'networkidle' });
      await page.locator('#admin-email').fill('admin@example.com');
      await page.locator('#admin-password').fill('correct-password');
      await page.locator('button[type="submit"]').click();
      const landed = await page.waitForURL('**/admin', { timeout: 15000 }).then(() => true).catch(() => false);
      const userShown = landed ? await page.getByText('Admin User').first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false) : false;
      check('successful login lands on panel with user name', landed && userShown, page.url());
      await page.close();
    }

    // ---- 5. Seeded admin session ----
    {
      const context = await browser.newContext();
      await context.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const page = await context.newPage();
      page.on('pageerror', (error) => pageErrors.push(`seeded: ${error.message}`));
      await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
      const shell = await page.locator('app-admin-sidebar aside').waitFor({ timeout: 15000 }).then(() => true).catch(() => false);
      const userShown = await page.getByText('Admin User').first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('seeded admin sees shell + name', shell && userShown);
      await page.screenshot({ path: join(evidence, 'overview.png') });
      await page.goto(`${base}/admin/solicitudes`, { waitUntil: 'networkidle' });
      const inbox = await page.getByRole('heading', { name: 'Solicitudes' }).waitFor({ timeout: 15000 }).then(() => true).catch(() => false);
      check('seeded admin opens inbox', inbox);
      await page.goto(`${base}/admin/acceso`, { waitUntil: 'domcontentloaded' });
      const bounced = await page.waitForURL('**/admin', { timeout: 15000 }).then(() => true).catch(() => false);
      check('seeded admin bounces from acceso to panel', bounced, page.url());
      const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
      await mobile.goto(`${base}/admin`, { waitUntil: 'networkidle' });
      await mobile.screenshot({ path: join(evidence, 'overview-mobile.png') });
      await mobile.close();
      await page.close();
      await context.close();
    }

    // ---- 6. Seeded non-admin session ----
    {
      const context = await browser.newContext();
      await context.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser([], 'Regular User'));
      const page = await context.newPage();
      await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
      const denied = await page.waitForURL('**/admin/acceso?denied=1', { timeout: 15000 }).then(() => true).catch(() => false);
      const message = denied ? await page.getByText('Esta cuenta no tiene permisos de administración.').isVisible().catch(() => false) : false;
      check('non-admin is denied with message', denied && message, page.url());
      await page.close();
      await context.close();
    }

    // ---- 7. Inbox data, filters, error retry, auth header ----
    {
      const rows = [
        { id: 's1', form: 'participate', createdAt: new Date(Date.now() - 86_400_000).toISOString(), name: 'María García', email: 'maria@example.com', phone: '(555) 000-1234', interest: 'Vida diaria', message: 'Quiero practicar desde cero.', language: 'es' },
        { id: 's2', form: 'collaborate', createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(), name: 'Juan Pérez', email: 'juan@example.com', phone: null, interest: 'Talleres', message: 'Me gustaría colaborar como voluntario.', language: 'es' },
        { id: 's3', form: 'newsletter', createdAt: new Date(Date.now() - 8 * 86_400_000).toISOString(), name: null, email: 'news@example.com', phone: null, interest: null, message: null, language: 'en' },
      ];
      const context = await browser.newContext();
      await context.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const page = await context.newPage();
      page.on('pageerror', (error) => pageErrors.push(`inbox: ${error.message}`));
      let authHeader = null;
      await page.route('**/.netlify/functions/submissions', async (route) => {
        authHeader = await route.request().headerValue('authorization');
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ submissions: rows, truncated: false }) });
      });
      await page.goto(`${base}/admin/solicitudes`, { waitUntil: 'networkidle' });
      const maria = await page.getByText('María García').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      const juan = await page.getByText('juan@example.com').isVisible().catch(() => false);
      check('inbox renders submissions', maria && juan);
      check('inbox sends Bearer JWT', typeof authHeader === 'string' && authHeader.startsWith('Bearer '), (authHeader ?? '(none)').slice(0, 20));
      await page.getByRole('button', { name: /Boletín/ }).click();
      const filtered = await page.getByText('María García').waitFor({ state: 'detached', timeout: 5000 }).then(() => true).catch(() => false);
      const newsLeft = await page.getByText('news@example.com').isVisible().catch(() => false);
      check('inbox filter narrows to form', filtered && newsLeft);
      await page.getByRole('button', { name: /Todas/ }).click();
      const restored = await page.getByText('María García').waitFor({ timeout: 5000 }).then(() => true).catch(() => false);
      check('inbox filter resets', restored);
      await page.screenshot({ path: join(evidence, 'inbox-data.png') });
      await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
      const recent = await page.getByText('Juan Pérez').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      const total = await page.getByText('+1 esta semana').first().isVisible().catch(() => false);
      check('overview shows recent submissions + stats', recent && total);
      await page.screenshot({ path: join(evidence, 'overview-data.png') });
      await page.close();
      await context.close();
    }

    // ---- 8. Inbox error retry + 401 sign-out ----
    {
      const context = await browser.newContext();
      await context.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const page = await context.newPage();
      let calls = 0;
      await page.route('**/.netlify/functions/submissions', (route) => {
        calls += 1;
        if (calls === 1) return route.fulfill({ status: 500, contentType: 'text/plain', body: 'boom' });
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ submissions: [], truncated: false }) });
      });
      await page.goto(`${base}/admin/solicitudes`, { waitUntil: 'networkidle' });
      const errorShown = await page.getByText('No pudimos cargar las solicitudes.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('inbox shows error state', errorShown);
      await page.getByRole('button', { name: 'Reintentar' }).click();
      const emptyShown = await page.getByText('Aún no hay solicitudes.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('inbox retry recovers', emptyShown);
      await page.close();
      await context.close();

      const context2 = await browser.newContext();
      await context2.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const page2 = await context2.newPage();
      await page2.route('**/.netlify/functions/submissions', (route) => route.fulfill({ status: 401, contentType: 'text/plain', body: 'no' }));
      await page2.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
      const signedOut = await page2.waitForURL('**/admin/acceso', { timeout: 15000 }).then(() => true).catch(() => false);
      check('expired session bounces to acceso', signedOut, page2.url());
      await page2.close();
      await context2.close();
    }

    // ---- 9. Invite + recovery token modes ----
    {
      const page = await browser.newPage();
      await page.route('**/.netlify/identity/verify', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await page.route('**/.netlify/identity/user', (route) => {
        if (route.request().method() === 'PUT') return route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() });
        return route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() });
      });
      await page.goto(`${base}/admin/acceso#invite_token=abc123`, { waitUntil: 'networkidle' });
      const inviteHeading = await page.getByRole('heading', { name: 'Aceptar invitación' }).isVisible().catch(() => false);
      check('invite token opens invite mode', inviteHeading);
      await page.locator('#admin-new-password').fill('new-password-1');
      await page.locator('#admin-new-password-confirm').fill('new-password-1');
      await page.locator('button[type="submit"]').click();
      const activated = await page.waitForURL('**/admin', { timeout: 15000 }).then(() => true).catch(() => false);
      check('invite acceptance lands on panel', activated, page.url());
      await page.close();
      const fresh = await browser.newPage();
      await fresh.goto(`${base}/admin/acceso#recovery_token=xyz789`, { waitUntil: 'networkidle' });
      const recoveryHeading = await fresh.getByRole('heading', { name: 'Nueva contraseña' }).isVisible().catch(() => false);
      check('recovery token opens recovery mode', recoveryHeading);
      await fresh.close();
    }

    // ---- 8. Token links landing on public pages reroute ----
    {
      const page = await browser.newPage();
      await page.goto(`${base}/#invite_token=abc123`, { waitUntil: 'domcontentloaded' });
      const rerouted = await page.waitForURL('**/admin/acceso*', { timeout: 15000 }).then(() => true).catch(() => false);
      check('root invite link reroutes to acceso', rerouted, page.url());
      await page.close();
    }

    // ---- 9. No-JS acceso + public spot check ----
    {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(`${base}/admin/acceso`, { waitUntil: 'domcontentloaded' });
      const form = await page.locator('form').count();
      check('no-js acceso renders static form', form >= 1, `${form} form(s)`);
      await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
      const home = await page.locator('h1').first().textContent();
      check('public home unaffected', (home ?? '').length > 0, (home ?? '(none)').slice(0, 40));
      await page.close();
      await context.close();
    }

    check('no page errors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 300));
  } finally {
    await browser.close();
    server.close();
  }

  writeFileSync(join(evidence, 'results.json'), JSON.stringify({ failures }, null, 2));
  console.log(`\n evidence: tmp/verify-admin/`);
  if (failures.length > 0) {
    console.error(`verify:admin: ${failures.length} check(s) failed:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log('verify:admin: ok');
}

main().catch((error) => {
  console.error(`verify:admin: crashed: ${error.message}`);
  process.exit(1);
});

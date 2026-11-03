// Portal auth matrix against the prerendered dist/ with stubbed Identity.
// Serves dist/website/browser locally, seeds gotrue sessions via
// localStorage, and stubs /.netlify/identity/* — no Netlify backend needed.
//
// Usage: npm run verify:portal (add HEADED=1 to watch the browser).
import { createPortalFixture } from './portal-fixture.mjs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { readFile } from 'node:fs/promises';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env['PLAYWRIGHT_BROWSERS_PATH'] ||= join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.playwright-browsers');
const { chromium } = await import('playwright-core');

const website = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(website, 'dist', 'website', 'browser');
const evidence = join(tmpdir(), 'ia-para-todos-verify-portal');
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

const fakeJwt = (exp = 9_999_999_999) => {
  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${b64({ alg: 'HS256' })}.${b64({ exp, email: 'estudiante@example.com' })}.stub-signature`;
};

const seedUser = (roles, name = 'Estudiante Ejemplo', email = 'estudiante@example.com') => ({
  url: '/.netlify/identity',
  audience: '',
  token: { access_token: fakeJwt(), expires_at: Date.now() + 3_600_000, expires_in: 3600, refresh_token: 'stub-refresh', token_type: 'bearer' },
  id: 'user-1',
  email,
  app_metadata: { provider: 'email', roles },
  user_metadata: { full_name: name },
});

const tokenResponse = () => JSON.stringify({ access_token: fakeJwt(), token_type: 'bearer', expires_in: 3600, expires_at: Date.now() + 3_600_000, refresh_token: 'stub-refresh' });
const userResponse = (roles = [], name = 'Estudiante Ejemplo', email = 'estudiante@example.com') =>
  JSON.stringify({ id: 'user-1', email, app_metadata: { provider: 'email', roles }, user_metadata: { full_name: name } });

const atPath = (pathname) => (url) => new URL(url).pathname === pathname;

async function main() {
  const server = await startServer();
  const base = `http://127.0.0.1:${server.address().port}`;
  const reviewing = process.env['REVIEW_PORTAL'] === '1';
  const browser = await chromium.launch({ headless: !reviewing && process.env['HEADED'] !== '1' });
  if (reviewing) {
    const page = await browser.newPage();
    const fixture=createPortalFixture();
    await page.route('**/api/portal/**',async route=>{
      const userId=await page.evaluate(()=>JSON.parse(localStorage.getItem('gotrue.user')||'null')?.id);
      const result=fixture(new URL(route.request().url()).pathname.slice('/api/portal/'.length),route.request().method(),route.request().postDataJSON(),userId);
      await route.fulfill({status:result.status,contentType:'application/json',body:JSON.stringify(result.body)});
    });
    await page.route('**/.netlify/identity/**', (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith('/token') || path.endsWith('/verify')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() });
      }
      if (path.endsWith('/user') || path.endsWith('/signup')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    console.log(`Local review with fake Identity: ${base}/portal/sign-in`);
    console.log('Use estudiante@example.com and any password (8+ characters). No real accounts or emails.');
    console.log('Try signup, ES/EN, login, logout, and password recovery. Close the browser when finished.');
    const closed = new Promise((resolve) => browser.once('disconnected', resolve));
    await page.goto(`${base}/portal/sign-in`);
    await closed;
    server.close();
    return;
  }
  const contextFixtures = new WeakMap();
  async function stubPortal(page) {
    if (!contextFixtures.has(page.context())) contextFixtures.set(page.context(), createPortalFixture());
    const fixture = contextFixtures.get(page.context());
    await page.route('**/api/portal/**', async route => {
      try {
        const userId = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('gotrue.user'))?.id; } catch { return null; } });
        const path = new URL(route.request().url()).pathname.slice('/api/portal/'.length);
        const result = fixture(path, route.request().method(), route.request().postDataJSON(), userId);
        await route.fulfill({ status: result.status, contentType:'application/json', body:JSON.stringify(result.body) });
      } catch(error) {
        if(!page.isClosed()&&!error.message.includes('Execution context was destroyed')) pageErrors.push(`API fixture: ${error.message}`);
        await route.abort().catch(()=>{});
      }
    });
  }
  const pageErrors = [];
  const consoleErrors = [];
  async function preparePage(page) {
    await stubPortal(page);
    page.on('pageerror', error=>pageErrors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))consoleErrors.push(message.text());});
    return page;
  }
  const originalPage=browser.newPage.bind(browser);
  browser.newPage=async options=>preparePage(await originalPage(options));
  const originalContext=browser.newContext.bind(browser);
  browser.newContext=async options=>{
    const context=await originalContext(options);
    const original=context.newPage.bind(context);
    context.newPage=async()=>preparePage(await original());
    return context;
  };

  try {
    // ---- 1. Logged-out guard + static shells ----
    {
      const page = await browser.newPage();
      page.on('pageerror', (error) => pageErrors.push(`logged-out: ${error.message}`));
      await page.goto(`${base}/portal`, { waitUntil: 'domcontentloaded' });
      const redirected = await page.waitForURL(atPath('/portal/sign-in'), { timeout: 15000 }).then(() => true).catch(() => false);
      check('logged-out /portal redirects to sign-in', redirected, page.url());
      const heading = await page.locator('h1').first().textContent();
      const fields = await page.locator('#portal-email, #portal-password').count();
      check('sign-in renders login form', (heading ?? '').includes('Iniciar sesión') && fields === 2, heading ?? '(no h1)');
      const themeLinks = await page.locator('head link#admin-theme').count();
      const chrome = await page.locator('app-site-header, app-site-footer').count();
      check('portal uses shared TailAdmin styles without public chrome', themeLinks === 1 && chrome === 0, `${themeLinks} theme link(s), ${chrome} chrome node(s)`);
      await page.screenshot({ path: join(evidence, 'sign-in-desktop.png') });
      await page.goto(`${base}/portal/sign-up`, { waitUntil: 'networkidle' });
      const upHeading = await page.locator('h1').first().textContent();
      const upFields = await page.locator('#portal-signup-name, #portal-signup-email, #portal-signup-password').count();
      check('sign-up renders registration form', (upHeading ?? '').includes('Crear cuenta') && upFields === 3, upHeading ?? '(no h1)');
      await page.screenshot({ path: join(evidence, 'sign-in.png') });
      await page.close();
    }

    // ---- 2. Return plumbing ----
    {
      const page = await browser.newPage();
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await page.route('**/.netlify/identity/user', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() }));
      await page.goto(`${base}/portal/sign-in?return=/portal`, { waitUntil: 'networkidle' });
      await page.locator('#portal-email').fill('estudiante@example.com');
      await page.locator('#portal-password').fill('correct-password');
      await page.locator('button[type="submit"]').click();
      const landed = await page.waitForURL(atPath('/portal'), { timeout: 15000 }).then(() => true).catch(() => false);
      check('login honors return target', landed, page.url());
      await page.close();
    }

    // ---- 3. Login validation + failure ----
    {
      const page = await browser.newPage();
      await page.goto(`${base}/portal/sign-in`, { waitUntil: 'networkidle' });
      await page.locator('button[type="submit"]').click();
      await page.locator('[role="alert"]').first().waitFor({ timeout: 5000 }).catch(() => {});
      const errors = await page.locator('[role="alert"]').count();
      check('empty login shows validation errors', errors >= 2, `${errors} alert(s)`);
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ msg: 'Invalid login credentials' }) }));
      await page.locator('#portal-email').fill('estudiante@example.com');
      await page.locator('#portal-password').fill('wrong-password');
      await page.locator('button[type="submit"]').click();
      const shown = await page.getByText('Correo o contraseña incorrectos.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('failed login shows Spanish error', shown);
      await page.close();
    }

    // ---- 4. Successful login ----
    {
      const page = await browser.newPage();
      page.on('pageerror', (error) => pageErrors.push(`login: ${error.message}`));
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await page.route('**/.netlify/identity/user', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() }));
      await page.goto(`${base}/portal/sign-in`, { waitUntil: 'networkidle' });
      await page.locator('#portal-email').fill('estudiante@example.com');
      await page.locator('#portal-password').fill('correct-password');
      await page.locator('button[type="submit"]').click();
      const landed = await page.waitForURL(atPath('/portal'), { timeout: 15000 }).then(() => true).catch(() => false);
      const userShown = landed ? await page.getByText('Estudiante Ejemplo').first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false) : false;
      check('successful login lands on portal with user name', landed && userShown, page.url());
      await page.screenshot({ path: join(evidence, 'home.png') });
      await page.close();
    }

    // ---- 5. Seeded student session + sign-out ----
    {
      const context = await browser.newContext();
      await context.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser([]));
      const page = await context.newPage();
      page.on('pageerror', (error) => pageErrors.push(`seeded: ${error.message}`));
      await page.goto(`${base}/portal`, { waitUntil: 'networkidle' });
      const greeting = await page.getByText('Estudiante Ejemplo').first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('seeded student sees greeting', greeting);
      await page.goto(`${base}/portal/sign-in`, { waitUntil: 'domcontentloaded' });
      const bounced = await page.waitForURL(atPath('/portal'), { timeout: 15000 }).then(() => true).catch(() => false);
      check('seeded student bounces from sign-in to portal', bounced, page.url());
      await page.goto(`${base}/portal/sign-up`, { waitUntil: 'domcontentloaded' });
      const bouncedUp = await page.waitForURL(atPath('/portal'), { timeout: 15000 }).then(() => true).catch(() => false);
      check('seeded student bounces from sign-up to portal', bouncedUp, page.url());
      await page.goto(`${base}/portal`, { waitUntil: 'networkidle' });
      await page.locator('.account-menu summary').click();
      await page.locator('button.signout').click();
      const signedOut = await page.waitForURL(atPath('/portal/sign-in'), { timeout: 15000 }).then(() => true).catch(() => false);
      const loginBack = signedOut ? await page.locator('#portal-email').waitFor({ timeout: 10000 }).then(() => true).catch(() => false) : false;
      check('sign-out returns to login form', signedOut && loginBack, page.url());
      await page.close();
      await context.close();
    }

    // ---- 6. Seeded admin session may also use the portal ----
    {
      const context = await browser.newContext();
      await context.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin'], 'Admin User', 'admin@example.com'));
      const page = await context.newPage();
      await page.goto(`${base}/portal`, { waitUntil: 'networkidle' });
      const greeting = await page.getByText('Admin User').first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('admin role is allowed in portal', greeting);
      await page.close();
      await context.close();
    }

    // ---- 7. Signup + duplicate ----
    {
      const page = await browser.newPage();
      await page.route('**/.netlify/identity/signup', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: userResponse([], 'Estudiante Nuevo', 'nuevo@example.com') }));
      await page.goto(`${base}/portal/sign-up`, { waitUntil: 'networkidle' });
      await page.locator('#portal-signup-name').fill('Estudiante Nuevo');
      await page.locator('#portal-signup-email').fill('nuevo@example.com');
      await page.locator('#portal-signup-password').fill('new-password-1');
      await page.locator('#portal-signup-adult').check();
      await page.locator('button[type="submit"]').click();
      const sent = await page.getByRole('heading', { name: 'Confirma tu correo' }).waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      const echoed = await page.getByText('nuevo@example.com').isVisible().catch(() => false);
      check('signup shows confirm-email state', sent && echoed);
      await page.close();

      const dupe = await browser.newPage();
      await dupe.route('**/.netlify/identity/signup', (route) => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ msg: 'User already registered' }) }));
      await dupe.goto(`${base}/portal/sign-up`, { waitUntil: 'networkidle' });
      await dupe.locator('#portal-signup-name').fill('Alguien');
      await dupe.locator('#portal-signup-email').fill('alguien@example.com');
      await dupe.locator('#portal-signup-password').fill('new-password-1');
      await dupe.locator('#portal-signup-adult').check();
      await dupe.locator('button[type="submit"]').click();
      const exists = await dupe.getByText('Esa cuenta ya existe.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('duplicate signup shows exists message', exists);
      await dupe.close();
    }

    // ---- 8. Recovery request ----
    {
      const page = await browser.newPage();
      await page.route('**/.netlify/identity/recover', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
      await page.goto(`${base}/portal/sign-in`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: '¿Olvidaste tu contraseña?' }).click();
      await page.locator('#portal-recovery-email').fill('estudiante@example.com');
      await page.locator('button[type="submit"]').click();
      const sent = await page.getByRole('heading', { name: 'Revisa tu correo' }).waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('recovery request shows sent state', sent);
      await page.close();
    }

    // ---- 9. Recovery + confirmation token modes ----
    {
      const page = await browser.newPage();
      page.on('pageerror', (error) => pageErrors.push(`tokens: ${error.message}`));
      await page.route('**/.netlify/identity/verify', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await page.route('**/.netlify/identity/user', (route) => {
        if (route.request().method() === 'PUT') return route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() });
        return route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() });
      });
      await page.goto(`${base}/portal/sign-in#recovery_token=xyz789`, { waitUntil: 'networkidle' });
      const recoveryHeading = await page.getByRole('heading', { name: 'Nueva contraseña' }).isVisible().catch(() => false);
      check('recovery token opens recovery mode', recoveryHeading);
      check('recovery token removed from address bar', !page.url().includes('xyz789'));
      await page.locator('#portal-new-password').fill('new-password-1');
      await page.locator('#portal-new-password-confirm').fill('new-password-1');
      await page.locator('button[type="submit"]').click();
      const landed = await page.waitForURL(atPath('/portal'), { timeout: 15000 }).then(() => true).catch(() => false);
      check('recovery completion lands on portal', landed, page.url());
      await page.close();

      const confirm = await browser.newPage();
      await confirm.route('**/.netlify/identity/verify', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await confirm.route('**/.netlify/identity/user', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() }));
      await confirm.goto(`${base}/portal/sign-in#confirmation_token=abc123`, { waitUntil: 'networkidle' });
      const confirmed = await confirm.waitForURL(atPath('/portal'), { timeout: 15000 }).then(() => true).catch(() => false);
      check('confirmation token auto-signs into portal', confirmed, confirm.url());
      await confirm.close();

      const broken = await browser.newPage();
      await broken.route('**/.netlify/identity/verify', (route) => route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ msg: 'Token not found' }) }));
      await broken.goto(`${base}/portal/sign-in#confirmation_token=stale`, { waitUntil: 'networkidle' });
      const failed = await broken.getByRole('heading', { name: 'Ese enlace ya no funciona' }).waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('stale token shows expired state', failed);
      check('failed token removed from address bar', !broken.url().includes('stale'));
      await broken.close();
    }

    // ---- 10. Token links landing on public pages reroute by kind ----
    {
      const page = await browser.newPage();
      await page.goto(`${base}/#recovery_token=abc123`, { waitUntil: 'domcontentloaded' });
      const toPortal = await page.waitForURL(atPath('/portal/sign-in'), { timeout: 15000 }).then(() => true).catch(() => false);
      check('root recovery link reroutes to portal sign-in', toPortal, page.url());
      await page.goto(`${base}/#confirmation_token=abc123`, { waitUntil: 'domcontentloaded' });
      const confirmToPortal = await page.waitForURL(atPath('/portal/sign-in'), { timeout: 15000 }).then(() => true).catch(() => false);
      check('root confirmation link reroutes to portal sign-in', confirmToPortal, page.url());
      await page.goto(`${base}/#invite_token=abc123`, { waitUntil: 'domcontentloaded' });
      const toAdmin = await page.waitForURL(atPath('/admin/sign-in'), { timeout: 15000 }).then(() => true).catch(() => false);
      check('root invite link still reroutes to admin sign-in', toAdmin, page.url());
      await page.close();
    }

    // ---- 11. ES/EN toggle ----
    {
      const page = await browser.newPage();
      await page.goto(`${base}/portal/sign-in`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      const english = await page.getByRole('heading', { name: 'Sign in' }).waitFor({ timeout: 5000 }).then(() => true).catch(() => false);
      check('EN toggle switches copy', english);
      await page.getByRole('button', { name: 'ES', exact: true }).click();
      const spanish = await page.getByRole('heading', { name: 'Iniciar sesión' }).waitFor({ timeout: 5000 }).then(() => true).catch(() => false);
      check('ES toggle switches back', spanish);
      await page.close();
    }

    // ---- 12. No-JS sign-in + public spot check ----
    {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(`${base}/portal/sign-in`, { waitUntil: 'domcontentloaded' });
      const form = await page.locator('form').count();
      check('no-js sign-in renders static form', form >= 1, `${form} form(s)`);
      const themeLink = await page.locator('head link#admin-theme').count();
      check('no-js portal ships dashboard CSS', themeLink === 1, `${themeLink} link(s)`);
      await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
      const home = await page.locator('h1').first().textContent();
      check('public home unaffected', (home ?? '').length > 0, (home ?? '(none)').slice(0, 40));
      await page.close();
      await context.close();
    }

    // ---- 13. Sign-in loads without a public-chrome flash ----
    {
      const page = await browser.newPage();
      page.on('pageerror', (error) => pageErrors.push(`signin-flash: ${error.message}`));
      await page.route('**/*.{woff2,js,css}', async (route) => {
        await new Promise((r) => setTimeout(r, 400));
        return route.continue();
      });
      await page.goto(`${base}/portal/sign-in`, { waitUntil: 'domcontentloaded' });
      const seen = new Set();
      for (let i = 0; i < 40; i++) {
        const found = await page.evaluate(() => ['app-site-header', 'app-site-footer'].filter((s) => document.querySelector(s)));
        for (const tag of found) seen.add(tag);
        if (seen.size === 0) await page.waitForTimeout(100);
        else break;
      }
      check('portal sign-in never renders public chrome during load', seen.size === 0, [...seen].join(',') || 'clean');
      await page.goto(`${base}/portal/sign-in`, { waitUntil: 'networkidle' });
      const heading = await page.locator('h1').first().textContent();
      check('throttled sign-in still settles on login form', (heading ?? '').includes('Iniciar sesión'), heading ?? '(no h1)');
      await page.close();
    }

    {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await page.addInitScript((seed) => {
        if (!sessionStorage.getItem('seeded')) {
          localStorage.setItem('gotrue.user', JSON.stringify(seed));
          sessionStorage.setItem('seeded', '1');
        }
      }, seedUser(['admin'], 'Admin User', 'admin@example.com'));
      let verified = false;
      await page.route('**/.netlify/identity/verify', (route) => { verified = true; return route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }); });
      await page.route('**/.netlify/identity/user', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: userResponse(['admin'], 'Admin User', 'admin@example.com') }));
      await page.route('**/.netlify/identity/logout', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
      await page.route('**/api/admin/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"submissions":[]}' }));
      await page.goto(`${base}/portal/sign-in#confirmation_token=admin-confirm`, { waitUntil: 'networkidle' });
      await page.waitForURL(atPath('/admin'));
      check('signed-in admin confirmation is consumed and lands on admin', verified && !page.url().includes('admin-confirm'));
      await page.getByRole('button', { name: 'Account menu', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click();
      await page.waitForURL(atPath('/admin/sign-in'));
      await page.evaluate(() => { history.pushState({}, '', '/portal'); dispatchEvent(new PopStateEvent('popstate')); });
      await page.waitForURL(atPath('/portal/sign-in'));
      check('admin logout also invalidates portal session', await page.locator('#portal-email').isVisible());
      await page.close();
    }

    // Security and responsive regressions for the shared Identity session.
    {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(`${base}/portal/sign-in`, { waitUntil: 'networkidle' });
      check('mobile page identity', (await page.title()).includes('Iniciar sesión') && await page.locator('h1').isVisible());
      check('mobile form fits viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await page.getByRole('link', { name: 'No account? Create one here.' }).click();
      check('English persists across auth navigation', await page.getByRole('heading', { name: 'Create account' }).waitFor().then(() => true).catch(() => false));
      await page.screenshot({ path: join(evidence, 'sign-up-mobile.png') });
      await page.close();
    }
    for (const target of ['/portal-evil', '//example.com', '/portal/sign-in', '/portal/sign-up', '/portal/../admin']) {
      const page = await browser.newPage();
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await page.route('**/.netlify/identity/user', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() }));
      await page.goto(`${base}/portal/sign-in?return=${encodeURIComponent(target)}`, { waitUntil: 'networkidle' });
      await page.locator('#portal-email').fill('estudiante@example.com');
      await page.locator('#portal-password').fill('correct-password');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(atPath('/portal'));
      check(`unsafe return rejected: ${target}`, new URL(page.url()).pathname === '/portal');
      await page.close();
    }
    {
      const context = await browser.newContext();
      await context.addInitScript((seed) => {
        if (!sessionStorage.getItem('seeded')) {
          localStorage.setItem('gotrue.user', JSON.stringify(seed));
          sessionStorage.setItem('seeded', '1');
        }
      }, seedUser(['admin'], 'Admin User', 'admin@example.com'));
      const page = await context.newPage();
      await page.route('**/api/admin/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"submissions":[]}' }));
      await page.route('**/.netlify/identity/logout', (route) => route.fulfill({ status: 204 }));
      await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
      // Client-side navigation keeps both services alive, exposing stale caches.
      // Use the public Angular link from admin's brand menu when possible; a
      // history event triggers the router without reloading the document.
      await page.evaluate(() => { history.pushState({}, '', '/portal'); dispatchEvent(new PopStateEvent('popstate')); });
      await page.locator('.account-menu summary').waitFor();
      check('admin can navigate to portal in same app', await page.getByText('Admin User').first().isVisible());
      await page.locator('.account-menu summary').click();
      await page.locator('button.signout').click();
      await page.waitForURL(atPath('/portal/sign-in'));
      await page.evaluate(() => { history.pushState({}, '', '/admin'); dispatchEvent(new PopStateEvent('popstate')); });
      await page.waitForURL(atPath('/admin/sign-in'));
      check('portal logout also invalidates admin session', new URL(page.url()).pathname === '/admin/sign-in');
      await context.close();
    }
    {
      const page = await browser.newPage();
      const expired = seedUser([]);
      expired.token.expires_at = 1;
      expired.token.access_token = fakeJwt(1);
      await page.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), expired);
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{"msg":"Refresh expired"}' }));
      await page.goto(`${base}/portal`, { waitUntil: 'networkidle' });
      await page.waitForURL(atPath('/portal/sign-in'));
      check('expired saved session denied when refresh fails', await page.locator('#portal-email').isVisible());
      await page.close();
    }

    // Courses: real rendered interactions, reload, translations, and user isolation.
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      await context.addInitScript((seed) => {
        if (!sessionStorage.getItem('seeded')) {
          localStorage.setItem('gotrue.user', JSON.stringify(seed));
          sessionStorage.setItem('seeded', '1');
        }
      }, seedUser([]));
      const page = await context.newPage();
      const course = '/portal/courses/first-prompt';
      const lesson = (id) => `${course}/lessons/${id}`;
      await page.goto(`${base}/portal/courses`, { waitUntil: 'networkidle' });
      await page.getByRole('link', { name: 'Ver el curso', exact: true }).click();
      await page.getByRole('button', { name: 'Inscribirme gratis', exact: true }).click();
      await page.getByTestId('course-progress').getByText('0 de 3 lecciones completadas').waitFor();
      check('course enrollment starts with zero completed lessons', await page.getByRole('link', { name: 'Continuar aprendiendo', exact: true }).isVisible());
      await page.getByRole('link', { name: 'Continuar aprendiendo', exact: true }).click();
      await page.getByRole('heading', { name: 'Escribe una instrucción clara', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Marcar como completada', exact: true }).click();
      await page.getByTestId('course-progress').getByText('1 de 3 lecciones completadas').waitFor();
      await page.getByRole('button', { name: 'Completada', exact: true }).waitFor();
      check('completion is explicit and cannot be submitted twice', !await page.getByRole('button', { name: 'Completada', exact: true }).isEnabled());
      await page.getByRole('link', { name: 'Siguiente lección', exact: false }).click();
      await page.getByRole('heading', { name: 'Mejora la respuesta', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Marcar como completada', exact: true }).click();
      await page.getByTestId('course-progress').getByText('2 de 3 lecciones completadas').waitFor();
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByTestId('course-progress').getByText('2 de 3 lecciones completadas').waitFor();
      check('two lesson completions survive reload', true);
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await page.getByRole('heading', { name: 'Improve the response', exact: true }).waitFor();
      check('English uses the same progress and lesson IDs', (await page.getByTestId('course-progress').innerText()).includes('2 of 3'));
      await page.goto(`${base}${course}`, { waitUntil: 'networkidle' });
      await page.getByRole('link', { name: 'Continue learning', exact: true }).click();
      await page.waitForURL(atPath(lesson('verify-and-protect')));
      check('continue resumes the unfinished lesson', true);
      await page.getByRole('button', { name: 'Mark as completed', exact: true }).click();
      await page.getByText('Course complete. Keep practicing!', { exact: true }).waitFor();
      check('all three lessons finish the course', (await page.getByTestId('course-progress').innerText()).includes('3 of 3'));
      await page.goto(`${base}${course}`, { waitUntil: 'networkidle' });
      check('course action label keeps its contrasting button color', await page.getByRole('link', { name: 'Review the course', exact: true }).evaluate(element => getComputedStyle(element).color !== getComputedStyle(element).backgroundColor));
      await page.screenshot({ path: join(evidence, 'course-desktop.png'), fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      check('course fits mobile viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: join(evidence, 'course-mobile.png'), fullPage: true });
      await page.route('**/.netlify/identity/logout', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
      await page.locator('.account-menu summary').click();
      await page.locator('button.signout').click();
      await page.waitForURL(atPath('/portal/sign-in'));
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await page.route('**/.netlify/identity/user', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...JSON.parse(userResponse([], 'Second Student', 'second@example.com')), id: 'user-2' }) }));
      await page.locator('#portal-email').fill('second@example.com');
      await page.locator('#portal-password').fill('correct-password');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(atPath('/portal'));
      await page.goto(`${base}${lesson('verify-and-protect')}`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Enroll for free', exact: true }).waitFor();
      check('another account has no enrollment or inherited completion', await page.getByTestId('course-progress').count() === 0);
      await page.getByRole('button', { name: 'Enroll for free', exact: true }).click();
      await page.getByRole('button', { name: 'Mark as completed', exact: true }).click();
      await page.getByTestId('course-progress').getByText('1 of 3 lessons completed').waitFor();
      check('lessons can be completed out of order', true);
      await context.close();
    }
    for (const failureMode of ['write', 'read']) {
      const page = await browser.newPage();
      await page.addInitScript(seed=>localStorage.setItem('gotrue.user',JSON.stringify(seed)),seedUser([]));
      await page.route('**/api/portal/progress',async route=>{
        if(failureMode==='read'||route.request().method()==='POST')return route.fulfill({status:503,contentType:'application/json',body:'{"reason":"portal_unavailable"}'});
        return route.fulfill({status:200,contentType:'application/json',body:'{"enrolled":false,"completed":[]}'});
      });
      await page.goto(`${base}/portal/courses/first-prompt`,{waitUntil:'networkidle'});
      if(failureMode==='write')await page.getByRole('button',{name:'Inscribirme gratis',exact:true}).click();
      await page.getByRole('alert').waitFor();
      check(`server progress ${failureMode} failure never claims a save`,await page.getByTestId('course-progress').count()===0);
      await page.close();
    }
    {
      const page = await browser.newPage();
      const destination = '/portal/courses/first-prompt/lessons/clear-request';
      await page.goto(`${base}${destination}`, { waitUntil: 'networkidle' });
      await page.waitForURL(url => url.pathname === '/portal/sign-in' && url.searchParams.get('return') === destination);
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await page.route('**/.netlify/identity/user', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() }));
      await page.locator('#portal-email').fill('estudiante@example.com');
      await page.locator('#portal-password').fill('correct-password');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(atPath(destination));
      check('direct lesson link returns to lesson after login', true);
      await page.close();
    }

    {
      const page=await browser.newPage({viewport:{width:1280,height:900}});
      await page.addInitScript(seed=>localStorage.setItem('gotrue.user',JSON.stringify(seed)),seedUser([]));
      await page.goto(`${base}/portal/chats`,{waitUntil:'networkidle'});
      await page.getByRole('button',{name:'Nueva conversación',exact:true}).click();
      check('no sample notice before first response',await page.getByText('Modo de ejemplo: las respuestas de ejemplo no son respuestas de una IA en vivo.',{exact:true}).count()===0);
      const liveRequest=page.waitForRequest(request=>request.url().includes('/messages') && request.method()==='POST');
      const prompts=['First fictional prompt','Second fictional prompt','Third fictional prompt'];
      for(const text of prompts){
        await page.locator('#portal-prompt').fill(text);
        await page.getByRole('button',{name:'Enviar',exact:true}).click();
        await page.getByRole('log').getByText(text,{exact:true}).waitFor();
      }
      const sentBody=(await liveRequest).postDataJSON();
      check('practice requests live AI with account consent by default',sentBody.live===true && sentBody.acknowledged===true);
      check('saved chat renders three prompts and labeled sample replies',await page.getByRole('log').locator('article').count()===6);
      await page.getByRole('button',{name:'Nueva conversación',exact:true}).click();
      await page.getByRole('heading',{name:'Nueva conversación',exact:true}).waitFor();
      await page.locator('#portal-prompt').fill('A second conversation');
      await page.getByRole('button',{name:'Enviar',exact:true}).click();
      await page.getByRole('log').getByText('A second conversation',{exact:true}).waitFor();
      await page.getByRole('button',{name:'First fictional prompt',exact:true}).click();
      await page.getByRole('log').getByText('Third fictional prompt',{exact:true}).waitFor();
      check('chat selection restores the complete history',await page.getByRole('log').locator('article').count()===6);
      await page.getByRole('button',{name:'A second conversation',exact:true}).click();
      await page.getByRole('button',{name:'Eliminar conversación',exact:true}).click();
      await page.getByRole('button',{name:'Sí, eliminar',exact:true}).click();
      await page.reload({waitUntil:'networkidle'});
      await page.getByRole('button',{name:'First fictional prompt',exact:true}).waitFor();
      check('chat deletion survives reload while the other history remains',await page.getByRole('button',{name:'A second conversation',exact:true}).count()===0);
      await page.getByRole('button',{name:'First fictional prompt',exact:true}).click();
      await page.locator('.conversation .disclosure').waitFor();
      check('practice shows contributor disclosure without repeated consent controls',(await page.locator('.conversation .disclosure').innerText()).includes('Meta') && await page.locator('.conversation').getByRole('checkbox').count()===0);
      await page.locator('#portal-prompt').fill('<img src=x onerror=alert(1)>');
      await page.getByRole('button',{name:'Enviar',exact:true}).click();
      await page.getByRole('log').getByText('<img src=x onerror=alert(1)>',{exact:true}).waitFor();
      check('chat content is rendered as text without executing markup',await page.getByRole('log').locator('img').count()===0);
      await page.screenshot({path:join(evidence,'saved-chats-desktop.png'),fullPage:true});
      await page.setViewportSize({width:390,height:844});
      check('saved chat layout fits mobile',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:join(evidence,'saved-chats-mobile.png'),fullPage:true});
      await page.close();
    }
    {
      const page=await browser.newPage();
      await page.addInitScript(seed=>localStorage.setItem('gotrue.user',JSON.stringify(seed)),seedUser([]));
      let blocked=true;
      await page.route('**/api/portal/profile',route=>route.fulfill({status:blocked?403:200,contentType:'application/json',body:JSON.stringify(blocked?{reason:'email_confirmation_required'}:{consented:false,privacyVersion:'2026-11-03'})}));
      await page.goto(`${base}/portal`,{waitUntil:'networkidle'});
      await page.getByRole('alert').filter({hasText:'Confirma tu correo'}).waitFor();
      await page.getByRole('button',{name:'EN',exact:true}).click();
      await page.getByRole('alert').filter({hasText:'Confirm your email'}).waitFor();
      check('email confirmation errors give bilingual recovery guidance',true);
      blocked=false;
      await page.getByRole('button',{name:'Try again',exact:true}).click();
      await page.getByRole('checkbox').waitFor();
      check('retry recovers from confirmation failure to adult consent',true);
      await page.close();
    }
    {
      const page=await browser.newPage();
      await page.addInitScript(seed=>localStorage.setItem('gotrue.user',JSON.stringify(seed)),seedUser([]));
      let consented=false;
      await page.route('**/api/portal/profile',route=>{
        if(route.request().method()==='POST')consented=route.request().postDataJSON().adult===true;
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({consented,privacyVersion:'2026-11-03'})});
      });
      await page.goto(`${base}/portal`,{waitUntil:'networkidle'});
      await page.getByRole('heading',{name:'Antes de comenzar',exact:true}).waitFor();
      check('adult/privacy consent blocks portal data until accepted',!await page.getByRole('button',{name:'Continuar',exact:true}).isEnabled());
      await page.getByRole('checkbox').check();
      await page.getByRole('button',{name:'Continuar',exact:true}).click();
      await page.getByRole('heading',{name:'Portal del estudiante',exact:true}).waitFor();
      check('acceptance unlocks the portal',consented);
      await page.close();
    }

    {
      const page=await browser.newPage();
      await page.addInitScript(seed=>localStorage.setItem('gotrue.user',JSON.stringify(seed)),seedUser([]));
      let deletionRequested=false;
      await page.route('**/api/portal/profile',route=>route.fulfill({status:200,contentType:'application/json',body:'{"consented":false,"privacyVersion":"2026-11-03"}'}));
      await page.route('**/api/portal/account',route=>{deletionRequested=true;return route.fulfill({status:202,contentType:'application/json',body:'{"deleting":true}'});});
      await page.route('**/.netlify/identity/logout',route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
      await page.goto(`${base}/portal/account`,{waitUntil:'networkidle'});
      await page.getByRole('button',{name:'Eliminar mi cuenta',exact:true}).click();
      await page.getByRole('button',{name:'Eliminar mi cuenta definitivamente',exact:true}).waitFor();
      check('account deletion remains available without accepting adult consent and asks twice',!deletionRequested);
      await page.getByRole('button',{name:'Eliminar mi cuenta definitivamente',exact:true}).click();
      await page.waitForURL(atPath('/portal/sign-in'));
      check('account deletion request clears the browser session',deletionRequested);
      await page.close();
    }

    for (const saved of ['{invalid', JSON.stringify({ url: '/.netlify/identity', token: {} }), JSON.stringify({ ...seedUser([]), email: null })]) {
      const page = await browser.newPage();
      await page.addInitScript((value) => localStorage.setItem('gotrue.user', value), saved);
      await page.goto(`${base}/portal`, { waitUntil: 'networkidle' });
      await page.waitForURL(atPath('/portal/sign-in'));
      check('malformed saved login recovers to usable sign-in', await page.locator('#portal-email').isVisible());
      await page.close();
    }

    // TailAdmin overview uses real API states and independent recovery.
    {
      const page = await browser.newPage({viewport:{width:1440,height:1000}});
      await page.addInitScript(seed=>localStorage.setItem('gotrue.user',JSON.stringify(seed)),seedUser([]));
      let progress={enrolled:false,completed:[]};
      let broken=false;
      await page.route('**/api/portal/progress',route=>route.fulfill({status:broken?503:200,contentType:'application/json',body:JSON.stringify(broken?{reason:'unavailable'}:progress)}));
      await page.goto(`${base}/portal`,{waitUntil:'networkidle'});
      check('sidebar excludes hidden mobile links from keyboard navigation',await page.locator('.sidebar').getAttribute('inert')===null);
      check('overview new student explores course',await page.getByRole('link',{name:'Explorar el curso',exact:true}).getAttribute('href')==='/portal/courses/first-prompt');
      progress={enrolled:true,completed:['clear-request']};
      await page.reload({waitUntil:'networkidle'});
      check('overview resumes first incomplete lesson',await page.getByRole('link',{name:'Continuar aprendiendo',exact:true}).getAttribute('href')==='/portal/courses/first-prompt/lessons/refine-response');
      await page.screenshot({path:join(evidence,'overview-desktop.png'),fullPage:true});
      progress.completed=['clear-request','refine-response','verify-and-protect'];
      await page.reload({waitUntil:'networkidle'});
      check('overview completed course offers review',await page.getByRole('link',{name:'Repasar el curso',exact:true}).isVisible());
      broken=true;
      await page.reload({waitUntil:'networkidle'});
      check('overview progress failure keeps practice available',await page.getByRole('alert').isVisible() && await page.getByText('Todavía no tienes conversaciones.',{exact:false}).isVisible());
      broken=false;
      await page.getByRole('button',{name:'Reintentar',exact:true}).click();
      await page.getByRole('link',{name:'Repasar el curso',exact:true}).waitFor();
      check('overview retry restores progress',await page.getByRole('alert').count()===0);
      await page.locator('.sidebar').getByRole('link',{name:'Práctica',exact:true}).click();
      await page.getByRole('button',{name:'Nueva conversación',exact:true}).click();
      await page.locator('#portal-prompt').waitFor();
      await page.locator('.sidebar').getByRole('link',{name:'Resumen',exact:true}).click();
      await page.locator('.overview-list a').waitFor();
      await page.locator('.overview-list a').click();
      await page.locator('#portal-prompt').waitFor();
      check('recent practice opens the saved conversation',new URL(page.url()).searchParams.has('chat'));
      await page.goto(`${base}/portal`,{waitUntil:'networkidle'});
      const failChats=route=>route.fulfill({status:503,contentType:'application/json',body:'{"reason":"unavailable"}'});
      await page.route('**/api/portal/chats',failChats);
      await page.reload({waitUntil:'networkidle'});
      check('chat failure keeps learning overview available',await page.getByRole('alert').isVisible() && await page.getByRole('link',{name:'Repasar el curso',exact:true}).isVisible());
      await page.unroute('**/api/portal/chats',failChats);
      await page.getByRole('button',{name:'Reintentar',exact:true}).click();
      await page.locator('.overview-list a').waitFor();
      check('practice retry restores saved conversation',await page.getByRole('alert').count()===0);
      await page.setViewportSize({width:390,height:844});
      await page.getByRole('button',{name:'Menú de navegación',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('.sidebar').getBoundingClientRect().left===0);
      check('mobile navigation opens',await page.locator('.sidebar').evaluate(el=>el.getBoundingClientRect().left===0));
      await page.locator('.sidebar').getByRole('link',{name:'Mis cursos',exact:true}).click();
      await page.waitForURL(atPath('/portal/courses'));
      check('mobile navigation closes after selection',await page.locator('.mobile-toggle').getAttribute('aria-expanded')==='false');
      await page.goto(`${base}/portal`,{waitUntil:'networkidle'});
      check('mobile overview fits',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:join(evidence,'overview-mobile.png'),fullPage:true});
      await page.locator('.portal-header .lang').getByRole('button',{name:'EN',exact:true}).click();
      await page.getByRole('heading',{name:'Your learning',exact:true}).waitFor();
      check('overview English translation',await page.getByRole('heading',{name:'Your learning',exact:true}).isVisible());
      await page.getByRole('button',{name:'Navigation menu',exact:true}).click();
      await page.keyboard.press('Escape');
      check('Escape returns focus to mobile menu',await page.locator('.mobile-toggle').evaluate(el=>el===document.activeElement));
      await page.getByRole('button',{name:'Navigation menu',exact:true}).click();
      await page.locator('.back-site').click();
      await page.waitForURL(atPath('/en'));
      check('return to public site retains public layout',await page.locator('app-site-header').isVisible() && await page.locator('.portal-root').count()===0);
      await page.close();
    }

    check('no application console errors', consoleErrors.length === 0, consoleErrors.join(' | ').slice(0, 300));
    check('no page errors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 300));
  } finally {
    await browser.close();
    server.close();
  }

  writeFileSync(join(evidence, 'results.json'), JSON.stringify({ failures }, null, 2));
  console.log(`\n evidence: ${evidence}`);
  if (failures.length > 0) {
    console.error(`verify:portal: ${failures.length} check(s) failed:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log('verify:portal: ok');
}

main().catch((error) => {
  console.error(`verify:portal: crashed: ${error.message}`);
  process.exit(1);
});

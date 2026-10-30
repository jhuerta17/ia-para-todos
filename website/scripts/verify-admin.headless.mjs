// Admin auth + inbox matrix against the prerendered dist/ with stubbed Identity.
// Serves dist/website/browser locally, seeds gotrue sessions via
// localStorage, and stubs /.netlify/identity/* + the submissions
// Function — no Netlify backend needed.
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
      const redirected = await page.waitForURL('**/admin/sign-in', { timeout: 15000 }).then(() => true).catch(() => false);
      check('logged-out /admin redirects to sign-in', redirected, page.url());
      await page.goto(`${base}/admin/sign-in`, { waitUntil: 'networkidle' });
      const heading = await page.locator('h1').first().textContent();
      const fields = await page.locator('#admin-email, #admin-password').count();
      check('sign-in renders login form', (heading ?? '').includes('Admin sign-in') && fields === 2, heading ?? '(no h1)');
      // Styled-first-paint guard: exactly one theme link after JS boot
      // (early-loader + SSR copy deduped) with utilities applied.
      const themeLinks = await page.locator('head link#admin-theme').count();
      const signinBg = await page.locator('.admin-root').first().evaluate((el) => getComputedStyle(el).backgroundColor).catch(() => '(none)');
      check('sign-in keeps one theme link with utilities applied', themeLinks === 1 && signinBg === 'rgb(255, 255, 255)', `${themeLinks} link(s), bg=${signinBg}`);
      await page.screenshot({ path: join(evidence, 'signin.png') });
      await page.close();
    }

    // ---- 2. Deep link return target ----
    {
      const page = await browser.newPage();
      await page.goto(`${base}/admin/requests`, { waitUntil: 'domcontentloaded' });
      const redirected = await page.waitForURL('**/admin/sign-in?return=*', { timeout: 15000 }).then(() => true).catch(() => false);
      check('deep link preserves return target', redirected, page.url());
      await page.close();
    }

    // ---- 3. Login validation + failure ----
    {
      const page = await browser.newPage();
      await page.goto(`${base}/admin/sign-in`, { waitUntil: 'networkidle' });
      await page.locator('button[type="submit"]').click();
      await page.locator('[role="alert"]').first().waitFor({ timeout: 5000 }).catch(() => {});
      const errors = await page.locator('[role="alert"]').count();
      check('empty login shows validation errors', errors >= 2, `${errors} alert(s)`);
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ msg: 'Invalid login credentials' }) }));
      await page.locator('#admin-email').fill('admin@example.com');
      await page.locator('#admin-password').fill('wrong-password');
      await page.locator('button[type="submit"]').click();
      const shown = await page.getByText('Incorrect email or password.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('failed login shows English error', shown);
      await page.close();
    }

    // ---- 4. Successful login ----
    {
      const page = await browser.newPage();
      page.on('pageerror', (error) => pageErrors.push(`login: ${error.message}`));
      await page.route('**/.netlify/identity/token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: tokenResponse() }));
      await page.route('**/.netlify/identity/user', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: userResponse() }));
      await page.goto(`${base}/admin/sign-in`, { waitUntil: 'networkidle' });
      await page.locator('#admin-email').fill('admin@example.com');
      await page.locator('#admin-password').fill('correct-password');
      await page.locator('button[type="submit"]').click();
      const landed = await page.waitForURL('**/admin', { timeout: 15000 }).then(() => true).catch(() => false);
      const userShown = landed ? await page.getByText('Admin User').first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false) : false;
      check('successful login lands on dashboard with user name', landed && userShown, page.url());
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
      await page.goto(`${base}/admin/requests`, { waitUntil: 'networkidle' });
      const inbox = await page.getByRole('heading', { name: 'Requests' }).waitFor({ timeout: 15000 }).then(() => true).catch(() => false);
      check('seeded admin opens inbox', inbox);
      await page.goto(`${base}/admin/sign-in`, { waitUntil: 'domcontentloaded' });
      const bounced = await page.waitForURL('**/admin', { timeout: 15000 }).then(() => true).catch(() => false);
      check('seeded admin bounces from sign-in to dashboard', bounced, page.url());
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
      const denied = await page.waitForURL('**/admin/sign-in?denied=1', { timeout: 15000 }).then(() => true).catch(() => false);
      const message = denied ? await page.getByText('This account does not have admin access.').isVisible().catch(() => false) : false;
      check('non-admin is denied with message', denied && message, page.url());
      await page.close();
      await context.close();
    }

    // ---- 7. Inbox data, filters, auth header ----
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
      await page.goto(`${base}/admin/requests`, { waitUntil: 'networkidle' });
      const maria = await page.getByText('María García').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      const juan = await page.getByText('juan@example.com').isVisible().catch(() => false);
      check('inbox renders submissions', maria && juan);
      check('inbox sends Bearer [REDACTED]', typeof authHeader === 'string' && authHeader.startsWith('Bearer '), (authHeader ?? '(none)').slice(0, 20));
      await page.getByRole('button', { name: /Newsletter/ }).click();
      const filtered = await page.getByText('María García').waitFor({ state: 'detached', timeout: 5000 }).then(() => true).catch(() => false);
      const newsLeft = await page.getByText('news@example.com').isVisible().catch(() => false);
      check('inbox filter narrows to form', filtered && newsLeft);
      await page.getByRole('button', { name: /All/ }).click();
      const restored = await page.getByText('María García').waitFor({ timeout: 5000 }).then(() => true).catch(() => false);
      check('inbox filter resets', restored);
      await page.screenshot({ path: join(evidence, 'inbox-data.png') });
      await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
      const recent = await page.getByText('Juan Pérez').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      const total = await page.getByText('+1 this week').first().isVisible().catch(() => false);
      check('overview shows recent submissions + stats', recent && total);
      const charts = await page.locator('section[aria-label] svg[role="img"]').count();
      check('overview renders live analytics charts', charts === 2, `${charts} chart(s)`);
      // Each stub form has one row: 'New' when dated this month, '-100%' when last month.
      const monthOf = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${d.getMonth()}`; };
      const thisMonth = monthOf(Date.now());
      const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      const lastMonth = monthOf(firstOfMonth - 1);
      const expectedDelta = (ms) => (monthOf(ms) === thisMonth ? 'New' : monthOf(ms) === lastMonth ? '-100%' : '?');
      const expected = [Date.now() - 86_400_000, Date.now() - 2 * 86_400_000, Date.now() - 8 * 86_400_000].map(expectedDelta);
      const badges = page.locator('app-badge[title="Compared with last month"]');
      const badgeCount = await badges.count();
      const texts = badgeCount === 3 ? await badges.allTextContents() : [];
      const deltasOk = badgeCount === 3 && expected.every((text) => texts.map((t) => t.trim()).includes(text));
      check('overview shows month-over-month deltas', deltasOk, texts.map((t) => t.trim()).join(', '));
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
      await page.goto(`${base}/admin/requests`, { waitUntil: 'networkidle' });
      const errorShown = await page.getByText('Could not load the requests.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('inbox shows error state', errorShown);
      await page.getByRole('button', { name: 'Retry' }).click();
      const emptyShown = await page.getByText('No requests yet.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('inbox retry recovers', emptyShown);
      await page.getByRole('button', { name: 'Preview with demo data' }).click();
      const previewBanner = await page.getByText('Demo data.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      const previewRows = await page.locator('tbody tr').count();
      check('inbox empty state previews demo', previewBanner && previewRows === 227, `${previewRows} rows`);
      await page.close();
      await context.close();

      const context2 = await browser.newContext();
      await context2.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const page2 = await context2.newPage();
      await page2.route('**/.netlify/functions/submissions', (route) => route.fulfill({ status: 401, contentType: 'text/plain', body: 'no' }));
      await page2.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
      const signedOut = await page2.waitForURL('**/admin/sign-in', { timeout: 15000 }).then(() => true).catch(() => false);
      check('expired session bounces to sign-in', signedOut, page2.url());
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
      await page.goto(`${base}/admin/sign-in#invite_token=abc123`, { waitUntil: 'networkidle' });
      const inviteHeading = await page.getByRole('heading', { name: 'Accept invitation' }).isVisible().catch(() => false);
      check('invite token opens invite mode', inviteHeading);
      await page.locator('#admin-new-password').fill('new-password-1');
      await page.locator('#admin-new-password-confirm').fill('new-password-1');
      await page.locator('button[type="submit"]').click();
      const activated = await page.waitForURL('**/admin', { timeout: 15000 }).then(() => true).catch(() => false);
      check('invite acceptance lands on dashboard', activated, page.url());
      await page.close();
      const fresh = await browser.newPage();
      await fresh.goto(`${base}/admin/sign-in#recovery_token=xyz789`, { waitUntil: 'networkidle' });
      const recoveryHeading = await fresh.getByRole('heading', { name: 'New password' }).isVisible().catch(() => false);
      check('recovery token opens recovery mode', recoveryHeading);
      await fresh.close();
    }

    // ---- 10. Token links landing on public pages reroute ----
    {
      const page = await browser.newPage();
      await page.goto(`${base}/#invite_token=abc123`, { waitUntil: 'domcontentloaded' });
      const rerouted = await page.waitForURL('**/admin/sign-in*', { timeout: 15000 }).then(() => true).catch(() => false);
      check('root invite link reroutes to sign-in', rerouted, page.url());
      await page.close();
    }

    // ---- 11. No-JS sign-in + public spot check ----
    {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(`${base}/admin/sign-in`, { waitUntil: 'domcontentloaded' });
      const form = await page.locator('form').count();
      check('no-js sign-in renders static form', form >= 1, `${form} form(s)`);
      // FOUC guard: with JS disabled the early-loader cannot run, so this
      // proves the theme link is render-blocking in the initial HTML.
      const themeLink = await page.locator('head link#admin-theme[rel="stylesheet"]').count();
      check('no-js sign-in ships render-blocking admin CSS', themeLink === 1, `${themeLink} link(s)`);
      await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
      const home = await page.locator('h1').first().textContent();
      check('public home unaffected', (home ?? '').length > 0, (home ?? '(none)').slice(0, 40));
      const homeTheme = await page.locator('head link#admin-theme').count();
      check('public home ships no admin CSS', homeTheme === 0, `${homeTheme} link(s)`);
      await page.close();
      await context.close();
    }

    // ---- 12. Demo mode ----
    {
      const context = await browser.newContext();
      await context.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const page = await context.newPage();
      page.on('pageerror', (error) => pageErrors.push(`demo: ${error.message}`));
      let functionCalls = 0;
      await page.route('**/.netlify/functions/submissions', (route) => {
        functionCalls += 1;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ submissions: [], truncated: false }) });
      });
      await page.goto(`${base}/admin/requests?demo=1`, { waitUntil: 'networkidle' });
      const banner = await page.getByText('Demo data.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('demo shows honesty banner', banner);
      await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 50, { timeout: 10000 }).catch(() => {});
      const rows = await page.locator('tbody tr').count();
      check('demo renders seeded rows without live fetch', rows === 227 && functionCalls === 0, `${rows} rows, ${functionCalls} calls`);
      await page.screenshot({ path: join(evidence, 'demo-inbox.png') });
      await page.getByRole('button', { name: 'Exit demo' }).click();
      const bannerGone = await page.getByText('Demo data.').waitFor({ state: 'detached', timeout: 5000 }).then(() => true).catch(() => false);
      const liveEmpty = await page.getByText('No requests yet.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('exit demo returns to live data', bannerGone && liveEmpty && functionCalls >= 1, `${functionCalls} calls`);
      await page.goto(`${base}/admin?demo=1`, { waitUntil: 'networkidle' });
      const bannerAgain = await page.getByText('Demo data.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
      const persists = await page.getByText('Demo data.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check('demo persists without query param', bannerAgain && persists);
      await page.close();
      await context.close();

      const fresh = await browser.newContext();
      await fresh.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const freshPage = await fresh.newPage();
      let freshCalls = 0;
      await freshPage.route('**/.netlify/functions/submissions', (route) => {
        freshCalls += 1;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ submissions: [], truncated: false }) });
      });
      await freshPage.goto(`${base}/admin`, { waitUntil: 'networkidle' });
      const noBanner = (await freshPage.getByText('Demo data.').count()) === 0;
      check('demo stays off by default', noBanner && freshCalls >= 1, `${freshCalls} calls`);
      await freshPage.getByRole('button', { name: 'Preview with demo data' }).click();
      const overviewBanner = await freshPage.getByText('Demo data.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      const overviewDonut = await freshPage.locator('section[aria-label="Requests by form"] svg text').first().textContent().catch(() => null);
      check('overview empty state previews demo', overviewBanner && overviewDonut?.trim() === '227', `total=${overviewDonut?.trim()}`);
      await freshPage.close();
      await fresh.close();
    }

    // ---- 13. Demo analytics ----
    {
      const context = await browser.newContext();
      await context.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const page = await context.newPage();
      page.on('pageerror', (error) => pageErrors.push(`demo-analytics: ${error.message}`));
      await page.goto(`${base}/admin?demo=1`, { waitUntil: 'networkidle' });
      await page.getByText('Demo data.').waitFor({ timeout: 10000 }).catch(() => {});
      const bars = await page.locator('section[aria-label="Request trend"] svg g').count();
      check('demo trend shows six monthly bars', bars === 6, `${bars} bar(s)`);
      const donutTotal = await page.locator('section[aria-label="Requests by form"] svg text').first().textContent().catch(() => null);
      const donut = page.locator('section[aria-label="Requests by form"]');
      const p95 = await donut.getByText('95', { exact: true }).isVisible().catch(() => false);
      const c18 = await donut.getByText('18', { exact: true }).isVisible().catch(() => false);
      const n114 = await donut.getByText('114', { exact: true }).isVisible().catch(() => false);
      check('demo donut breaks down seeded forms', donutTotal?.trim() === '227' && p95 && c18 && n114, `total=${donutTotal?.trim()}`);
      const deltaBadges = await page.locator('app-badge[title="Compared with last month"]').count();
      check('demo stat cards show deltas', deltaBadges === 3, `${deltaBadges} badge(s)`);
      await page.screenshot({ path: join(evidence, 'demo-overview.png'), fullPage: true });
      await page.close();
      await context.close();
    }

    // ---- 14. New pages: guard, demo content, live empty states ----
    {
      const anon = await browser.newContext();
      const anonPage = await anon.newPage();
      await anonPage.goto(`${base}/admin/workshops`, { waitUntil: 'networkidle' });
      const redirected = anonPage.url().includes('/admin/sign-in');
      check('logged-out /admin/workshops redirects to sign-in', redirected, anonPage.url());
      await anonPage.close();
      await anon.close();

      const context = await browser.newContext();
      await context.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const page = await context.newPage();
      page.on('pageerror', (error) => pageErrors.push(`demo-pages: ${error.message}`));
      await page.goto(`${base}/admin/workshops?demo=1`, { waitUntil: 'networkidle' });
      await page.getByText('Demo data.').waitFor({ timeout: 10000 }).catch(() => {});
      const workshopRows = await page.locator('tbody tr').count();
      check('demo workshops render eight sessions', workshopRows === 8, `${workshopRows} row(s)`);
      await page.screenshot({ path: join(evidence, 'demo-workshops.png'), fullPage: true });
      await page.locator('aside').first().getByRole('link', { name: 'Impact' }).click();
      await page.waitForURL('**/admin/impact', { timeout: 10000 });
      const impactRows = await page.locator('tbody tr').count();
      const reached = await page.getByText('170', { exact: true }).count();
      check('demo impact renders six months + reach', impactRows === 6 && reached === 1, `${impactRows} rows, reach x${reached}`);
      await page.screenshot({ path: join(evidence, 'demo-impact.png'), fullPage: true });
      await page.locator('aside').first().getByRole('link', { name: 'Supporters' }).click();
      await page.waitForURL('**/admin/supporters', { timeout: 10000 });
      const supporterRows = await page.locator('tbody tr').count();
      const raised = await page.getByText('$119,500', { exact: true }).isVisible().catch(() => false);
      check('demo supporters render ledger + total', supporterRows === 10 && raised, `${supporterRows} rows`);
      await page.screenshot({ path: join(evidence, 'demo-supporters.png'), fullPage: true });
      await page.close();
      await context.close();

      const fresh = await browser.newContext();
      await fresh.addInitScript((seed) => localStorage.setItem('gotrue.user', JSON.stringify(seed)), seedUser(['admin']));
      const live = await fresh.newPage();
      const empties = [
        ['workshops', 'No workshops yet'],
        ['impact', 'No impact data yet'],
        ['supporters', 'No supporters yet'],
      ];
      let emptyOk = true;
      for (const [path, heading] of empties) {
        await live.goto(`${base}/admin/${path}`, { waitUntil: 'networkidle' });
        const shown = await live.getByText(heading, { exact: true }).waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
        emptyOk = emptyOk && shown;
      }
      check('new pages show honest empty states live', emptyOk);
      await live.goto(`${base}/admin/workshops`, { waitUntil: 'networkidle' });
      await live.getByRole('button', { name: 'Preview with demo data' }).click();
      const workshopsBanner = await live.getByText('Demo data.').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      const workshopsRows = await live.locator('tbody tr').count();
      check('workshops empty state previews demo', workshopsBanner && workshopsRows === 8, `${workshopsRows} rows`);
      await live.close();
      await fresh.close();
    }

    // ---- 15. Sign-in loads without a public-chrome flash ----
    {
      // Slow resources stretch the window between first client render and
      // initial-navigation completion, when the router snapshot is empty.
      // Sees the regression as <app-site-header>/<app-site-footer> in the DOM.
      const page = await browser.newPage();
      page.on('pageerror', (error) => pageErrors.push(`signin-flash: ${error.message}`));
      await page.route('**/*.{woff2,js,css}', async (route) => {
        await new Promise((r) => setTimeout(r, 400));
        return route.continue();
      });
      await page.goto(`${base}/admin/sign-in`, { waitUntil: 'domcontentloaded' });
      const seen = new Set();
      for (let i = 0; i < 40; i++) {
        const found = await page.evaluate(() => ['app-site-header', 'app-site-footer', 'app-admin-header', 'app-admin-sidebar'].filter((s) => document.querySelector(s)));
        for (const tag of found) seen.add(tag);
        if (seen.size === 0) await page.waitForTimeout(100);
        else break;
      }
      check('sign-in never renders public/admin chrome during load', seen.size === 0, [...seen].join(',') || 'clean');
      await page.goto(`${base}/admin/sign-in`, { waitUntil: 'networkidle' });
      const heading = await page.locator('h1').first().textContent();
      check('throttled sign-in still settles on login form', (heading ?? '').includes('Admin sign-in'), heading ?? '(no h1)');
      // Admin-only font preloads: the sign-in weights arrive with the static
      // 400s instead of swapping late; public pages stay untouched.
      const adminPreloads = await page.evaluate(() => [...document.querySelectorAll('link[rel="preload"][as="font"]')].map((l) => l.getAttribute('href')));
      const want = ['instrument-sans-latin-500-normal', 'instrument-sans-latin-600-normal', 'libre-baskerville-latin-700-normal'];
      const missing = want.filter((w) => !adminPreloads.some((h) => h.includes(w)));
      check('sign-in preloads its semibold/bold weights', missing.length === 0, missing.join(',') || `${adminPreloads.length} preload(s)`);
      await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
      const homePreloads = await page.evaluate(() => [...document.querySelectorAll('link[rel="preload"][as="font"]')].map((l) => l.getAttribute('href')));
      const leaked = homePreloads.filter((h) => want.some((w) => h.includes(w)));
      check('public home skips admin font preloads', leaked.length === 0, leaked.join(',') || `${homePreloads.length} preload(s)`);
      await page.close();
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

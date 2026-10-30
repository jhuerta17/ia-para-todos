# Admin dashboard

Owner-only dashboard for managing the site: review form submissions
(`participate`, `collaborate`, `newsletter`) behind a Netlify Identity
login. English UI, light mode, same brand as the public site.

- Public login: `https://ia-para-todos-jh.netlify.app/admin/sign-in`
- Overview (admin role): `/admin`
- Inbox (admin role): `/admin/requests`
- Workshops (admin role): `/admin/workshops`
- Impact (admin role): `/admin/impact`
- Supporters (admin role): `/admin/supporters`

Access is enforced in three layers: Netlify edge role rules
(`netlify.toml`), the in-app route guard, and the Function, which
re-validates the Identity JWT and the `admin` role on every call.
`/admin/*` stays out of the sitemap and robots, and the prerendered
admin HTML is a data-free shell.

## One-time Netlify setup

Identity itself is already enabled. Complete these steps in the
Netlify dashboard:

1. **Invite-only registration.** Site settings → Identity →
   Registration → Registration preferences → **Invite only**. This
   closes public signup; only invited owners can exist.
2. **Invite yourself.** Identity → Users → **Invite users** → enter
   your email and send the invite.
3. **Accept the invite.** Open the invite email link (it lands on the
   site and reroutes to `/admin/sign-in` automatically), create your
   password, and sign in.
4. **Grant the admin role.** Identity → Users → select your user →
   **Edit settings** → Roles → add `admin` → save. Roles take effect
   on the next login, so sign out and back in afterwards.
5. **Create an API token.** Your avatar menu → User settings →
   Personal access tokens → **New token**. Name it
   `ia-para-todos-admin` and copy the value (shown once). The inbox
   uses it read-only to list forms and submissions.
6. **Set the env var.** Site settings → Environment variables → add
   `NETLIFY_API_TOKEN` with the token value, marked secret, scoped to
   all contexts (or at least production). Then **trigger a redeploy**
   (Deploys → Trigger deploy): functions pick up env vars on deploy.

No email-template changes are needed: invite, recovery, and
confirmation links are detected site-wide and rerouted to
`/admin/sign-in`, which consumes the token.

## Daily use

- Sign in at `/admin/sign-in`. A **return** parameter brings you back
  to a deep link after login.
- **Forgot your password?** Use the recovery link on the sign-in
  page, or Identity → Users → your user → Send reset password email.
- **Dashboard** shows per-form totals with month-over-month deltas,
  a six-month request trend, a by-form breakdown, and the five latest
  submissions. **Requests** shows everything with per-form filters
  (latest 100 per form; a note appears when truncated).
- **Workshops** lists sessions with attendance and status, **Impact**
  reports reach and satisfaction, and **Supporters** keeps the
  contribution ledger. These three pages have no live store yet: they
  show honest empty states until their backends exist, and full
  example content in demo mode (below).
- **Sign out** is in the account menu (top right).

## Demo mode

Demo mode swaps every admin page to deterministic synthetic data
(about six months of invented operations) so the dashboard can be
evaluated before real data accumulates. It never touches Netlify
Forms submissions: only the dashboard's data source changes.

- **Turn on:** open any admin page with `?demo=1`, pick **View demo
  data** in the account menu, or click **Preview with demo data** on
  an empty state. The choice persists per browser.
- **Turn off:** click **Exit demo** in the banner, or pick **Exit
  demo data** in the account menu. Demo is off by default and a fresh
  browser never sees it.
- **Honesty rules:** demo mode always shows the amber *"Demo data.
  These figures are simulated for demonstration, not real
  operations."* banner. Demo figures are invented examples — never
  quote them as real operations, in screenshots or otherwise.
- **Contents:** 227 form submissions (95 participate, 18 collaborate,
  114 newsletter), 8 workshops, 6 impact months, 10 supporters
  ($119,500 raised). Same input always yields the same output.

## Post-deploy verification

Run through this once after setup, ideally on a deploy preview first:

- [ ] Incognito `/admin` → Netlify 404 page (edge rule working).
- [ ] Incognito `/admin/sign-in` → sign-in form (public).
- [ ] Submit a test message on each public form, then sign in and
      confirm all three appear in Requests with correct dates.
- [ ] A logged-in user **without** the `admin` role is bounced to
      sign-in with the permissions message.
- [ ] Functions → `submissions` → logs show no errors; a submission
      round-trips in a few seconds.
- [ ] Fresh browser (no `?demo=1`) shows live data with no demo
      banner; `?demo=1` shows the banner and example data.
- [ ] Incognito `/admin/workshops`, `/admin/impact`,
      `/admin/supporters` → Netlify 404 page (edge rules working).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Inbox shows "Could not load the requests" | Token missing, invalid, or revoked | Check `NETLIFY_API_TOKEN`, redeploy, read the Function logs |
| Bounced with the permissions message | `admin` role missing | Add the role (step 4), sign out and back in |
| `/admin` shows the Netlify 404 while signed in | Identity cookie missing | Sign out and back in (login refreshes it) |
| Invite/recovery link shows an expired-link error | Token used or expired | Send a fresh invite or recovery email |
| Only 100 rows in a busy form | API page cap | Expected; the UI notes truncation |

## For developers

- App code: `website/src/app/admin/` (Tailwind theme, shell,
  session, guard, pages). TailAdmin attribution:
  `THIRD_PARTY_NOTICES.md`.
- Backend: `website/netlify/functions/submissions.mts` (default
  functions dir, no `netlify.toml` wiring needed). Pure mapping is
  exported as `mapSubmissions` and covered by direct node import.
- The Function resolves the site as `NETLIFY_SITE_ID`, else the host
  of the `URL` env var, else the bundled production host.
- To add a form to the inbox: add its `form-name` to `KNOWN_FORMS`
  (function), `FORM_LABELS`/`FORM_BADGE_COLORS`
  (`admin/data/submissions.ts`), and the inbox filter list.
- Demo modules are pure and deterministic: `admin/data/demo-state.ts`
  (toggle), `admin/data/demo-generator.ts` (submissions),
  `admin/data/demo-content.ts` (workshops, impact, supporters),
  `admin/data/analytics.ts` (buckets, deltas). Postbuild pins their
  exact output; `verify:admin` pins the UI behavior.
- Follow-up: workshops, impact, and supporters need real stores
  (functions + persistence) before their live views can show data.
- Local checks (Chromium via Playwright, Identity stubbed):
  `npm run build`, `npm run verify:admin`, `npm run verify:forms`.

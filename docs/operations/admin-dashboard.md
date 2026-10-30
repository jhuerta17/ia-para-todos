# Admin dashboard

Owner-only dashboard for managing the site: review form submissions
(`participate`, `collaborate`, `newsletter`) behind a Netlify Identity
login. Spanish UI, light mode, same brand as the public site.

- Public login: `https://ia-para-todos-jh.netlify.app/admin/acceso`
- Overview (admin role): `/admin`
- Inbox (admin role): `/admin/solicitudes`

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
   site and reroutes to `/admin/acceso` automatically), create your
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
`/admin/acceso`, which consumes the token.

## Daily use

- Sign in at `/admin/acceso`. A **return** parameter brings you back
  to a deep link after login.
- **Forgot your password?** Use the recovery link on the sign-in
  page, or Identity → Users → your user → Send reset password email.
- **Panel** shows per-form totals, this week's counts, and the five
  latest submissions. **Solicitudes** shows everything with per-form
  filters (latest 100 per form; a note appears when truncated).
- **Cerrar sesión** is in the account menu (top right).

## Post-deploy verification

Run through this once after setup, ideally on a deploy preview first:

- [ ] Incognito `/admin` → Netlify 404 page (edge rule working).
- [ ] Incognito `/admin/acceso` → sign-in form (public).
- [ ] Submit a test message on each public form, then sign in and
      confirm all three appear in Solicitudes with correct dates.
- [ ] A logged-in user **without** the `admin` role is bounced to
      acceso with the permissions message.
- [ ] Functions → `submissions` → logs show no errors; a submission
      round-trips in a few seconds.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Inbox shows "No pudimos cargar las solicitudes" | Token missing, invalid, or revoked | Check `NETLIFY_API_TOKEN`, redeploy, read the Function logs |
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
- Local checks (Chromium via Playwright, Identity stubbed):
  `npm run build`, `npm run verify:admin`, `npm run verify:forms`.

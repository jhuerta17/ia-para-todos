# IA Para Todos website

> **SOURCE REVIEW — November 4, 2026:** Angular 22 public website, student portal,
> admin dashboard, and Netlify Functions. For judge access, start with the
> [main README](../README.md). For current live evidence, see [readiness](../docs/readiness.md).

## Local setup

Use Node.js **24.16.0** (the Netlify build version) and npm **11.13.0**
(the package manifest's package manager). From the repository root:

```sh
cd website
npm ci
npm start
```

Open `http://localhost:4200/`. This serves Angular; it does **not** emulate
Netlify Identity, Functions, Neon, Forms, or the production AI switch. A local
signup form is not a working local authentication service. Local/preview AI uses
samples. Never point a preview or fixture suite at production participant data.

## Build and verification

From `website/`:

```sh
npm run build
npm run verify:ai:types
npm run verify:portal:types
npm run verify:workshops:types
npm run verify:meta:types
npm run verify:ai
npm run verify:portal:db
npm run verify:workshops
npm run verify:meta
```

The build runs the CSS prebuild and route/content postbuild checks. Local builds
need no database connection. The database suites use disposable local PostgreSQL;
offline tests do not prove real Identity email, production isolation, WhatsApp
delivery, or Meta generation.

Browser verification needs the project's Chromium installation:

```sh
npm run install:chromium
npm run verify:portal
npm run verify:admin
npm run verify:forms
npm run verify:meta:browser
```

Use `npm run review:portal` for an interactive fixture review. It supplies fake
Identity/API services and fictional users; its credentials are not live accounts.
There is no configured `npm test` or `ng e2e` suite; use the actual commands above.
Run `bash scripts/validate-docs.sh` from the repository root for documentation checks.

## Backend configuration

Keep values in Netlify environment settings, marked secret where applicable,
with separate production/staging contexts. Do not commit a credential file or
paste secrets into logs. Operators should follow the linked guides for rollout.

| Configuration | Purpose |
| --- | --- |
| Netlify Identity registration and confirmation settings | Enable student signup only when ready; assign admin roles separately. |
| `PORTAL_SIGNUP_ENABLED`, `PORTAL_EMAIL_HASH_SECRET` | Signup gate and admission-email HMAC; secret must be at least 32 characters. |
| `PORTAL_DATABASE_URL` | Neon pooled connection for Functions. |
| `PORTAL_MIGRATION_DATABASE_URL` | Neon direct connection for migration builds. |
| `META_MUSE_API_KEY`, `AI_ALLOWED_ORIGINS` | Server-held Meta credential and exact HTTPS AI origins. |
| Netlify Blobs live switch | Admin-controlled production live generation; missing/unreadable setting falls back to samples. |
| `PORTAL_AI_ENABLED`, `PORTAL_AI_PRICE_MODEL` | Student live-AI gate and exact Contributor model match. |
| `PORTAL_AI_INPUT_USD_PER_MILLION`, `PORTAL_AI_OUTPUT_USD_PER_MILLION` | Verified positive prices for the student cost ledger; no guessed defaults. |
| `NETLIFY_API_TOKEN` | Server-held token for the admin Forms inbox; grant only necessary permissions. |
| WhatsApp environment settings | Separate restricted test setup, described below. |

WhatsApp uses `WHATSAPP_ENABLED`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`,
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_GRAPH_VERSION`,
`WHATSAPP_PUBLIC_ORIGIN`, and `WHATSAPP_TEST_RECIPIENTS`. Recipient allowlisting
remains required. Do not publish their values; configuration does not prove delivery.

For an explicitly configured disposable/staging database, `npm run db:check`
checks migration state (and can initialize its tracking table), while
`npm run db:migrate` applies pending SQL. Both require the direct connection;
neither belongs in a casual production connectivity check. Never edit an applied migration.
The reviewed Netlify production build runs `npm run db:migrate && npm run build`;
preview builds do not inherit production credentials or migrate automatically.
Do not run fixture seeds against production.

## Service map and detailed guides

- [Architecture and security boundaries](../docs/architecture.md)
- [Student accounts, consent, quotas, retention and deletion](../docs/operations/student-portal.md)
- [Workshop reservations and WhatsApp discovery](../docs/operations/workshop-bookings.md)
- [Admin roles, Forms inbox and demo mode](../docs/operations/admin-dashboard.md)
- [Meta Muse live switch and public AI limits](../docs/demo/ai-setup.md)
- [Security reporting](../SECURITY.md) and [readiness checklist](../docs/readiness.md)

Interface icons use the shared Angular icon component and Tabler consistently.
Preserve brand logos as assets. Third-party theme notices live in
[src/app/admin/THIRD_PARTY_NOTICES.md](src/app/admin/THIRD_PARTY_NOTICES.md);
fonts and other assets retain their own licenses.

# Adult student portal operations

The repository implements the free ES/EN introductory course, account progress,
saved sample/live practice, adult/privacy consent, capped signup, quotas,
retention, and deletion. Production deployment, real email callbacks, and
real two-user staging evidence remain separate release gates.

## Data and access

Netlify Identity owns credentials, email, and display name. Neon PostgreSQL owns
profiles (Identity ID and consent), enrollments, lesson completion, chats,
messages, admissions, deletion jobs, and usage counters. No student records or
secrets belong in Git. Public workshops remain anonymous; the approved adult
portal exception is documented in the privacy guidelines and public notices.

Every portal API derives ownership from verified Identity; it rejects
unconfirmed email and requires adult/privacy consent. User metadata cannot
assign the admin role. Portal access does not imply admin access. Admin APIs
and edge role rules retain their existing checks. Portal and admin share a
session; signing out of either signs out of both.

Course progress now uses authenticated server APIs. The temporary browser
store is deleted. Earlier local progress is intentionally not migrated.
Language choice and Identity sessions still use browser storage.

All portal page URLs are prerendered, noindex/nofollow, and excluded from the
sitemap. Private APIs return no-store responses. Unknown routes retain real
404 behavior; there is no broad SPA rewrite.

## Verification commands

From `website/`:

```sh
npm ci
npm run build
npm run verify:ai:types
npm run verify:portal:types
npm run verify:ai
npm run verify:portal:db
npm run verify:admin
npm run verify:portal
npm audit --omit=dev
```

The database suite starts a disposable real PostgreSQL cluster via
`embedded-postgres` for separate-session transaction tests. The suite checks
foreign keys, ownership, idempotency, simultaneous quota admission, the monthly
budget, admissions, interrupted replies, retention, and deletion versus saves.
The cluster is stopped and removed afterward; it never targets a managed DB.
No real model or Identity calls are made.

The browser suite uses test-only Identity/API fixtures and installed Playwright
Chromium. It covers auth, two users in one browser, course progress, saved
sample chats, deletion, safe text rendering, consent, errors, and mobile layout.
Evidence is written under the OS temporary directory `ia-para-todos-verify-portal`.
The test API adapter is never imported by the app or Netlify functions.

`npm run review:portal` opens the local app with the same fake services. Use
`estudiante@example.com` and any password of at least eight characters. Tick
the adult checkbox for signup. Close the browser when finished. Plain
`npm start` does not emulate Identity or the database APIs.

## Required environment configuration

Set values through Netlify's environment-variable UI, with secrets marked
secret and separate staging/production scopes. Do not put values in this file
or `netlify.toml`.

| Variable | Meaning |
| --- | --- |
| `PORTAL_EMAIL_HASH_SECRET` | Random secret of at least 32 characters for admission-email HMACs. Required for non-admin admission. Keep stable; coordinate admission reconciliation before rotation. |
| `PORTAL_SIGNUP_ENABLED` | Defaults off. Only `true` permits non-invited signup through the Identity validation hook. |
| `PORTAL_AI_ENABLED` | Defaults off. Only `true` allows student live generation, alongside the existing global AI switch. |
| `PORTAL_AI_PRICE_MODEL` | Must exactly match `muse-spark-1.3-contributor`. |
| `PORTAL_AI_INPUT_USD_PER_MILLION` | Positive verified provider input price in USD per million tokens. No guessed default. |
| `PORTAL_AI_OUTPUT_USD_PER_MILLION` | Positive verified provider output price, including reasoning, in USD per million tokens. |
| `META_MUSE_API_KEY` | Existing provider credential; server-only. |
| `AI_ALLOWED_ORIGINS` | Existing public/admin AI origin allowlist. Portal mutations separately require the request's exact same origin. |

The portal uses the standard `pg` driver and a small reusable pool. Remote
connections require certificate-verified TLS; no credentials reach the browser.
Netlify-managed Database packages are removed, so deployment does not require
access to that product.

- `PORTAL_DATABASE_URL`: Neon **pooled** URL, secret, Functions scope.
- `PORTAL_MIGRATION_DATABASE_URL`: Neon **direct** URL, secret, Builds scope
  for the production migration build.
- Keep production values in the production context. Give preview/branch
  deploys their own staging URL; never give previews production credentials.
- Migrations live in `website/db/migrations`. Run `npm run db:check` and then
  `npm run db:migrate` with the direct URL supplied securely through the
  environment. Neither command prints the connection string. `db:check`
  initializes the migration tracking table when absent, but applies no portal
  schema migration.
- The runner takes a session advisory lock, checks applied-file SHA-256 hashes,
  rejects removed/changed/out-of-order migrations, and applies each pending
  file transactionally. Never edit a file after it has been applied.
- Local `npm run build` does not require a database. The Netlify production
  context runs `npm run db:migrate && npm run build`; a missing direct URL or
  failed migration stops publication. Apply and test schema on staging first.
  Other preview contexts do not run migrations or inherit production secrets;
  configure their own staging credentials explicitly. Use additive migrations.

Dedicated Neon project: `ia-para-todos` (`winter-brook-27058187`), AWS Ohio,
PostgreSQL 18. Production branch: `br-spring-forest-bekgoxfa`; staging:
`br-withered-feather-bej641jg`. Staging was created schema-only, not copied from
participant data. The selected Free plan currently shows six-hour history
retention in the console; review backup/recovery needs before enrolling users.


## Quotas, histories, and spending

The pilot admits at most 25 active/reserved non-admin seats. Reservations expire
24 hours after an unconfirmed signup attempt; confirmation must reacquire a seat
if its reservation expired. Existing students acquire a seat when accepting
portal consent. Invited administrators do not consume seats. Open signup needs
both the environment gate and Identity registration setting; leave email
confirmation enabled. Server roles change on next login/token refresh.

Live practice is limited to 20 admitted requests per student per UTC day. A
shared student-AI ledger is capped at 25,000,000 microdollars ($25) per UTC month.
Day/month reset at 00:00 UTC. Sample replies do not consume live allowance.
Admission reserves conservative input/output cost before any provider call,
then reconciles verified token usage. Unknown cost stays reserved; a failed
request can consume allowance/reservation. Missing price/model/key/configuration
or an exhausted budget produces a clearly labeled sample, never an unbounded
live call. The existing global admin switch must also be enabled.

Request IDs bind to user, chat, normalized prompt, language, and live/consent
flags. Replays do not call the provider twice. Only one pending send per chat
is accepted. A send interrupted for more than two minutes recovers to a sample
on the next read/send; daily maintenance also repairs abandoned requests. No
automatic provider retries are made. Max 50 unexpired chats per user, 200 saved
messages per chat, 2,000 characters per message, and six non-sample messages of
model context. New chat titles come from the scrubbed first prompt.

Deleting a chat never refunds durable usage. Monthly totals are aggregate and
survive account deletion. Daily per-user counters age out after roughly 32 days.
The application ceiling excludes hosting, DB, email, public tutor usage, and
provider pricing changes. Review provider billing as well as application totals;
verify rates before activation and after model/pricing changes.

## Retention and deletion

Chat expiry is 30 days after creation, independent of later messages. Expired
histories are denied immediately; `portal-maintenance` purges them daily at
04:00 UTC. The public privacy notice explains provider backup limitations and
Meta Contributor processing. Local deletion cannot reverse provider training.
Common email/phone patterns are scrubbed before storage and transmission, but
this is not full anonymization. Never log message bodies, replies, email, JWTs,
or provider keys.

Students can delete individual chats or request account deletion in My account.
The request immediately removes chats/progress, removes daily counters, records
a deletion job, and denies further portal access. Maintenance retries Identity
deletion daily and releases the admission seat on success. Dashboard Identity
deletion events also clear portal data. Minimal user-ID tombstones and deletion
records remain to deny stale tokens; they contain no conversation content.
Admin accounts must be managed in the dashboard to avoid accidental owner loss.
Provider backups must have their retention/access settings reviewed before launch.

Monitor pending deletion jobs, attempts, oldest request date, and the scheduled
function's last successful run. A job older than 24 hours needs operator review;
service outages can extend deletion time. Do not report completion solely from
the initial 202 response. Test deletion with disposable staging users only.

## Abuse response and incident handling

1. Disable `PORTAL_SIGNUP_ENABLED` and/or `PORTAL_AI_ENABLED` as needed and
   redeploy through the normal main-branch workflow. The global admin AI pause
   is the immediate cross-instance live-generation switch.
2. Inspect safe error counts, quota totals, oldest pending deletion job, and
   scheduled-function status. Do not enable prompt/reply logging for diagnosis.
3. Review monthly reserved cost against provider billing. Unexpected usage or
   stalled maintenance requires stopping pilot expansion.
4. Rotate a compromised provider key in Netlify and at the provider, then
   redeploy. Rotate Identity sessions through its supported dashboard controls.
   Do not read CLI token files or invent undocumented Identity endpoints.
5. Record incidents privately. Commit only anonymized process improvements.

## Release gates

1. Finish all local commands above and review desktop/mobile evidence.
2. Configure a separate staging Netlify project with separate Identity users
   and its own Neon staging database connection. Leave production invite-only and live student AI off. Identity
   settings are dashboard-only: enable confirmation, then open registration
   on staging and set its signup gate. Set a separate admission HMAC secret.
3. Verify fresh-email signup → confirm → adult notice → enroll → lesson
   completion → sample chat → logout → another browser restores history.
4. Use two real confirmed users. Swap chat IDs for GET, DELETE, and message
   requests; expect 404 without leaked content. Verify students are denied
   `/admin` at the edge and in the app, including after admin logout.
5. Configure verified pricing and a staging-approved provider test; student
   live calls remain production-context gated by default. Prove actual live
   behavior in the final controlled production pilot after approval, never
   assume sample-mode staging proves provider billing.
6. Exercise email recovery/confirmation, chat expiry, interrupted sends,
   account deletion, Identity retry, and a successful scheduled run. Confirm
   Neon's backup retention, plan support, and estimated platform costs.
7. Obtain production approval, set the reviewed configuration, and deploy the
   reviewed `main` commit through Git. Enable signup/live only after the
   migration and access checks pass. Do not create an ad-hoc manual production
   deploy. No production deploy has been performed by this implementation work.

On a bad release, disable signup/live first and fix forward with a corrective
commit. Do not remove migrations or restore data snapshots as a routine app
rollback. Re-run the relevant checks before the next main-branch deploy.

# AI trial safety and activation

Live AI is **off by default**. Sample practice runs locally in the learner's
browser and does not contact Meta. Do not activate live AI until the checks below
are complete. Deploying this code does not require Redis or Turnstile.

## Rollout status (2026-11-02)

- Production safety flag is `false`; the protected sample-only build is deployed:
  [deployment 6ae8ad2699ffa008d75955b5](https://app.netlify.com/projects/ia-para-todos-jh/deploys/6ae8ad2699ffa008d75955b5).
- Validation passed: 17 real-Redis security scenarios, 21 desktop/mobile browser
  assertions (mocked third parties), strict function types, and the production
  build. Production checks confirmed sample tutor replies, 401 on anonymous admin
  calls, 403 on foreign origins, 404 on both old function aliases, registered rate
  metadata for both new routes, and 429 after the platform counter delay.
  Rate tests used sample-only status requests; no paid inference was generated.
- Source changes are uncommitted. This manual deployment can be replaced by the
  next push to `main`; include these changes before another production push.
- Redis and Turnstile are intentionally not provisioned yet, per owner choice.
- Netlify returned HTTP 403 for functions-only scopes: **the current plan requires
  an upgrade for granular scopes**. Non-secret safety flags use supported default
  scopes with production-only values. The existing Meta key was preserved; no
  account upgrade or paid service was purchased. Resolve key storage/scoping
  before enabling live AI.
- Rotate/revoke the existing Meta key in the provider dashboard before future
  activation. Older immutable Netlify deployments may retain the previously
  configured key even after the current site is hardened; an environment change
  alone is not provider-key revocation. Use a new dedicated key for the protected
  workflow. Provider billing, key permissions, and hard-limit settings still
  require owner verification in Meta.

## Architecture and limits

- `/api/ai-session`: public status and Turnstile-verified anonymous session issuance.
- `/api/ai-assist`: the only inference doorway; tutor requires the issued session,
  triage requires a verified Netlify Identity user with the `admin` role.
- `ai-control`: Identity-admin-only usage, initial budget baseline, and shared
  pause/enable controls. Available in the admin dashboard.
- `netlify/lib/ai-security.mts`: shared request validation, Redis atomic scripts,
  pricing, persistent budget ledger, and Chicago calendar calculations.

| Guard | Default |
|---|---|
| Tutor session | 3 live requests / rolling minute; 10 / Chicago calendar day |
| Trusted client IP, both tasks combined | 20 live requests / rolling minute; 100 / Chicago day |
| Session issuance attempts per IP | 10 / rolling hour, including failed challenges |
| Simultaneous provider workflows | 3 globally; 1 per session/admin |
| Platform throttle | 60 requests/minute per IP/domain on session and AI endpoints |
| AI budget, both tasks combined | $1 / Chicago day; $10 / Chicago calendar month |
| Input | 32 KiB streamed HTTP body; 2,000 characters per input/history turn; 6 history turns |
| Model context admission | Exact Meta preflight count must be 1–16,384 tokens |
| Generated tokens | 400 total, including reasoning |
| Provider deadline | 20 seconds across count + generation; no retries |
| Trial session | 256-bit random token; 24-hour server TTL and Secure/HttpOnly/SameSite cookie |

IP values come from Netlify `context.ip`, never forwarding headers, and are HMAC
hashed before storage. Sessions are bound to that hash; a network change may
require a new verification. An anonymous session is not proof of a unique person.
Shared spending limits remain authoritative when attackers rotate cookies/IPs.

## Provisioning (owner setup)

1. Create a **dedicated, persistent Upstash Redis database** on the free tier.
   Do not use an anonymous expiring database. Disable auto-upgrade. Use its
   HTTPS REST URL and read/write REST token, not the read-only token. Keep this
   database exclusive to this website; the key namespace is `ai:v1:`.
   Select durable storage and prevent eviction of ledger/control keys; if state
   is missing, leave live AI paused and recover usage from Meta before repair.
2. Create a Cloudflare Turnstile **managed widget**, allowing only the production
   site hostname(s). The code uses action `ai_trial`. The site key is public;
   the secret is server-only. Tokens are validated server-side for success,
   hostname, action, age, and replay. The script loads only when a learner
   acknowledges Contributor data use and asks to enable live practice.
3. Create a **dedicated Meta website project/key**. Confirm model access,
   endpoint compatibility, token prices, and token-count endpoint behavior.
   Review existing usage and set a provider hard spending limit if supported.
   A notification threshold is not a hard limit. Revoke old shared keys after
   migrating their other consumers, if any; never reuse a key exposed publicly.
4. Review Netlify Usage & billing. Disable automatic credit recharge initially.
   Meta limits do not cap Netlify traffic/function costs or Redis charges.
5. Add the variables below in Netlify, **production context, Functions scope**.
   Store secrets as secrets. Keep values absent in all preview/development
   contexts; do not put them in `netlify.toml` or frontend source.

| Variable | Value / purpose |
|---|---|
| `AI_LIVE_ENABLED` | `false` initially; only set `true` after the activation checklist |
| `AI_ALLOWED_ORIGINS` | Exact HTTPS origins, comma separated; initially `https://ia-para-todos-jh.netlify.app` |
| `UPSTASH_REDIS_REST_URL` | Dedicated database's `https://…upstash.io` REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Secret read/write REST token |
| `AI_IP_HASH_SECRET` | Secret: at least 32 random bytes, kept stable; rotating invalidates existing sessions |
| `TURNSTILE_SITE_KEY` | Public widget key, served through the status endpoint |
| `TURNSTILE_SECRET_KEY` | Secret widget verification key |
| `META_MUSE_API_KEY` | Secret dedicated website key |
| `AI_PRICING_VERIFIED_AT` | ISO timestamp recording actual verification of pinned model rates/limits |

Pricing verification expires after 30 days: recheck official terms and update
this timestamp, then redeploy. Missing/stale configuration closes live access.
Legacy `META_MUSE_API_URL` and `META_MUSE_MODEL` overrides are deliberately ignored;
requests cannot select endpoints/models. Production eligibility uses Netlify's
trusted deploy context, not browser input.

## Budget accounting and recovery

All money is integer **nanodollars** ($1 = 1,000,000,000). Admission is one Redis
Lua operation checking the emergency switch, persistent ledger, session, quotas,
concurrency, and both budgets before reserving the full permitted input/output
cost. No paid generation is sent without a reservation. The same Responses input
is submitted to Meta's token-count endpoint before inference; generation is
refused if the count is unavailable or exceeds the reserved 16,384-token bound.
Tools are explicitly empty and provider response storage is disabled.

Pinned rates, verified from official documentation on 2026-11-02:

| Task | Model | Input / 1M tokens | Output / 1M tokens | Maximum reservation |
|---|---|---|---|---|
| Public tutor | `muse-spark-1.3-contributor` | $0.10 | $0.20 | $0.0017184 |
| Admin triage | `muse-spark-1.3` | $1.25 | $4.25 | $0.02218 |

Cached tokens are conservatively charged at the uncached input rate. Output
usage includes reasoning. Successful usage refunds unused reservation exactly
once; timeout, failed preflight, missing usage, or an uncertain result keeps the
full reservation. Unexpected usage above the bound pauses live AI. Reconciliation
uses the reservation's original day/month even if midnight has passed.

The ledger and emergency control have **no TTL**. Period rollover requires an
intact prior ledger/control and creates the next period atomically. Missing state
never creates a new allowance. Sessions, quotas, challenge replay markers, and
reservation receipts have bounded lifetimes. Receipts last 40 days; their expiry
never releases a spending reservation. Concurrency leases last 90 seconds, longer
than the bounded function workflow; aborted provider work may still finish and
remain billable, so its full reservation is retained.

In `/admin`, enter today's and this month's **existing website-project Meta
costs**, including usage before this rollout, acknowledge verification, and choose
**Initialize paused budget**. Enter zero only after verifying no attributable
spending. Initialization refuses any existing or partial state. There is no reset
button. After data loss: keep samples active, reconstruct a conservative baseline
from Meta billing and unresolved requests, repair under operator supervision,
and retain historical totals; never delete counters to regain allowance.

The dashboard shows reserved/charged totals and `warning` at 80%, `exhausted` at
100%. A request may be denied below 100% if its maximum reservation cannot fit.
These thresholds appear in the authenticated dashboard; no external notifications
are configured. The pause button changes shared Redis state immediately for new
admissions and is checked again between token counting and inference. It cannot
cancel a generation already sent. If Redis/control access is unavailable, revoke
the provider key to stop all use.

## Data privacy and logging

Tutor Contributor mode allows Meta to use questions/replies for training; the
learner must acknowledge this before a live session is issued. Admin drafts use
Standard mode. Email/phone scrubbing is best-effort, not comprehensive PII removal.
Keep fictional-data reminders; do not submit private participant information.

Audit events include request/reservation IDs, task/model, tokens, reserved/charged
amounts, and denial reason. They exclude prompts, generated text, cookies, keys,
challenge tokens, and raw IPs. Hashed IP quota keys expire within 48 hours; session
records expire in 24 hours. Do not add content to logs when debugging failures.

## Verification and activation checklist

Run from `website/` with Node 24 and an installed Redis server:

```sh
npm ci
npm run verify:ai:types
npm run verify:ai
npm run build
```

For a Redis binary outside PATH, use `REDIS_SERVER=/absolute/path/redis-server
npm run verify:ai`. The test starts an isolated localhost Redis with persistence
disabled and mocks every Meta/Turnstile call; it never uses production credentials
or touches a remote database. It covers strict bodies, auth, bot replay/expiry,
shared quotas, concurrent budget boundaries, outages, settlement idempotency,
Chicago DST/calendar rollover, and secret-free audit records.

1. Deploy with `AI_LIVE_ENABLED=false`; confirm public sample practice and 401/403
   for anonymous triage/control calls. Check desktop and mobile, Spanish/English.
2. AI and session calls use explicit `/api/ai-assist` and `/api/ai-session`
   routes. Their original `/.netlify/functions/...` aliases must not execute;
   test them as well to prevent bypassing path-level platform protection.
   Verify Netlify deploy logs list both code-based rate rules. Keep named function
   configuration as `export const config: Config = { ... }`: CLI 27.4.2 silently
   ignores a named initializer wrapped in `satisfies Config`. The installed
   deploy parser was checked directly for both rules during this rollout.
   Rules that fail
   validation may not fail the build, so a successful build alone is insufficient.
3. Finish owner setup, initialize the paused ledger from existing spending,
   verify pricing, then set the production Functions flag to `true` and redeploy.
   Live remains paused in Redis until the admin chooses **Enable protected live AI**.
4. Perform one controlled live request per task and verify usage/reconciliation.
   Use test keys and mocks for load tests; do not spend real money to simulate abuse.
5. Confirm the shared pause stops new inference. Leave live paused if any provider,
   billing, authentication, token-bound, or deployed-rule check fails.

A manual deploy can be replaced by the next production-branch Git deploy. Commit
and merge these changes through the normal workflow before any later production
push, or lock publishing until that work is done.

## Official references

- [Meta pricing and data-use modes](https://dev.meta.ai/docs/pricing-rate-limits)
- [Meta token preflight](https://dev.meta.ai/docs/token-counting)
- [Meta Responses API](https://dev.meta.ai/docs/protocols/responses)
- [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Netlify rate rules and deployment verification](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)
- [Netlify automatic recharge](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/configure-auto-recharge/)
- [Upstash Redis REST API](https://upstash.com/docs/redis/features/restapi)

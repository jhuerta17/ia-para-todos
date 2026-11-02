# AI practice: simple admin switch

The current version uses **no Redis and no Cloudflare/Turnstile**. It has a
shared on/off switch and basic hardcoded request limits. Live AI starts **off**.

Deployed on 2026-11-02:
[production deployment](https://app.netlify.com/projects/ia-para-todos-jh/deploys/6ae8cbebfc463086c93dd33d).
Validation passed: 12 offline handler scenarios, 22 desktop/mobile browser checks,
function type checks, and the build. Production checks confirmed the saved switch
reads as paused, tutor replies are samples, anonymous switch writes receive 401,
and the old bot-session endpoint returns 404. No paid inference was used.

## Admin controls

Open `/admin` → **AI practice**:

- **Turn live AI on** lets public practice and admin drafts call Meta.
- **Turn live AI off** switches both to labeled sample replies.
- **Test tutor reply** sends a fixed, short Spanish question through the exact same
  tutor handler as courses, respecting the saved switch and limits. Unlike the
  catalog check, this generates one AI response and uses the provider allowance.
  Its copyable report distinguishes a real answer from sample fallback and names
  the generation model, token limit, reasoning effort, and failure reason.
- **Refresh status** reads the saved switch again.
- **Check AI connection** tests the saved key and configured models using Meta's
  read-only model catalog; it generates no AI response and does not change the switch.
  Use **Copy connection report** to share the status, provider error, model names,
  and timestamp for troubleshooting. The report excludes the API key.

If the switch is on but replies are samples, check the connection. A configured
key means a value exists, not that Meta accepts it. `authentication_failed` means
Meta returned 401/403: replace `META_MUSE_API_KEY` with a valid Meta Model API key
in this site's production Netlify environment, then redeploy. Never paste the key
into chat. The tutor now explicitly explains live connection failures, and safe
logs distinguish authentication, rate limiting, empty output, and output limits
without including provider error bodies or private messages.

The switch is stored in Netlify's built-in Blobs service, in the site-wide
`ai-live-control-production` store at key `state`. No separate service/account or
setup is needed. Only an authenticated Netlify Identity admin can write it;
preview and local environments cannot change production state. Strong reads make
a completed change visible to the next request across server instances and
deployments. A generation already sent to Meta may still finish after turning it
off. If the setting is missing or unreadable, practice uses samples.

Blobs stores **only the setting**, not usage counters, balances, or conversations.
The dashboard does not display spending totals or promise a dollar budget.

## Hardcoded limits

| Limit | Value |
|---|---|
| Live requests per IP, per running server instance | 20 / rolling minute; 100 / America/Chicago calendar day |
| Active provider calls per instance | 3 total; 1 per IP |
| Netlify path throttle | 60 requests/minute per IP/domain on AI and status endpoints |
| Incoming body | 32 KiB, checked while reading |
| Input and history | 2,000 characters per turn; last 6 history turns |
| Generated response | 1,600 tokens maximum, including reasoning; minimal reasoning effort |
| Provider timeout | 20 seconds; no automatic retries |

**These are best-effort limits, not hard spending caps.** Counters live in server
memory. New instances, restarts, deployments, and multiple instances can reset or
multiply the effective allowance. Shared networks share an IP allowance.
There is no enforced $1/day or $10/month limit, no bot check, and no persistent
anonymous session quota. Set any available provider billing limit separately if
you need one. Hosting costs are also separate.

## Provider and privacy

The only provider endpoint is `https://api.meta.ai/v1/responses`, selected in
server code. Public tutor uses `muse-spark-1.3-contributor`; admin drafting uses
`muse-spark-1.3` (Standard mode). Tools are disabled and response storage is off.

Before live tutor practice, learners acknowledge that Contributor mode allows
Meta to use their questions/replies for model training. Keep fictional-data
reminders. Emails and phone-like numbers are scrubbed before sending, but this
does not remove every kind of personal information. Prompts, replies, raw IPs,
credentials, and cookies are not logged. Metadata logs include task/model, token
usage when returned, and response/denial reasons.

## Configuration

Only these production environment variables are needed:

| Variable | Purpose |
|---|---|
| `META_MUSE_API_KEY` | Existing Meta key, server-side only |
| `AI_ALLOWED_ORIGINS` | Exact allowed HTTPS origins, comma separated; currently `https://ia-para-todos-jh.netlify.app` |

`AI_LIVE_ENABLED`, pricing-verification variables, Redis variables, Turnstile
variables, and IP-hashing secrets are no longer used. The saved admin switch is
the source of truth. No pricing verification or budget initialization is required
to operate the toggle. Local development and previews always use samples.

On the current Netlify plan, granular Functions-only environment scopes require
an upgrade; the existing key is production-only with the plan's supported scopes.
No account upgrade or external service was purchased. Rotate/revoke the old Meta
key when practical: earlier immutable deployments can retain previous credentials.
An environment change alone does not revoke a provider key.

## Endpoints and tests

- `GET /api/ai-status`: public live/sample status, no secrets.
- `POST /api/ai-assist`: tutor input and admin drafts; triage requires admin auth.
- `GET/POST /.netlify/functions/ai-control`: authenticated admin read and
  `{ "action": "enable" | "pause" }` updates.

The old `ai-session` route and bot-token workflow are removed. Tutor requests
include `acknowledged: true` after the disclosure is accepted. This acknowledgement
is not authentication or bot protection. User-controlled model/URL overrides are
rejected. Replies retain `{ reply, demo, reason?, remaining?, retryAt? }`.

From `website/`:

```sh
npm run verify:ai
npm run verify:ai:types
npm run build
```

Tests mock the shared switch and provider. They need no Redis installation,
external credentials, or paid AI calls. They check on/off behavior across handlers,
admin authorization, local limits and their reset behavior, payload validation,
privacy acknowledgements, failure fallback, and secret-free logs.

Named rate configuration must use `export const config: Config = { ... }`;
Netlify CLI 27.4.2 ignores named initializers wrapped in `satisfies Config`.

A manual production deploy can be replaced by the next push to `main`. Include
these source changes before the next production push. Leave the saved switch off
until you want to offer live practice; no live provider call is needed to test
sample mode.

The initial 400-token generation cap could be exhausted by Muse Spark's internal
reasoning before it produced visible text (`provider_output_limit`). Generation
now uses `reasoning.effort: minimal` and a bounded 1,600-token total; the short
Spanish/English answer instructions remain. Catalog access alone does not verify
that generation succeeds. Use Test tutor reply after the Git-triggered deploy.

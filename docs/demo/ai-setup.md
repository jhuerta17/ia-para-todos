# AI Setup — Muse API

> **DRAFT:** Demo-sprint wiring notes, 2026-10-30. Endpoint and model
> defaults come from public third-party reports, not verified
> official docs — confirm them in the Meta developer dashboard
> before relying on live answers.

## What is wired

One serverless proxy, `website/netlify/functions/ai-assist.mts`,
serves both AI surfaces. Keys never reach the browser.

- **Public tutor** (`task: 'tutor'`) — Spanish-first beginner tutor
  embedded on activity pages. System prompt enforces simple words,
  invented examples only, PII reminders, and verification teaching.
- **Inbox triage** (`task: 'triage'`) — short Spanish/English draft
  replies for inbox messages. Never promises dates, jobs,
  certifications, or outcomes.

## Environment variables (Netlify → Site settings → Environment)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `META_MUSE_API_KEY` | yes, for live | — | Bearer key from the Meta developer dashboard |
| `META_MUSE_API_URL` | no | `https://api.meta.ai/v1` | Reported Model API base; verify officially |
| `META_MUSE_MODEL` | no | `muse-spark` | Model id; check the dashboard for the current one |

Set the key, redeploy (functions read env at deploy), and both
surfaces switch from labeled samples to live answers. No key, no
account, no failure: the proxy answers `demo: true` samples and the
UI labels them as examples.

## Guardrails (in the proxy)

- Input capped (2000 chars), history capped (last 6 turns), output
  capped (400 tokens, trimmed to 2000 chars).
- Best-effort PII scrub (emails, phone-like numbers) before any
  upstream call; the tutor prompt additionally refuses to repeat
  personal data.
- Per-instance per-IP rate limit: 20 requests/minute.
- 20s upstream timeout; any failure falls back to a labeled sample
  instead of erroring.
- Token usage logged per call (`prompt`/`completion`) for cost
  tracking in the function logs.

## Production hardening (after the demo)

- Verify the base URL, model id, auth scheme, and pricing against
  official Meta docs; pin what you verify here.
- Put the triage task behind admin auth (it currently shares the
  public rate-limited endpoint).
- Consider a persistent (Redis/Blobs) rate limit and per-day spend
  cap before announcing the tutor widely.
- Review logs for PII leakage and prompt-injection attempts after
  the first real traffic.

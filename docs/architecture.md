# Platform connections and security

> **SOURCE REVIEW — November 4, 2026:** Describes checked-in implementation, not an
> independent security audit or proof of deployment. See [readiness](readiness.md)
> for live verification and remaining evidence.

## Request and data flow

```text
Browser: Angular public site / student portal / admin portal
  ├─ Netlify Identity: signup, confirmation, recovery, shared session
  ├─ Netlify Forms: public participation, collaboration, newsletter submissions
  └─ Netlify Functions: authorization and server-side application logic
       ├─ Neon PostgreSQL: private portal and workshop records
       ├─ Meta Muse Responses API: bounded AI generation
       ├─ Netlify Blobs: shared production live-AI switch
       └─ Netlify API: admin-only access to form submissions
WhatsApp Cloud API → signed webhook → Functions → same workshop database
Functions → WhatsApp Cloud API → approved test recipients only
Scheduled Function → retention cleanup and Identity-deletion retries
```

The public site is prerendered Angular. Portal/admin pages are data-free shells;
private records load through authenticated APIs. Portal routes are noindex and
excluded from the sitemap, but indexing rules are not access controls.

## Connected services

| Service | Responsibility | Data boundary |
| --- | --- | --- |
| Netlify hosting and Functions | Public pages, APIs, scheduled maintenance | Server environment holds credentials; browser receives no database/provider key. |
| Netlify Identity | Credentials, email, display name, email confirmation, recovery, roles | Portal and admin share a browser session; logout affects both. |
| Neon PostgreSQL | Profiles, consent, enrollment/progress, chats/messages, admission and usage ledgers, deletion jobs, workshop sessions/reservations/preparation | Parameterized queries use authenticated user IDs; remote connections verify TLS certificates. |
| Meta Muse | `https://api.meta.ai/v1/responses` | Tutor uses `muse-spark-1.3-contributor`; inbox triage uses `muse-spark-1.3` Standard; admin outreach uses Contributor. Tools disabled and response storage requested off (`store:false`). |
| Netlify Forms | Participation, collaboration, newsletter intake | Private contact submissions; admin inbox lists them through a server-held Netlify token. Not the student/reservation database. |
| Netlify Blobs | Strongly read production live-generation setting | Only the on/off setting; no chats, balances, or usage counters. |
| WhatsApp Cloud API | Workshop discovery and registration links | Test-only recipient allowlist; database stores hashed event/sender identifiers and temporary session selections, not a general messaging CRM. |

Contributor mode permits Meta training use of prompts/replies. `store:false` does
not cancel Contributor terms or prove immediate provider deletion. Learners accept
an explicit disclosure; only fictional examples should be sent. Outreach also
requires acknowledgement and uses public workshop facts. Admin output is a draft
for human review; the AI flow does not automatically publish or send it.

## Authentication and authorization

- Identity provides verified sessions. The server derives record ownership from
  the authenticated subject rather than accepting a browser-provided owner ID.
- Student profile/data access requires confirmed email. Account acknowledgement
  covers reservations/preparation; courses and saved practice additionally require
  the current versioned learning/Contributor consent.
- Identity signup hooks reserve pilot admission and assign student roles.
  User-editable metadata cannot grant `admin`.
- Admin functions verify the role on each request; app guards and configured
  Netlify edge rules also protect listed dashboard routes. Do not treat a hidden
  link or a client guard as sufficient authorization.
- Portal and reservation mutations require exact same origin; public/admin AI
  uses `AI_ALLOWED_ORIGINS`. Endpoints validate methods, body sizes, and inputs.
- Private JSON responses use `Cache-Control: no-store`. Site headers include
  `nosniff`, frame denial, referrer policy, and restricted browser permissions.
- Session persistence uses browser storage and an Identity cookie. Use a private
  browser on shared devices and sign out afterward. This is not a claim of an
  HttpOnly-only session architecture or end-to-end encryption.

## Limits and safe failure

Student admission is capped at 25 active/reserved non-admin seats. Unconfirmed
reservations expire after 24 hours. Database transactions enforce 20 admitted
live requests per student per UTC day and a shared $25 per UTC month application
ledger. Costs are reserved before calls and reconciled from returned usage;
unknown costs stay reserved. Request IDs prevent duplicate generation for replays.
The configured model and verified positive input/output prices are required.

Public tutor/admin AI uses per-instance limits: 20 live requests per rolling
minute and 100 per America/Chicago day per IP, three concurrent calls total and
one per IP. Restarts and multiple instances can reset/multiply those allowances;
they are not a durable global spending cap. Student limits do not cap public AI,
hosting, database, email, or provider price changes.

The shared admin pause, production context, key, consent, and applicable portal
gates must permit generation. Missing configuration, exhausted allowances, provider
failure, or pause yields labeled samples where handled. Calls have a 20-second
timeout, no automatic provider retry, a 2,000-character input limit, and a
1,600-token generation ceiling including reasoning. Catalog success alone does
not prove generation, pricing, or delivery works.

## Retention, reservations, and deletion

- Saved chats expire 30 days after creation; expiry blocks reads immediately.
  Daily maintenance runs at 04:00 UTC and purges expired records.
- Reservation contacts expire 30 days after session end or session/individual
  cancellation, whichever is first. Reservations use preferred name plus email
  or phone; they are not identified attendance records.
- Guest management tokens are private capabilities carried in URL fragments;
  only their SHA-256 hashes are stored. Anyone holding the link can manage that
  reservation. Linking to an account is explicit, never based on matching contacts.
- Account-deletion requests remove linked application data and disable portal
  access immediately; maintenance retries Identity deletion. Minimal deletion
  markers and aggregate monthly usage remain. Monitor incomplete deletion jobs;
  HTTP 202 means requested, not completed across services.
- Pattern-based email/phone scrubbing is incomplete anonymization. Do not log
  prompts, replies, tokens, contact details, or secrets. Provider backup retention
  requires separate review; local deletion cannot reverse Contributor training use.

## WhatsApp test boundary

The handler verifies Meta webhook HMAC signatures, expected phone ID, event age,
and approved recipients. It durably claims message IDs before sending to avoid
duplicate responses; ambiguous failures are not automatically retried. Event
hashes and selections expire and are removed by maintenance.

WhatsApp and the public agenda query the same published future workshop rows.
Messages show up to five sessions and website registration links; bookings occur
on the website. Configuration status is admin-only and explicitly does not prove
message delivery. This is not unrestricted public production messaging.

## Operations and evidence

Production deploys run reviewed database migrations before the application build.
Migration hashes, advisory locking, and per-file transactions guard schema changes.
Use separate staging credentials and Identity users; never copy participant data
into fixtures. No secrets or participant records belong in this public repository.

See [student operations](operations/student-portal.md),
[workshop operations](operations/workshop-bookings.md),
[AI setup](demo/ai-setup.md), [security reporting](../SECURITY.md), and
[readiness](readiness.md). Backup recovery, real-email signup, two-user live
isolation, scheduled deletion completion, and current live generation require
operational evidence beyond source review and mocked tests.

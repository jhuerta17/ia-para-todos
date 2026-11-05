# Current readiness and evidence

> **REVIEWED — November 4, 2026:** Documentation/source review. Unchecked items
> are remaining evidence or maintainer decisions, not claims of completed work.

## What the repository implements

- [x] Bilingual Angular website with public agenda and optional preparation.
- [x] Adult student signup/confirmation/recovery flow, private progress and saved practice.
- [x] Server-side Identity/ownership/role checks, consent, quotas, retention and deletion jobs.
- [x] Database-backed workshop publication/reservations and private guest management links.
- [x] Meta Muse tutoring, inbox drafts, and outreach drafts, with labeled sample fallbacks.
- [x] Restricted WhatsApp test webhook using the same workshop schedule.
- [x] Judge links, registration steps, architecture, and security boundaries documented.

Implementation is not proof that production settings, email delivery, or all
integrations currently work. Historical test/deploy reports retain their original
dates in operational documents; do not present them as fresh end-to-end evidence.

## Live read-only checks

Documented deployment: [IA Para Todos](https://ia-para-todos-jh.netlify.app/).
This review attempts only public page/status reads; it creates no accounts,
reservations, submissions, messages, or paid AI requests.

Checks on November 4, 2026 used certificate-verified system HTTP requests and
followed normal trailing-slash redirects. Initial restricted-network/Python
certificate errors were overcome with the system HTTP client; they did not
indicate a site outage.

| Check | Observed result |
| --- | --- |
| Home and `/en` | HTTP 200 after normal redirects. |
| `/portal/sign-up` and `/portal/sign-in` | HTTP 200 after normal redirects; page delivery only. |
| `/agenda` and `/en/schedule` | HTTP 200 after normal redirects. |
| `/preparacion` and `/en/preparation` | HTTP 200 after normal redirects. |
| `/api/workshops/sessions` | HTTP 200; five published future sessions, local dates November 9, 16, 23, 30 and December 7, 2026. Availability is dynamic; read the agenda. |
| `/api/ai-status` | HTTP 200; `{"live":true,"reason":"ok"}`. Public configuration status only, not a generated answer or proof of student AI readiness. |
| `/.netlify/identity/settings` | HTTP 200; `disable_signup:false`, `autoconfirm:false`: public Identity registration enabled and automatic confirmation disabled. Application gate, seats and actual email delivery remain unverified. |

These reads do not verify browser interactions, a completed signup, private data
persistence, provider generation, bookings, or WhatsApp delivery. No account,
reservation, submission, or message was created and no paid inference was invoked.

## Before judge evaluation

- [x] Confirm public page delivery and read-only status/settings endpoints above.
- [ ] Confirm the deployed commit matches the reviewed source and inspect browser interactions.
- [ ] Confirm Identity open registration, confirmation enabled, `PORTAL_SIGNUP_ENABLED`,
  admission HMAC configuration, migration state, and available pilot seats.
- [ ] With disposable approved accounts, prove real-email signup → confirmation →
  portal; password recovery; sign-out/sign-in; persistence in another browser.
- [ ] Prove two real users cannot read, write, or delete each other's chats/progress;
  verify a student cannot access admin APIs or protected dashboard routes.
- [ ] Check live agenda against confirmed organizer details. Verify guest cancellation,
  explicit account linking, capacity, and manual follow-up using approved test records.
- [ ] Confirm global AI switch, student gate, model/pricing settings, and billing.
  Record a controlled live Meta Muse response separately from sample-mode evidence.
- [ ] Verify the maintenance schedule, retention cleanup, Identity deletion retries,
  completed deletion, and monitoring for jobs older than 24 hours.
- [ ] Review backup retention/recovery and provider data handling; document an owner
  and tested recovery procedure privately.
- [ ] If presenting WhatsApp, verify delivery from an approved recipient and matching
  agenda links; label it a restricted test. Configuration alone is insufficient.

These checks require separate operational work; this documentation refresh does
not enable gates, modify accounts, migrate production, or change the AI switch.

## Documentation and organizational follow-up

- [ ] Confirm organizational/legal status and formal partnerships with evidence
  before changing “community initiative” or publishing accomplishments.
- [ ] Validate curricula/accessibility through real workshops; publish only anonymous
  aggregate outcomes. Admin demo figures are never real impact evidence.
- [ ] Establish a dedicated private security-reporting channel and incident owner;
  until then use the private maintainer process in [SECURITY](../SECURITY.md).
- [ ] Resolve proposed licensing approval and clarify website code licensing;
  [LICENSE](../LICENSE) currently scopes MIT software language to scripts/workflows.
- [ ] Confirm the operator's Netlify token permissions/scopes, secret rotation,
  and least-privilege access under the current subscription.
- [ ] Establish storage/access/retention for private operational records outside
  Identity/Neon/Forms; those app services do not settle all organizational storage.

Current instructions: [README](../README.md), [architecture](architecture.md),
[student portal](operations/student-portal.md), [workshops](operations/workshop-bookings.md),
[admin](operations/admin-dashboard.md), and [AI setup](demo/ai-setup.md).

## Documentation validation

The repository validator passed against a clean snapshot of repository-owned files,
including these new guides: all 78 repository Markdown files passed relative-link,
credential-pattern, completeness, empty-file and placeholder checks; required files
and shell syntax checks also passed. `git diff --check` passed. Installed dependencies and unrelated untracked files
are excluded. A direct run in a development checkout also scans `node_modules` and
reports third-party README/link/placeholder failures; this is a validator scope
limitation, not a failure of the repository documentation.

- [ ] Follow-up: restrict the validator to repository-owned files so its normal
  command works consistently after dependencies are installed. No script changes
  were included in this documentation-only refresh.

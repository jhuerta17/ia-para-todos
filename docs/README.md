# Documentation Index

Start with the [main README](../README.md) for the live site and judge signup.
Documentation distinguishes current source behavior, separately verified production
evidence, historical implementation records, and provisional organizational plans.

## Current platform guides

- [Readiness and remaining evidence](readiness.md) — current verification status and unresolved work.
- [Architecture, connections and security](architecture.md) — services, data flow, access controls and limits.
- [Student portal](operations/student-portal.md) — registration, consent, quotas and deletion.
- [Workshop reservations](operations/workshop-bookings.md) — live scheduling, guest links and WhatsApp test discovery.
- [Admin dashboard](operations/admin-dashboard.md) — roles, Forms inbox and synthetic demo data.
- [Meta Muse setup](demo/ai-setup.md) — live switch, models, privacy and best-effort public limits.
- [Judge walkthrough](demo/demo-script.md) — five-minute presentation flow.
- [Website development](../website/README.md) — actual local/build/verification commands.
- [Security policy](../SECURITY.md) — private reporting and supported deployment.

## Structure

| Directory | Contents |
|---|---|
| `organization/` | [overview.md](organization/overview.md) · [mission-vision.md](organization/mission-vision.md) · [values.md](organization/values.md) · [target-audience.md](organization/target-audience.md) · [faq.md](organization/faq.md) |
| `strategy/` | [problem-statement.md](strategy/problem-statement.md) · [theory-of-change.md](strategy/theory-of-change.md) · [risks-and-mitigation.md](strategy/risks-and-mitigation.md) · [growth-strategy.md](strategy/growth-strategy.md) · [sustainability.md](strategy/sustainability.md) · [partnerships.md](strategy/partnerships.md) |
| `nonprofit/` | [formation-options.md](nonprofit/formation-options.md) · [governance.md](nonprofit/governance.md) · [compliance-checklist.md](nonprofit/compliance-checklist.md) · [conflict-of-interest.md](nonprofit/conflict-of-interest.md) |
| `roadmap/` | [90-day-pilot.md](roadmap/90-day-pilot.md) · [milestones.md](roadmap/milestones.md) · [future-initiatives.md](roadmap/future-initiatives.md) |
| `operations/` | [workshop-checklist.md](operations/workshop-checklist.md) · [venue-requirements.md](operations/venue-requirements.md) · [facilitator-guide.md](operations/facilitator-guide.md) · [volunteer-onboarding.md](operations/volunteer-onboarding.md) · [outreach-process.md](operations/outreach-process.md) · [budget-template.md](operations/budget-template.md) · [impact-measurement.md](operations/impact-measurement.md) |
| `safety/` | [responsible-ai.md](safety/responsible-ai.md) · [privacy-guidelines.md](safety/privacy-guidelines.md) · [participant-safeguarding.md](safety/participant-safeguarding.md) · [accessibility.md](safety/accessibility.md) |
| `brand/` | [brand-guidelines.md](brand/brand-guidelines.md) · [voice-and-tone.md](brand/voice-and-tone.md) · [messaging.md](brand/messaging.md) |
| `demo/` | [scope.md](demo/scope.md) · [honesty-audit.md](demo/honesty-audit.md) · [ai-setup.md](demo/ai-setup.md) · [demo-script.md](demo/demo-script.md) · [next-steps.md](demo/next-steps.md) |

Top-level companions (outside `docs/`): [`workshops/`](../workshops/README.md) (curricula index) · `templates/` ([partnership-outreach](../templates/partnership-outreach.md) · [volunteer-interest](../templates/volunteer-interest.md) · [workshop-feedback](../templates/workshop-feedback.md) · [venue-assessment](../templates/venue-assessment.md) · [pilot-retrospective](../templates/pilot-retrospective.md)) · [`scripts/`](../scripts/validate-docs.sh) (`bootstrap.sh`, `validate-docs.sh`) · [`.github/`](../.github/PULL_REQUEST_TEMPLATE.md) (issue/PR templates, docs-check workflow) · `website/public/` (shipped website assets and applicable third-party notices).

## Website implementation

- [Spanish website content draft](website-content-draft.es.md) — historical provisional copy; current rendered content lives in the application.

## Documentation conventions

All contributors and future setup phases must follow these:

1. **Descriptive Markdown** — ATX headings (`#`), fenced code blocks with language tags, tables for comparisons, blank lines around lists and headings. Wrap prose at ~100 columns where practical.
2. **Relative links** — always link repository files relatively (e.g., `organization/mission-vision.md` from here, `../README.md` upward). Never hardcode absolute GitHub URLs for in-repo navigation.
3. **Status labels** — state reliability up front; date source reviews and live evidence separately. Historical records must link to current guides. Planning docs retain their provisional labels:
   - `> **DRAFT:**` — untested or provisional content.
   - `> **DECISION NEEDED:**` — a choice the project has not made yet.
   - `> **VERIFY:**` — a fact that must be checked against an official source.
4. **Spanish-first participant content** — anything workshop participants read is written in Spanish first; English versions follow where feasible. Organizational docs may lead in either language.
5. **Plain, beginner-friendly language** — define technical terms on first use; no unexplained jargon.
6. **Public-safe by default** — no personal data, credentials, or invented organizational details (see below).
7. **No dead links** — never link to a file that does not exist yet. Refer to planned docs as plain text (e.g., `` `roadmap/90-day-pilot.md` (planned) ``) until they land.

## Commenting and review notes

- Decision rationale belongs in the coordinating issue or pull request, not in long comment threads inside docs.
- When updating an index table, keep rows sorted as listed above and flip `Planned` → linked title once the doc exists.

## Privacy notice

This is a **public repository**. Documentation must never contain participant records, contact information, survey responses, secrets, or confidential partnership details. Placeholders such as `contact@example.org` are examples only and must always be labeled as such.

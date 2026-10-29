# Documentation Index

Welcome to the IA Para Todos documentation. The repository is in **Part 5 of a seven-part setup**: organization, strategy, nonprofit, operations, safety, workshops, and templates exist; roadmap and brand sections arrive in later phases.

## Structure

| Directory | Contents |
|---|---|
| `organization/` | [overview.md](organization/overview.md) · [mission-vision.md](organization/mission-vision.md) · [values.md](organization/values.md) · [target-audience.md](organization/target-audience.md) · [faq.md](organization/faq.md) |
| `strategy/` | [problem-statement.md](strategy/problem-statement.md) · [theory-of-change.md](strategy/theory-of-change.md) · [risks-and-mitigation.md](strategy/risks-and-mitigation.md) · [growth-strategy.md](strategy/growth-strategy.md) |
| `nonprofit/` | [formation-options.md](nonprofit/formation-options.md) · [governance.md](nonprofit/governance.md) · [compliance-checklist.md](nonprofit/compliance-checklist.md) · [conflict-of-interest.md](nonprofit/conflict-of-interest.md) |
| `roadmap/` | Planned — 90-day pilot plan, milestones, future initiatives |
| `operations/` | [workshop-checklist.md](operations/workshop-checklist.md) · [venue-requirements.md](operations/venue-requirements.md) · [facilitator-guide.md](operations/facilitator-guide.md) · [volunteer-onboarding.md](operations/volunteer-onboarding.md) · [outreach-process.md](operations/outreach-process.md) · [budget-template.md](operations/budget-template.md) · [impact-measurement.md](operations/impact-measurement.md) |
| `safety/` | [responsible-ai.md](safety/responsible-ai.md) · [privacy-guidelines.md](safety/privacy-guidelines.md) · [participant-safeguarding.md](safety/participant-safeguarding.md) · [accessibility.md](safety/accessibility.md) |
| `brand/` | Planned — brand, voice-and-tone, and messaging guidelines |

Top-level companions (outside `docs/`): [`workshops/`](../workshops/README.md) (curricula index) · `templates/` ([partnership-outreach](../templates/partnership-outreach.md) · [volunteer-interest](../templates/volunteer-interest.md) · [workshop-feedback](../templates/workshop-feedback.md) · [venue-assessment](../templates/venue-assessment.md) · [pilot-retrospective](../templates/pilot-retrospective.md)) · `assets/`, `scripts/`, `.github/` (planned in later phases).

## Documentation conventions

All contributors and future setup phases must follow these:

1. **Descriptive Markdown** — ATX headings (`#`), fenced code blocks with language tags, tables for comparisons, blank lines around lists and headings. Wrap prose at ~100 columns where practical.
2. **Relative links** — always link repository files relatively (e.g., `organization/mission-vision.md` from here, `../README.md` upward). Never hardcode absolute GitHub URLs for in-repo navigation.
3. **Status labels** — every doc states its reliability up front:
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

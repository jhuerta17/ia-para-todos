# Privacy Guidelines

> **DRAFT:** Proposed binding rules for this public repository and all project activities. Effective immediately as team policy; formalize further if the initiative incorporates.

## The core principle

**This repository is permanently public.** Assume every committed file is readable forever by anyone. Design accordingly: if information would be harmful, embarrassing, or merely inappropriate in public, it never enters the repo — no exceptions, no "temporary" commits, no "I'll remove it later."

## Never commit (non-exhaustive)

- Participant names, contact details, signatures, photos, or survey responses.
- Volunteer surnames, contact details, or availability records.
- Host/partner contact names, phone numbers, emails, addresses, or meeting notes containing them.
- Registration lists, attendance lists with identities, or headcounts tied to names.
- API keys, passwords, tokens, credentials, or connection strings.
- Financial accounts, receipts with identifiers, donor identities, or transaction records.
- Private agreements, insurance documents, or legal correspondence.
- Completed venue assessments, filled feedback tallies with identifiers, or retrospective notes naming people.
- Photos of participants (or minors, ever) without appropriate permissions — prefer taking none.

## Placeholders and examples

- Use obviously fake placeholders: `contact@example.org`, `[YOUR NAME]`, "Cocina Doña Rosa" (fictional business), invented personas in curricula.
- Label every placeholder as an example at first use. Never invent realistic-looking contacts that could be mistaken for real ones.

## Data minimization in operations

- **Attendance:** headcount only; no names required to attend a workshop.
- **Feedback:** anonymous forms (see [workshop-feedback.md](../../templates/workshop-feedback.md)); tally to aggregates within a week; store paper privately; never scan raw forms into the repo.
- **Volunteers:** collect only what's needed to coordinate (first name, one contact channel, availability); store privately; delete when no longer needed or on request.
- **Partners:** keep correspondence and contact details in private files; the repo holds only templates and anonymized lessons.
- **30-day follow-up:** anonymous group signals via host channels (e.g., show of hands at a next event), never tracked individuals.

## Where private operational data lives

> **DECISION NEEDED:** The private storage solution (encrypted drive, access list, retention schedule) has not been selected. Until it is: paper in a locked location, digital in a password-protected folder with minimal sharing, and nothing in this repository or in personal chat histories beyond coordination.

## Breach response

1. Stop the exposure (delete, revoke, or restrict immediately).
2. Assess what was exposed and to whom; preserve evidence privately.
3. Notify affected people promptly and honestly; help them protect themselves (e.g., rotate exposed credentials).
4. If secrets touched git history, assume compromise: revoke and rotate — rewriting history does not un-expose.
5. Record the incident privately, fix the process, and share only anonymized lessons.

## Participant-facing privacy teaching

Every workshop teaches: fictional practice data only; what never to share with AI tools; password and scam basics; photo/location caution. Standards in [responsible-ai.md](responsible-ai.md); hands-on practice in the workshop curricula.

## Related documents

- [responsible-ai.md](responsible-ai.md) · [participant-safeguarding.md](participant-safeguarding.md)
- [../../CONTRIBUTING.md](../../CONTRIBUTING.md) (privacy rules for contributors)

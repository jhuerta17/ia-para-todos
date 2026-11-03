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

## Adult student portal exception

The free, adults-only student portal is an explicitly approved exception to the
workshop rule of anonymous aggregates. Netlify Identity holds login credentials,
email, and the chosen display name. Private Neon Postgres holds the Identity
user ID, adult/privacy attestation, enrollments, lesson completion, and saved
practice chats. Nothing from those records belongs in this public repository.

Chats and their messages expire 30 days after creation, are excluded from reads
at expiry, and are physically purged daily. Students may delete them sooner.
Course progress remains until account deletion. Requests for account deletion
immediately remove saved chats/progress and disable portal access; scheduled
retries remove the Identity account. Minimal user-ID deletion markers remain to
reject stale credentials; aggregate monthly spending and recent daily counters
are operational controls, not conversation logs. Provider backups have their own
retention; verify their settings before opening the pilot.

Use fictional examples. Scrub common email/phone patterns before both storage
and model transmission, without claiming that this removes all personal data.
Live Meta Contributor practice requires a separate acknowledgement: Meta may use
prompts and replies to train its models. Local deletion cannot undo provider use.
Do not log prompts, replies, email addresses, or authentication tokens.

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

## Workshop reservation exception

Optional workshop reservations may collect a preferred name and either email or
phone in private PostgreSQL, with adult and reservation-privacy acknowledgement.
This does not require a student account or AI-practice consent. Use contact details
only for booking coordination and manual follow-up, never identified attendance
or marketing. Guests manage bookings with a private capability link; store only
its hash, never log it, and never match contacts to attach a student account.

Reservation personal data expires 30 days after session end, session cancellation,
or reservation cancellation, whichever comes first. Expired records are denied
immediately and purged daily. Account deletion clears linked booking details and
releases seats. Keep only anonymous session totals afterward. See
[workshop booking operations](../operations/workshop-bookings.md).

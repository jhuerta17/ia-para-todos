# Security Policy

## Scope

This policy covers the `ia-para-todos` website, Netlify Functions, student and
admin portals, workshop reservations, AI/WhatsApp integrations, documentation,
curricula, scripts, and automation. Source review is not an independent audit;
current operational verification is tracked in [readiness](docs/readiness.md).

## Implemented controls and limits

See [architecture and data flow](docs/architecture.md) for authenticated ownership,
confirmed-email and consent checks, administrator roles, origin validation,
server-held secrets, certificate-verified database connections, and private
`no-store` API responses. Guest reservation links are private capabilities.

Student quotas use durable database ledgers; public tutor limits are best effort
per running instance. Scrubbing common email/phone patterns is not full
anonymization. Meta Contributor permits training use; local deletion does not
reverse provider processing. Backups and Identity deletion completion require
separate operational review. Neither application quotas nor provider settings
establish a blanket guarantee of security or total spending.

> This repository must NEVER contain participant data, credentials, secrets, financial information, or confidential partnership records. See [privacy-guidelines.md](docs/safety/privacy-guidelines.md).

## Reporting a vulnerability

If you discover a security issue — for example, accidentally committed secrets or personal data, malicious content in a dependency or workflow, or a weakness in our scripts:

1. **Do not open a public issue** for anything involving real personal data or active credentials.
2. Report it privately to a repository maintainer through an existing private GitHub channel if available (for example, private vulnerability reporting when enabled), or an established private maintainer contact. Do not include sensitive details in a public issue.

> A dedicated security contact address has not been established yet. The placeholder format for a future contact (NOT a real address) is `security@example.org`. If no private channel is available, open a content-free public request asking a maintainer to establish one; do not post exploit details, records, or credentials. For low-sensitivity repository hygiene (e.g., a suspicious link in docs), a regular public issue is fine.

Include: what and where (file path, commit, URL), steps to reproduce if applicable, and whether you believe real personal data or credentials are exposed.

## What to expect

- Acknowledgment within 5 business days.
- Assessment of severity and impact.
- Remediation: exposed secrets revoked where possible; exposed personal data purged where feasible (assume git history exposure is permanent and rotate credentials).
- Credit to reporters who want it, after resolution.

## Out of scope

- Social engineering of volunteers or participants (tell the event organizers).
- Vulnerabilities in third-party AI tools used in workshops (report to those vendors).
- Curriculum feedback (use the workshop-improvement issue template).
- Legal or compliance questions (see [compliance-checklist.md](docs/nonprofit/compliance-checklist.md) — informational only).

## Supported versions

Only the current `main` source and the current production deployment are supported. Older deployment URLs may remain accessible; revoke compromised credentials rather than relying on a new deploy to remove them.

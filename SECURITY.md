# Security Policy

## Scope

This policy covers the `ia-para-todos` public repository: documentation, curricula, templates, scripts, and automation.

> This repository must NEVER contain participant data, credentials, secrets, financial information, or confidential partnership records. See [privacy-guidelines.md](docs/safety/privacy-guidelines.md).

## Reporting a vulnerability

If you discover a security issue — for example, accidentally committed secrets or personal data, malicious content in a dependency or workflow, or a weakness in our scripts:

1. **Do not open a public issue** for anything involving real personal data or active credentials.
2. Report it privately to a repository maintainer through GitHub.

> A dedicated security contact address has not been established yet. The placeholder format for a future contact (NOT a real address) is `security@example.org`. Until a real channel is published here, contact a maintainer directly via GitHub. For low-sensitivity repository hygiene (e.g., a suspicious link in docs), a regular public issue is fine.

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

Living documentation repository; only the current `main` branch is supported.

<p>
  <img src="website/public/images/brand/ia-para-todos-symbol-color.png" alt="IA Para Todos brand symbol" width="88">
</p>

# IA Para Todos

> **Inteligencia Artificial para Todos. Un Futuro Sin Barreras.**
> *AI for Everyone. A Future Without Barriers.*

A community initiative making AI and digital literacy education accessible to everyone, starting with Spanish-speaking and underserved communities.

**[Leer en español](README.es.md)**

## Visit the live project

**[Open the website](https://ia-para-todos-jh.netlify.app/)** ·
**[Create a student account](https://ia-para-todos-jh.netlify.app/portal/sign-up)** ·
**[Student sign-in](https://ia-para-todos-jh.netlify.app/portal/sign-in)** ·
**[Workshop agenda](https://ia-para-todos-jh.netlify.app/agenda)** ·
[English site](https://ia-para-todos-jh.netlify.app/en)

### Judges: create your own free student account

1. Open **Create a student account**. Use the ES/EN control for your preferred language.
2. Enter your name, your own accessible email, and a password of at least eight characters.
3. Confirm that you are **18 or older** and accept the account/privacy acknowledgement.
   Registration does not itself authorize AI practice.
4. Open the confirmation email (check spam) and follow its link back to the portal.
   If needed, return to **Student sign-in**. Password recovery is available there.
5. Explore workshop reservations and optional preparation. Enter **My courses** or
   **Saved practice** only after reading the separate learning/Meta Contributor consent.
   Meta may use Contributor prompts and replies to train its models; use fictional examples.

No shared credentials are published. Student accounts do not grant administrator access.
Signup requires open Netlify Identity registration, `PORTAL_SIGNUP_ENABLED=true`,
and an available place within the **25-account pilot**. The interface may show a generic
signup failure if registration is closed or the pilot is full; ask the maintainer to
review availability rather than repeatedly registering. A visible signup form alone
is not proof that registration or confirmation-email delivery currently works.

### A short evaluation walkthrough

- **Discover:** browse the agenda and workshop details. Reservations are for real places;
  book only if you intend to attend. Guest booking requires no student account.
- **Prepare:** open `/preparacion` (English: `/en/preparation`); signed-in completion is saved.
- **Learn:** visit `/portal/courses`, enroll, and complete a lesson. Progress uses authenticated APIs.
- **Practice:** visit `/portal/chats`, use an invented example, and check whether the reply is
  labeled live or sample. Saved histories expire 30 days after creation.
- **Manage:** `/portal/account` supports account-deletion requests; individual chats can also
  be deleted. Identity deletion is retried by scheduled maintenance, so a request is not
  proof that every provider copy has already been removed.
- **Admin:** `/admin/sign-in` requires an account with a separately granted `admin` role.
  Admin demo figures are simulated; judges can evaluate the student experience without it.

See the [five-minute walkthrough](docs/demo/demo-script.md),
[system connections and security](docs/architecture.md), and
[current readiness checklist](docs/readiness.md). Live availability and end-to-end
verification are recorded there separately from what the source implements.

## What connects the platform

| Service | Purpose and data |
| --- | --- |
| Angular on Netlify | Bilingual public pages and student/admin interfaces; public routes are prerendered. |
| Netlify Functions | Server-side authorization, reservations, progress, saved practice, AI calls, and maintenance. |
| Netlify Identity | Login credentials, email confirmation/recovery, display names, and account roles. |
| Neon PostgreSQL | Private student progress/chats, consent, reservations, quotas, deletion jobs, and WhatsApp test state. |
| Meta Muse | Tutor: `muse-spark-1.3-contributor`; admin inbox drafts: `muse-spark-1.3`; outreach drafts: Contributor. |
| Netlify Forms | Public participation, collaboration, and newsletter submissions; admin inbox reads through a server-held token. |
| Netlify Blobs | Shared production live-AI on/off setting; no conversation or quota storage. |
| WhatsApp Cloud API | Restricted, approved-recipient test integration; reads the same published workshop schedule. |

### Security and privacy at a glance

The backend checks authenticated identity and record ownership; student APIs require
confirmed email, and learning/practice requires versioned consent. Admin functions
check the `admin` role. Portal/booking mutations check same origin; AI requests use an
explicit HTTPS origin allowlist. Keys and database credentials stay on the server;
remote database connections verify TLS certificates. Private API responses use `no-store`.

Student live practice has database-backed admission, **20 requests per UTC day per
student**, and a shared **$25 per UTC month application ledger** with configured
model prices. Public tutor limits are per server instance and are **best effort**,
not a global spending ceiling. Missing configuration, paused AI, exhausted limits,
or provider errors can produce labeled samples. These controls do not constitute
an independent security audit or cover all platform/provider costs.

Common email/phone patterns are scrubbed from practice text, but this is not full
anonymization. Contributor training use cannot be undone by deleting a local chat.
Guest management links are private capabilities: anyone with the link can manage
the reservation. Keep them private. Details: [security policy](SECURITY.md) and
[privacy guidelines](docs/safety/privacy-guidelines.md).

## Mission

To reduce the digital divide through free, accessible, and practical workshops that empower communities to understand and use artificial intelligence and emerging technologies.

**Misión (español):** *Reducir la brecha digital mediante talleres gratuitos, accesibles y prácticos que ayuden a las comunidades a comprender y aprovechar la inteligencia artificial y las nuevas tecnologías.*

## Community focus

Our focus is **Spanish-speaking adults with limited exposure to artificial intelligence**, particularly Mexican-American and other Hispanic communities in the **Dallas–Fort Worth area, Texas**.

We aim to work with trusted community venues — local churches, public libraries, community centers, schools, nonprofit organizations, workforce development programs, and other accessible spaces. A published venue is not evidence of a formal partnership.

IA Para Todos is an **inclusive, nonsectarian** community education initiative: participation never depends on religious affiliation or background, and workshops contain no religious content.

## Educational programs

The flagship program is a free, beginner-friendly workshop series — also called **IA Para Todos** — starting with:

**"IA Para Todos: Descubre el Poder de la Inteligencia Artificial"**
*Un taller gratuito en español para aprender a usar la inteligencia artificial en tu vida diaria, trabajo y familia.*

Introductory workshops (90–120 minutes each, smartphone-friendly, no paid tools required):

1. **Introducción a la Inteligencia Artificial** — what AI is, what it can and cannot do, first hands-on demonstration.
2. **IA para la Vida Diaria** — messages, translation, schedules, everyday tasks, safe use.
3. **IA para el Trabajo y los Negocios** — professional communication, résumés, productivity, business basics.
4. **IA para Padres y Familias** — how children use AI, misinformation, privacy, digital safety.

Every workshop includes guidance on AI accuracy, privacy, safety, and independent verification. Curricula live under [`workshops/`](workshops/).

## Project status

The repository contains a working website implementation, student/admin portals,
workshop booking, curricula, and Meta Muse integrations. Confirmed future workshop
sessions are defined in a reviewed migration; the live agenda determines what is
currently published and available. Published dates do not prove workshops have occurred.

Use **community initiative**: legal nonprofit status, formal partnerships, delivered
workshops, fundraising, and measured impact are not established by this repository.
Admin demo data is explicitly synthetic. Curricula and organizational plans remain
provisional until validated through real workshops.

Next steps are tracked in the [readiness checklist](docs/readiness.md) and
[90-day pilot plan](docs/roadmap/90-day-pilot.md). See the [documentation index](docs/README.md).

## Repository layout

```text
ia-para-todos/
├── README.md / README.es.md   # Bilingual project overview (you are here)
├── CONTRIBUTING.md             # How to contribute
├── docs/                       # Documentation (organization, strategy, nonprofit,
│                               # roadmap, operations, safety, brand, demo)
├── website/                    # Bilingual site, admin portal, AI tutor, functions
├── workshops/                  # Workshop curricula
├── templates/                  # Outreach, feedback, and planning templates
├── scripts/                    # Repository automation (bootstrap, validation)
└── .github/                    # Issue/PR templates and workflows
```

## Privacy notice

This is a **public repository** — treat every file here as permanently public. We never include participant records, contact information, survey responses, credentials, secrets, or confidential partnership details. Placeholders such as `contact@example.org` are examples only, never real contact information.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. Contributions in Spanish and English are both welcome; participant-facing content is Spanish-first.

## License

The [LICENSE](LICENSE) records a **proposed**, not finally approved, CC BY 4.0 / MIT direction. Third-party assets retain their own licenses, including the dashboard theme, fonts, and imagery; review their notices before reuse.

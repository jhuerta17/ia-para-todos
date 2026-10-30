# Five-Minute Demo Script

> **DRAFT:** Talk track for the demo-sprint showcase, 2026-10-30.
> Timings are guides; the honesty opener is mandatory, not optional.

## 0:00 — Honesty opener (say this first)

> "What you're about to see is a showcase of what IA Para Todos
> *would* look like after six months of running — the site, the
> admin, and the AI tutor all working. Nothing here claims real
> workshops happened: sample data is labeled everywhere, and the
> tracker at the end shows exactly what's done and what's still a
> plan."

## 0:30 — Public site (the program face)

1. Home `/`: free Spanish workshops, phone-first, community framing.
2. `/talleres`: four connected workshops — open one, show the agenda,
   series position ("Taller 2 de 4"), and prev/next navigation.
3. `/historias`: invented examples (labeled) plus the real founder
   story with photo.
4. `/cursos`: the course ladder — free mini-course live, paid tiers
   honestly marked in preparation.

## 2:00 — Lived-in admin (open `/admin`, enable `?demo=1`)

1. Dashboard: six months of intake, trend, and the plans strip.
2. Requests: 227 seeded rows, per-form filters, believable Spanish
   messages with volume growing month over month.
3. Workshops: 8 sessions cycling the real series, rated 89–96%.
4. Impact: reach, volunteers, satisfaction, and confidence curves.
5. Supporters: $119,500 ledger with latest-gift history.
6. Point at the amber banner: "Demo data. Simulated, not real
   operations."

## 3:30 — AI showcase (the flagship)

1. On `/actividades/primer-prompt`, type a prompt into **Practica
   con IA**. Note the greeting, the privacy reminder, and the
   "Respuesta de ejemplo" badge (live answers switch on with one
   API key — see `docs/demo/ai-setup.md`).
2. Back in Requests, press **Draft** on any row: an AI reply draft
   appears with copy/dismiss. Same proxy, same guardrails
   (server-side key, PII scrub, rate limits).

## 4:30 — Plans tracker and close

1. Open `/admin/plans`: 27 demo-sprint plans, all Done, with the
   out-of-scope list showing what saying "no" looks like.
2. Close: "The demo took five days. The real work — outreach,
   pilots, the legal entity — starts from `docs/demo/next-steps.md`,
   and every step after this one gets tracked in this same portal."

## Setup checklist (before presenting)

- Production deploy green; open the site in a fresh browser.
- Admin: sign in, append `?demo=1` once, keep the banner visible.
- Optional: set `META_MUSE_API_KEY` for live tutor answers;
  otherwise the labeled samples carry the demo.
- Have `/admin/plans` loaded for the close.

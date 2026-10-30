# 5-Day Demo Sprint — Scope

> **DRAFT:** Working scope for the demo sprint, locked 2026-10-30. Day
> references are sprint days, not calendar commitments. Any change to
> the out-of-scope list needs an explicit re-lock, not a quiet edit.

## Goal

In five working days, make the public site and admin portal read as a
nonprofit that has been running steadily for six months — a showcase
of what IA Para Todos *would* look like, not a claim that it already
does. Progress is tracked in the admin portal at `/admin/plans`.

## In scope

- **Day 1 — Demo foundation:** locked scope (this doc), demo data
  extended to six months of plausible operations, honesty labels on
  every synthetic figure, plans tracker live.
- **Days 1–2 — Public site polish:** complete workshop, activity, and
  resource pages; stories page with no fake testimonials;
  Spanish-first copy pass.
- **Days 2–3 — Lived-in admin:** inbox, workshops, impact, and
  supporters demo content telling the six-month story.
- **Days 3–4 — AI showcase:** Muse API proxy function, Spanish tutor
  on one activity page, inbox triage drafts, no-key fallback.
- **Day 4 — Courses teaser:** course ladder plus one interactive
  mini-lesson and a working waitlist; no LMS.
- **Day 5 — Launch readiness:** green production deploy, five-minute
  demo script, honest README/docs, real-world next-steps doc.

## Out of scope (parked, not dropped)

- Real outreach to churches, libraries, or partners.
- Legal entity formation, bank accounts, or fundraising.
- Live workshops, cohorts, or scheduled programs.
- Payments, a full LMS, or a WhatsApp bot.

These wait for evidence from a real pilot, per the
[90-day pilot plan](../roadmap/90-day-pilot.md) and
[milestones](../roadmap/milestones.md).

## Honesty rules for the showcase

1. Every synthetic number or story sits behind the demo banner or a
   visible sample/illustrative label.
2. No public page implies workshops happened, partners exist, or the
   organization is formed. See [README](../../README.md) status notes.
3. The demo script (Day 5) opens by stating what the showcase is.

## Definition of done

The sprint is done when every `/admin/plans` item is Done, the
production build and all verify scripts pass, and the demo script
runs end to end without caveats beyond the ones written here.

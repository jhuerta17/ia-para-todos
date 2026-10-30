# Honesty Audit — Demo Sprint

> **DRAFT:** Audit record for the demo sprint, run 2026-10-30. Re-run
> after any copy change that touches claims about operations, status,
> or results.

## Scope

Step `honesty-labels`: confirm every synthetic figure is labeled and
no page claims real operations — no past workshops, partners,
nonprofit status, testimonials, or results.

## Findings (all clean)

1. **Admin demo banner** — rendered by the admin shell
   (`admin-layout.html`) on every admin page, including Plans,
   whenever demo mode is on. Asserted by `verify:admin`.
2. **Stories** — labeled invented examples in both languages
   ("Ejemplos inventados… No son testimonios" /
   "Made-up examples… Not testimonials"). Pinned by postbuild
   check 17.
3. **Photos** — labeled illustrative, not testimonials, on the
   information pages.
4. **Org status** — public copy says "iniciativa comunitaria" /
   "community initiative" only; no nonprofit, 501(c)(3), or
   foundation claims anywhere.
5. **Past results** — no attendance counts, testimonials, donor
   lists, or delivered-workshop claims on any public page.
6. **Scheduling** — no dates, registration, or seat claims; the only
   schedule words are curriculum topics (weekly plans as a learning
   exercise).
7. **Plans tracker** — shows the real roadmap state, not synthetic
   operations data, so it needs no demo label.

## Regression guard

Postbuild check 17 scans every prerendered public page for banned
claim phrases (`501(c)(3)`, testimonial/donor/attendance claims)
and pins the stories disclaimer in both languages. The build fails
if either regresses.

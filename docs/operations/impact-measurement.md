# Impact Measurement

> **DRAFT:** Proposed framework. All targets are experimental hypotheses, not validated benchmarks. No data collected yet.

## Principle

Do not define success by attendance alone. We measure **learning and use**: did participants complete real tasks, gain confidence, and apply anything afterward? And we do it without collecting personal information.

## What we measure

| Metric | Method | When |
|---|---|---|
| Workshop attendance | Headcount at the door (no names) | Day of |
| Practical tasks completed | Facilitator observes + self-report on feedback form | During / end |
| Confidence improvement | Anonymous before/after 1–5 rating | End (recall-based) |
| Satisfaction | Anonymous 1–5 + "most useful / most confusing" | End |
| Follow-up use of AI | Optional anonymous 30-day check via host channel (e.g., "did you use AI again? yes/no") | +30 days |
| Venue/host feedback | Debrief conversation with host contact | Week after |
| Cost per participant | Actuals ÷ attendance (see [budget-template.md](budget-template.md)) | After |
| Volunteer pipeline | Count of trained facilitators and assistants | Ongoing |

## Proposed experimental targets (pilot)

> Hypotheses to test, not promises. Revise after data exists.

- 75% registration-to-attendance rate (if registration is used).
- 80% of participants complete at least one practical task.
- 80% report improved confidence (after > before).
- 50% report using AI again after 30 days.
- 80%+ satisfaction (4–5 out of 5).

Report misses as prominently as hits; a failed target is a curriculum signal, not a failure to hide.

## Privacy-preserving methods

- **Anonymous by design:** feedback forms ([workshop-feedback.md](../../templates/workshop-feedback.md)) ask for no name, address, phone, or demographics beyond optional, broad, self-described items.
- **Aggregate only:** paper forms are tallied into counts and averages; raw forms stored privately, never scanned into the repo.
- **No tracking:** no attendance lists with identities, no follow-up contact without explicit opt-in through the host, no photos of participants without appropriate permissions (prefer none at all).
- **Host reports:** share counts and themes ("14 attended, 11 completed the exercise, top request was more practice time") — never individual responses.

## Learning loop

1. Collect (anonymous forms + facilitator notes + host debrief).
2. Tally within a week; record in [pilot-retrospective.md](../../templates/pilot-retrospective.md).
3. Decide: what changes in the curriculum, checklist, or materials?
4. File changes as issues/PRs; note which pilot evidence motivated each change.

## Related documents

- [workshop-checklist.md](workshop-checklist.md) (Phase 6) · [budget-template.md](budget-template.md)
- [../strategy/theory-of-change.md](../strategy/theory-of-change.md) (outcomes this framework tests)

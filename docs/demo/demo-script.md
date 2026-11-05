# Five-minute judge walkthrough

> **CURRENT GUIDE — November 4, 2026:** Present only observed live behavior.
> See [readiness](../readiness.md) for unverified steps. Allow extra time for
> email confirmation before the five-minute walkthrough.

## Before presenting

Open the [live website](https://ia-para-todos-jh.netlify.app/) in a fresh browser.
Judges create their own account at
[student signup](https://ia-para-todos-jh.netlify.app/portal/sign-up), using their
own email, an eight-character-or-longer password, and the adult/account privacy
acknowledgement. Follow the confirmation email. Password recovery is on
[sign-in](https://ia-para-todos-jh.netlify.app/portal/sign-in).

Signup depends on enabled registration, the signup gate, and available pilot
seats. Do not promise email delivery before testing it. Shared credentials are
not published. Prepare only fictional prompts; do not reserve a real place just
for a demonstration. Admin access requires a separately granted role.

## 0:00 — Introduce the project

“IA Para Todos is a community initiative for accessible AI education, starting
with Spanish-speaking adults in Dallas–Fort Worth. This platform connects
workshop discovery and reservations with optional preparation, courses, and
Meta Muse practice. Simulated dashboard figures are labeled; they are not
claims of real attendance, donations, or impact.”

## 0:30 — Discover and prepare

1. Show `/agenda` or `/en/schedule`: published future sessions and availability.
2. Open a session's registration details without submitting a booking unless
   attending. Explain one-adult reservations, guest access, and the private
   management link. No automatic booking email or SMS is sent.
3. Open `/preparacion` or `/en/preparation`: optional five-minute preparation,
   no AI call required. Signed-in completion can be saved.

## 1:30 — Student account and learning

1. Open `/portal` after confirmed signup; show linked reservations/preparation.
2. Enter `/portal/courses`. Explain and accept learning/Contributor consent
   only if comfortable with Meta training use; an account alone is not consent.
3. Enroll and complete a lesson. Explain that progress uses private,
   authenticated database records. Show cross-browser persistence only if tested.

## 2:45 — Meta Muse practice

1. Open `/portal/chats`, create a practice conversation, and use a fictional
   prompt such as “Explain a prompt using a made-up neighborhood bakery.”
2. Point to the actual live/sample label. Do not call a sample a live response.
   Live tutoring uses `muse-spark-1.3-contributor`; Meta may use prompts/replies
   for training. A live status or model-catalog check alone proves no generation.
3. Explain saved-chat expiry after 30 days, student daily limits, the shared
   student cost ledger, and the separate best-effort public tutor limits.

## 4:00 — Trust, connections, and optional admin view

Show the [architecture guide](../architecture.md): Identity for login, Neon for
private application records, Functions for server checks, Forms for intake,
Blobs for the AI switch, and Meta Muse for generation. WhatsApp shares the agenda
but remains an approved-recipient test integration; do not imply open delivery.

If an authorized presenter has admin access, show `/admin` with demo labels
visible. Explain that inbox drafts use Muse Standard and outreach drafts use
Contributor. Public/student reservations still use real APIs regardless of demo
mode. Do not submit, publish, or send anything as part of a read-only presentation.

## 4:45 — Account control and close

Show `/portal/account` and chat deletion controls without deleting an account
needed for continued judging. Explain immediate application removal/access denial
and scheduled Identity deletion retries. Local deletion cannot reverse provider
training or establish removal from backups.

Close with the [readiness checklist](../readiness.md): real-email, two-user,
maintenance, recovery, and live-generation evidence are separate from source
implementation. Organizational plans and curricula remain provisional until
validated through real operations.

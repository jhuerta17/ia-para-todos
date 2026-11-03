# Student portal: checkpoint 2

Status: authentication plus the first bilingual course, enrollment, and local
per-account progress are implemented; owner verification pending. Saved chats,
managed database, real email-flow verification, open registration, and live
student AI remain future checkpoints.
Production settings have not been changed.

## Run the checks

From `website/`:

```sh
npm run build
npm run verify:ai
npm run verify:admin
npm run verify:portal
```

The browser checks require the repository's installed Playwright Chromium.
Portal screenshots and results are written to the operating system temporary
folder under `ia-para-todos-verify-portal`, not committed source.

## Review authentication without a backend

From `website/`, after building:

```sh
npm run review:portal
```

This opens a local browser with fake Identity responses. Use
`estudiante@example.com` with any password of at least eight characters.
No real account is created, no email is delivered, and there are no AI calls.
Close the browser when finished.

1. Switch ES/EN and open Create account; the language should persist.
2. Submit a name, email, and password; expect the confirm-email screen.
3. Open `/portal/sign-in`, log in, and expect the student greeting.
4. Sign out; expect the login screen. Opening `/portal` redirects there.
5. Use Forgot password; expect the check-email screen.
6. Open `/portal/sign-in#recovery_token=local-demo` on the same local
   server; set a new password and expect the portal greeting.
7. Repeat at a narrow/mobile window width; controls should fit without
   horizontal scrolling.

For the normal development server, `npm start` serves localhost:4200,
but Identity is not emulated there. Use the review command for interactive
fake authentication, and the automated suite for expired credentials,
invalid links, return-path rejection, admin authorization, and logout
across both app surfaces.

## Authentication boundaries

Portal and admin share one lazily loaded Identity session. AdminSession
adds the admin role requirement; server functions and Netlify edge rules
remain responsible for real authorization. Saved credentials are refreshed
when expired before guards admit them. Portal return destinations are an exact allowlist of the home, course list,
course detail, and three lesson routes; auth screens and unknown paths are excluded.

Email links for recovery, confirmation, and email changes route to portal
sign-in; admin invitations still route to admin sign-in. Portal tokens are
removed from the address bar after capture, even if verification fails.
Real delivery and edge authorization require staging and are not proven
by the local stubs.

## Review the first course

1. Sign in at `/portal/sign-in` with an existing account (admins may use the
   portal too). A preview does not enable open registration or change Identity
   settings; use the local fake-auth review command if no test account exists.
2. Choose My courses / Mis cursos, then Your first prompt / Tu primer prompt.
3. Enroll. Expect zero of three completed lessons.
4. Complete two lessons and reload. Expect two of three to remain complete.
5. Switch ES/EN. The same lessons and progress should appear in the chosen language.
6. Return to the overview and choose Continue learning. Expect the remaining
   lesson; completing it displays the course-complete message.
7. Sign out and use a different account in the same browser. Its enrollment
   and completion must start empty.

All lesson URLs are prerendered and support direct navigation and reload.
Unknown lesson/course URLs retain the site's real 404 behavior. Progress uses
`portal-progress:v1:<encoded Identity user ID>:first-prompt` in localStorage.
It is temporary, browser-only scaffolding, not server authorization or a backup.
Clearing site data loses progress, and it does not transfer between localhost,
preview URLs, and production. Corrupt, blocked, or full storage displays an
error without claiming that progress was saved. Lessons remain readable.
The three lesson IDs are shared by both translations. They can be completed
in any order, and duplicate completion never increases the total.

## Remaining checkpoints

Checkpoint 2 is prepared on `main` for the existing Git-connected deployment
flow. Do not create a manual Netlify deploy. The owner will verify the deployed
main branch; wait for that review before starting the following checkpoints:

3. Saved sample chats sharing tutor logic, acknowledgements, safe text,
   2,000-character inputs, and six-message model context.
4. Separate staging Identity and Netlify DB, owned-resource APIs,
   committed migrations, server storage, two-user isolation tests.
5. Confirmed adult signup capped at 25 students; all receive live AI
   subject to 20 requests per UTC day and a $25 UTC-month application
   ceiling. Reserve costs atomically; use idempotent request IDs. Update
   privacy first, expire chats 30 days after creation, purge daily, and
   support chat/account deletion. No prompt/reply logging.
6. Operations, cost monitoring, production checklist, explicit release
   approval, and shutdown/rollback controls. Hosting and public tutor
   costs are separate from the student AI ceiling.

Commit coherent, validated increments with descriptive subjects and bodies
covering reasons, checks, and limitations. Stage only relevant files;
exclude secrets and generated output. Never push or rewrite history without
separate authorization. Manual verification may remain pending in a commit,
but must be recorded before presenting the checkpoint.

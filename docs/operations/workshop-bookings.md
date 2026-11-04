# Workshop-first experience

In-person workshops are the main learning experience. The existing topic catalog
remains; real dated sessions are managed at `/admin/workshops`. Sessions start
empty, and drafts are private until an organizer publishes them. The existing
admin demo mode remains synthetic and does not write live sessions.

## Participant flow

- `/agenda` and `/en/schedule`: date-ordered list and month calendar, also shown
  on the existing workshop catalog. Times use each venue's IANA timezone.
- Each reservation covers one adult. Preferred name and either email or phone
  are required, with adult and reservation-privacy acknowledgement. No account,
  course enrollment, preparation completion, or AI consent is needed to book.
- Confirmation is immediate on screen. **No automatic email or SMS is sent.**
  Guests must save or print their private management link. Organizers follow up
  manually, including for changes or cancellations. There is no waitlist.
- `/reservas#<token>` and `/en/reservations#<token>` show current details and allow
  cancellation. The token is a capability: anyone holding it can manage the
  reservation. Only its SHA-256 hash is stored. Tokens remain in URL fragments,
  never API query strings. Do not log tokens, booking bodies, or contact data.
- Creating an account is optional and accepts a basic account/privacy notice, not
  AI-training consent. The Identity hook accepts the versioned basic account notice
  and preserves the existing signup gate and 25-account pilot admission controls.
  AI-practice consent is requested separately when entering learning/practice.
  Guests can reopen their saved link after
  signing in and explicitly attach the booking. Existing contact details are
  never used to find or auto-attach guest bookings. Signed-in bookings link
  directly to the authenticated account. One active booking per account/session.
- `/preparacion` and `/en/preparation`: optional five-minute public introduction.
  Only signed-in completion is saved. It makes no AI requests.
- Portal home shows workshop reservations first, including linked topic materials
  and practice links. AI consent still gates courses and saved practice, but does
  not gate workshop overview or preparation. Existing course progress is preserved.

## Organizer workflow

Create or edit bilingual session details, language, venue, address, capacity,
accessibility and what-to-bring information. Dates are entered as venue-local
dates and converted to UTC; clock-change gaps or ambiguous times require a
non-ambiguous time. The default timezone is America/Chicago.

Publishing makes a future session bookable. Capacity cannot be reduced below
active bookings. Cancel a booked session instead of returning it to draft.
Cancelled sessions cannot reopen; create another session instead.

Open Reservations to view retained private contacts, create assisted bookings,
cancel individual places, and mark people contacted. Any saved detail change
flags active reservations for manual follow-up. Confirm participant age and
privacy acknowledgement before entering assisted bookings. Attendance remains
an anonymous headcount; do not use this as an identified attendance tracker.

## Data and release

The additive workshop migration uses the same private PostgreSQL database and
migration runner as the portal. Session rows keep anonymous reservation totals.
Reservation records expire 30 days after session end, session cancellation, or
individual cancellation, whichever is first. Expired records are denied on reads
immediately and deleted by the existing daily 04:00 UTC maintenance function.

Account deletion removes linked reservation rows and saved preparation in the same transaction as the
existing account deletion marker. It releases future seats. Anonymous totals
remain. Backup retention follows the database provider's separately managed policy.

Public schedule responses contain only session data and availability; contact
lists require a verified admin. Mutations require same-origin requests. Booking
capacity and replay admission use database transactions and session row locks;
Netlify endpoint rate limits and a booking honeypot protect guest requests.

Run from `website/`:

```sh
npm run build
npm run verify:workshops:types
npm run verify:workshops
npm run verify:portal:db
npm run verify:portal
npm run verify:admin
```

Workshop integration tests use disposable local PostgreSQL, fictional Identity
subjects, and Playwright (Browser plugin not available in this session). They do
not contact Identity, send messages, or use a managed database. Browser screenshots
are saved to the OS temporary `ia-para-todos-workshops` directory.

Apply and verify the migration on staging through the existing migration process.
Use fictional sessions and guests to exercise publication, guest email/phone
booking, management-link cancellation, linking, assisted booking, manual follow-up,
retention, and account deletion. Then deploy the reviewed change through the normal
Git production workflow. Implementation does not publish real sessions or deploy.

## Fictional data for review

Two options tell the same six-month story (six past sessions with 170
attendees, upcoming sessions with partial bookings). Everyone is fictional.

- Browser demo: open any schedule, reservation, preparation, or portal
  page with `?demo=1` (for example `/agenda?demo=1`). Sessions,
  availability, and the signed-in student's reservation are fictional;
  bookings are simulated in the browser and reach no server. The flag
  persists per browser; `?demo=0` returns to real data. Off by default,
  so tests and production are unaffected. Demo and live views look
  identical, so check the URL before sharing a screenshot.
- Staging seed: `WORKSHOP_SEED_DATABASE_URL=<staging-direct-url>
  npm run db:seed:workshops -- --confirm` inserts eleven fictional
  sessions and fictional reservations (`@example.com` and 555 contacts
  only, enforced by the script). Idempotent and insert-only; sessions
  past the 30-day retention window keep anonymous totals without rows.
  Never run against production.


## WhatsApp agenda and registration

The public `/api/workshops/sessions` endpoint and WhatsApp handler both use
`WorkshopRepository.schedule()` against the portal database. Only published
sessions whose start time is still in the future are returned. WhatsApp lists
up to five sessions in chronological order, including venue-local dates, times,
timezones, and direct registration links for sessions with availability. Full
sessions are labeled as full. Numbered replies provide details; the full agenda
link provides access to sessions beyond the first five. Empty schedules and
service failures have different replies in the requested language.

The live public API returned `{"sessions":[]}` during the November 3, 2026
investigation. Browser Demo mode can still show fictional sessions; open
`/agenda?demo=0` to compare the real schedule. Do not seed fictional workshops
into production to fix an empty reply. Publish confirmed dates, times, venues,
and capacities through the live admin workshop editor, then verify the public
API contains the same session IDs. Existing WhatsApp credentials and recipient
restrictions are unchanged by this update.

After the normal production deploy, send `Talleres` and `Workshops` from an
allowed recipient. Compare titles and dates with the live agenda, follow each
language's registration link to its matching form without submitting a booking,
and reply with a listed number to check details. Live WhatsApp delivery cannot
be verified by the offline tests; they mock Meta and use disposable databases.

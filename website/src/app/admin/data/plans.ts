export type PlanStatus = 'todo' | 'doing' | 'done';

export interface PlanItem {
  id: string;
  title: string;
  detail: string;
  /** True once the step is finished in code; localStorage can still override per browser. */
  done?: boolean;
}

export interface PlanGroup {
  id: string;
  title: string;
  summary: string;
  items: PlanItem[];
}

// 5-day demo sprint: ship a convincing "6 months running" nonprofit
// showcase. Outreach, legal entity, and live programs are explicitly
// parked. Items are the source of truth; per-browser progress lives
// in PlansState (localStorage) keyed by item id.
export const PLAN_GROUPS: PlanGroup[] = [
  {
    id: 'demo-foundation',
    title: 'Demo foundation — Day 1',
    summary: 'Lock scope and set up the 6-month showcase frame.',
    items: [
      {
        id: 'lock-scope',
        title: 'Lock the 5-day demo scope',
        detail: 'Public site + admin showcase as a 6-month nonprofit; no real outreach, no legal entity, no live programs.',
        done: true,
      },
      {
        id: 'demo-data-6mo',
        title: 'Extend demo data to 6 months',
        detail: 'Submissions, workshops, impact, and supporters read like half a year of steady operations.',
      },
      {
        id: 'honesty-labels',
        title: 'Keep every synthetic figure labeled',
        detail: 'Demo banner plus sample/illustrative labels everywhere; zero fake claims of real operations.',
      },
      {
        id: 'plans-tracker-live',
        title: 'Plans tracker live in admin',
        detail: 'This page: the roadmap visible and checkable from the portal.',
        done: true,
      },
    ],
  },
  {
    id: 'public-site',
    title: 'Public site polish — Days 1–2',
    summary: 'Reads like an established program, honestly framed.',
    items: [
      {
        id: 'workshops-complete',
        title: 'Complete workshop detail pages',
        detail: 'All four workshops read as a real running series with clear what, where, and who.',
      },
      {
        id: 'activities-resources',
        title: 'Finish activities + resources depth',
        detail: 'Every card opens something useful; no dead ends or thin pages.',
      },
      {
        id: 'stories-honest',
        title: 'Stories page without fake testimonials',
        detail: 'Founder story plus illustrative examples labeled as such until real pilot stories exist.',
      },
      {
        id: 'copy-pass',
        title: 'Spanish-first copy pass',
        detail: 'Fix typos, unify voice-and-tone, check EN parity on key pages.',
      },
    ],
  },
  {
    id: 'admin-lived',
    title: 'Admin looks lived-in — Days 2–3',
    summary: 'Demo mode tells the 6-month story at a glance.',
    items: [
      {
        id: 'inbox-story',
        title: 'Inbox reads like 6 months of intake',
        detail: 'Believable mix of participate/collaborate/newsletter volume and interests.',
      },
      {
        id: 'workshops-story',
        title: 'Past + upcoming workshop sessions',
        detail: 'Schedule shows history and momentum, not an empty calendar.',
      },
      {
        id: 'impact-story',
        title: 'Impact trend over 6 months',
        detail: 'Reach and confidence curves a real program would be proud of (labeled demo).',
      },
      {
        id: 'supporters-story',
        title: 'Supporters ledger with history',
        detail: 'Sample contributions and sponsors showing community backing (labeled demo).',
      },
    ],
  },
  {
    id: 'ai-showcase',
    title: 'AI showcase with Muse API — Days 3–4',
    summary: 'One working AI moment beats ten slides.',
    items: [
      {
        id: 'ai-proxy',
        title: 'Muse API proxy function',
        detail: 'Server-side key, rate limits, PII strip, cost logging; never called from the browser.',
      },
      {
        id: 'ai-tutor-one',
        title: 'Spanish tutor on one activity page',
        detail: 'Flagship demo: guided beginner-safe practice powered by the Muse API.',
      },
      {
        id: 'ai-triage',
        title: 'AI intake triage in inbox',
        detail: 'Auto-categorize plus drafted Spanish replies for one-click send (demo-safe).',
      },
      {
        id: 'ai-fallback',
        title: 'Graceful no-key fallback',
        detail: 'Without an API key the tutor shows labeled sample replies instead of errors.',
      },
    ],
  },
  {
    id: 'courses-teaser',
    title: 'Courses teaser — Day 4',
    summary: 'Show the course vision without building an LMS.',
    items: [
      {
        id: 'course-landing',
        title: 'Online-courses teaser section',
        detail: 'The ladder (free mini-course → Trabajo → Negocio → Facilitador) with a waitlist form.',
      },
      {
        id: 'mini-lesson',
        title: 'One interactive mini-lesson',
        detail: 'Five-minute "try it now" lesson powered by the tutor as the format proof.',
      },
      {
        id: 'waitlist-wired',
        title: 'Waitlist capture works',
        detail: 'Signups land in the inbox like any other form; confirm what the admin sees.',
      },
    ],
  },
  {
    id: 'launch',
    title: 'Launch readiness — Day 5',
    summary: 'Deploy, demo, and document.',
    items: [
      {
        id: 'deploy-green',
        title: 'Production deploy is green',
        detail: 'Netlify build passes, all verify scripts ok, links and forms checked live.',
      },
      {
        id: 'demo-script',
        title: 'Five-minute demo script',
        detail: 'Public site → lived-in admin → AI tutor → plans: the story in order.',
      },
      {
        id: 'docs-honest',
        title: 'README + docs match reality',
        detail: 'Demo state described honestly; nothing implies real workshops happened.',
      },
      {
        id: 'next-steps',
        title: 'Real-world next-steps doc',
        detail: 'What happens after the demo: outreach, pilot, entity — the on-ramp to doing it for real.',
      },
    ],
  },
  {
    id: 'out-of-scope',
    title: 'Explicitly out of scope',
    summary: 'Saying no on purpose — mark done when the park decision stands.',
    items: [
      {
        id: 'no-outreach',
        title: 'No real outreach this week',
        detail: 'Churches, libraries, partners: parked. Demo first, conversations after.',
      },
      {
        id: 'no-entity',
        title: 'No legal entity or bank account',
        detail: 'Fiscal sponsor / 501(c)(3) decision waits for real demand evidence.',
      },
      {
        id: 'no-live-programs',
        title: 'No live workshops or cohorts',
        detail: 'Nothing scheduled or delivered; the site shows the program shape only.',
      },
      {
        id: 'no-payments',
        title: 'No payments, LMS, or WhatsApp bot',
        detail: 'Revenue and automation tracks stay plans until the demo validates direction.',
      },
    ],
  },
];

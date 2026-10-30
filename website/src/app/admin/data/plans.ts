export type PlanStatus = 'todo' | 'doing' | 'done';

export interface PlanItem {
  id: string;
  title: string;
  detail: string;
}

export interface PlanGroup {
  id: string;
  title: string;
  summary: string;
  items: PlanItem[];
}

// Business roadmap tracker: every goal from the strategy review as a
// checkable plan. Items are the source of truth; per-browser progress
// lives in PlansState (localStorage) keyed by item id.
export const PLAN_GROUPS: PlanGroup[] = [
  {
    id: 'foundations',
    title: 'Business foundations',
    summary: 'Legal, financial, and validation groundwork before anything else.',
    items: [
      {
        id: 'decide-entity',
        title: 'Decide the legal structure',
        detail: 'Choose pure nonprofit vs. hybrid (nonprofit mission + for-profit training arm); fiscal sponsorship vs. 501(c)(3).',
      },
      {
        id: 'setup-finance',
        title: 'Set up finance basics',
        detail: 'Bank account or fiscal sponsor, receipt tracking, and a real cost-per-workshop log from day one.',
      },
      {
        id: 'run-m1-interviews',
        title: 'Run M1 validation interviews',
        detail: '~10 participant interviews plus 3–5 host conversations; document needs, devices, availability, skepticism.',
      },
      {
        id: 'pilot-verdict',
        title: 'Hold the pilot go/no-go',
        detail: 'Written repeat / adjust / pause verdict from 90-day pilot evidence before any expansion talk.',
      },
    ],
  },
  {
    id: 'revenue',
    title: 'Revenue models',
    summary: 'One anchor model plus one or two supports — proven before scaled.',
    items: [
      {
        id: 'model-grants',
        title: 'Nonprofit + grants track',
        detail: 'Fiscal sponsorship first, then local foundations and corporate community grants with clean impact data.',
      },
      {
        id: 'model-courses',
        title: 'Paid online courses in Spanish',
        detail: 'Free workshops as funnel; paid tracks ($19–149) with constancias de participación, never paid core workshops.',
      },
      {
        id: 'model-b2b',
        title: 'B2B workforce training',
        detail: 'Charge employers, staffing agencies, and workforce boards for frontline-worker AI literacy. Highest $/hour path.',
      },
      {
        id: 'model-smb',
        title: 'Small-business service packages',
        detail: '"IA para tu negocio" setup + training retainers: quotes, follow-ups, posts, reviews for local shops.',
      },
      {
        id: 'model-licensing',
        title: 'Train-the-trainer licensing',
        detail: '"IA Para Todos en tu ciudad" kit: curriculum license + facilitator training for other cities.',
      },
      {
        id: 'model-supporters',
        title: 'Sponsors + recurring donors',
        detail: 'Local business sponsors per cohort and an "Amigos" small-donor program with public impact reports.',
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    summary: 'The repeatable pipelines that make delivery possible without the founder.',
    items: [
      {
        id: 'ops-intake',
        title: 'Intake to follow-up pipeline',
        detail: 'Booking → SMS/WhatsApp reminders → attendance → feedback → 30-day follow-up → testimonials.',
      },
      {
        id: 'ops-volunteers',
        title: 'Volunteer pipeline',
        detail: 'Recruit → onboard → shadow → co-lead → lead → mentor, with a trained bench before scheduling.',
      },
      {
        id: 'ops-partners',
        title: 'Partner pipeline',
        detail: 'Outreach tracker, venue assessment, written responsibility split, post-event impact one-pager back to hosts.',
      },
      {
        id: 'ops-impact',
        title: 'Impact measurement engine',
        detail: 'Anonymous pre/post confidence + task completion + 30-day reuse, feeding a public dashboard and grants.',
      },
    ],
  },
  {
    id: 'outreach',
    title: 'Partnerships & distribution',
    summary: 'One venue type at a time; trust before scale.',
    items: [
      {
        id: 'outreach-phase1',
        title: 'Phase 1: churches + community channels',
        detail: 'DFW Hispanic churches, Spanish-language radio, WhatsApp groups, consulates, ESL programs.',
      },
      {
        id: 'outreach-phase2',
        title: 'Phase 2: public venues',
        detail: 'Libraries, rec centers, school parent nights, clinics; print flyers where the community already goes.',
      },
      {
        id: 'outreach-phase3',
        title: 'Phase 3: employers & institutions',
        detail: 'Hospitality, construction, home-care employers; staffing firms; workforce boards; community colleges.',
      },
      {
        id: 'outreach-alumni',
        title: 'Alumni referral loop',
        detail: 'Every graduate brings family members; graduates become the most trusted outreach channel.',
      },
    ],
  },
  {
    id: 'ai-tier1',
    title: 'AI integrations — Tier 1',
    summary: 'Ship first: the Muse API proof-of-concept and its immediate wins.',
    items: [
      {
        id: 'ai-proxy',
        title: 'Muse API proxy functions',
        detail: 'Netlify functions holding the key server-side: rate limits, PII stripping, per-call cost logging.',
      },
      {
        id: 'ai-tutor',
        title: 'Spanish "Practica con IA" tutor',
        detail: 'Guided beginner-safe tutor embedded on every activity page; turns static lessons interactive.',
      },
      {
        id: 'ai-triage',
        title: 'AI intake triage in admin inbox',
        detail: 'Auto-summarize and categorize incoming forms; draft Spanish replies for one-click send.',
      },
      {
        id: 'ai-facilitator',
        title: 'AI curriculum assistant',
        detail: 'Generate fresh everyday examples, lesson variants, and printable handouts for facilitators.',
      },
      {
        id: 'ai-faq',
        title: 'Smart site FAQ assistant',
        detail: 'Spanish Q&A over project docs and curricula only (RAG), WhatsApp-tone, no invented facts.',
      },
    ],
  },
  {
    id: 'ai-tier2',
    title: 'AI integrations — Tier 2',
    summary: 'Courses and operations multipliers, once Tier 1 is live.',
    items: [
      {
        id: 'ai-grader',
        title: 'AI course builder + prompt grader',
        detail: 'Generate quizzes and role-plays; give gentle feedback on learner prompts. The paid-course engine.',
      },
      {
        id: 'ai-localizer',
        title: 'AI ES/EN localizer',
        detail: 'Draft English from Spanish source, flag content drift, keep voice-and-tone parity.',
      },
      {
        id: 'ai-impact-sum',
        title: 'AI impact summarizer',
        detail: 'Turn anonymous feedback into themed summaries and scrubbed quotes for reports and grants.',
      },
      {
        id: 'ai-outreach',
        title: 'AI outreach drafter',
        detail: 'Personalized venue/sponsor first-contact letters from templates; human-approved before sending.',
      },
      {
        id: 'ai-whatsapp',
        title: 'WhatsApp/SMS reminder bot',
        detail: 'Workshop reminders, weekly 5-minute practices, and 30-day check-ins via messaging APIs + Muse.',
      },
    ],
  },
  {
    id: 'ai-tier3',
    title: 'AI integrations — Tier 3',
    summary: 'Differentiation plays for later, after the core loop earns them.',
    items: [
      {
        id: 'ai-voice',
        title: 'Voice-first tutor',
        detail: 'Speech in, simple spoken-style replies out — smartphone-native for low-literacy learners.',
      },
      {
        id: 'ai-scams',
        title: 'AI scam-shield trainer',
        detail: 'Simulated Spanish phishing/scam messages that teach verification; extends Workshop 4.',
      },
      {
        id: 'ai-smb-copilot',
        title: 'Small-business copilots',
        detail: 'Templated assistants per trade (quotes, follow-ups); the B2B product surface.',
      },
      {
        id: 'ai-live',
        title: 'Facilitator live-mode copilot',
        detail: 'Real-time suggested answers and examples during in-person workshops.',
      },
    ],
  },
  {
    id: 'courses',
    title: 'Spanish AI courses',
    summary: 'Mobile-first micro-learning ladder from free to paid.',
    items: [
      {
        id: 'course-micro',
        title: 'Micro-lesson format',
        detail: '5–10 minute lessons, video-optional, WhatsApp-deliverable; phones in spare minutes, not laptops.',
      },
      {
        id: 'course-ladder',
        title: 'Course ladder + pricing',
        detail: 'Free mini-course → IA para el Trabajo → IA para tu Negocio → Facilitador Certificado.',
      },
      {
        id: 'course-pedagogy',
        title: 'AI-native pedagogy',
        detail: 'Every lesson ends with "try it now" inside the tutor; prompt portfolios instead of multiple-choice.',
      },
      {
        id: 'course-pilot',
        title: 'Paid pilot cohort',
        detail: 'First paid cohort of ~20 learners to validate willingness to pay before building an LMS.',
      },
    ],
  },
];

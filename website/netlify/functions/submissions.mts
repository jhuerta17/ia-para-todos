import { getUser } from '@netlify/identity';
import type { Context } from '@netlify/functions';

// Admin-only submissions inbox backend. Verifies the caller's Identity
// JWT (admin role required), then lists the site's three Netlify Forms
// via the Netlify REST API and returns sanitized submissions.
//
// Reads at most 100 submissions per form (latest first); with more
// volume the response flags `truncated` so the UI can say so.
const API = 'https://api.netlify.com/api/v1';
const PER_PAGE = 100;
const KNOWN_FORMS = ['participate', 'collaborate', 'newsletter'] as const;
type KnownForm = (typeof KNOWN_FORMS)[number];

interface ApiForm {
  id?: unknown;
  name?: unknown;
}

interface ApiSubmission {
  id?: unknown;
  created_at?: unknown;
  email?: unknown;
  name?: unknown;
  data?: unknown;
}

export interface InboxSubmission {
  id: string;
  form: KnownForm;
  createdAt: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  interest: string | null;
  message: string | null;
  language: string | null;
}

const text = (value: unknown): string | null => {
  if (typeof value === 'string') return value.trim() === '' ? null : value.trim();
  if (value === null || value === undefined) return null;
  return String(value);
};

const isKnownForm = (name: unknown): name is KnownForm =>
  typeof name === 'string' && (KNOWN_FORMS as readonly string[]).includes(name);

/** Pure mapping, exported for local testing (see step 4 validation). */
export function mapSubmissions(forms: ApiForm[], byForm: Map<string, ApiSubmission[]>): InboxSubmission[] {
  const ids = new Map<KnownForm, string>();
  for (const form of forms) {
    if (isKnownForm(form.name) && typeof form.id === 'string' && form.id !== '') ids.set(form.name, form.id);
  }
  const rows: InboxSubmission[] = [];
  for (const [form, formId] of ids) {
    for (const item of byForm.get(formId) ?? []) {
      if (typeof item.id !== 'string' || typeof item.created_at !== 'string') continue;
      const data = (typeof item.data === 'object' && item.data !== null ? item.data : {}) as Record<string, unknown>;
      rows.push({
        id: item.id,
        form,
        createdAt: item.created_at,
        name: text(data['name']) ?? text(item.name),
        email: text(data['email']) ?? text(item.email),
        phone: text(data['phone']),
        interest: text(data['interest']),
        message: text(data['message']),
        language: text(data['language']),
      });
    }
  }
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return rows;
}

function siteId(): string | null {
  const override = process.env['NETLIFY_SITE_ID'];
  if (override && override.trim() !== '') return override.trim();
  const url = process.env['URL'];
  if (url) {
    try {
      return new URL(url).host;
    } catch {
      // Fall through to the bundled default.
    }
  }
  return 'ia-para-todos-jh.netlify.app';
}

async function api<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'ia-para-todos-admin/1.0' },
  });
  if (!response.ok) throw new Error(`Netlify API ${path} failed with ${response.status}`);
  return (await response.json()) as T;
}

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  let user = null;
  try {
    user = await getUser();
  } catch {
    user = null;
  }
  if (!user) return new Response('Unauthorized', { status: 401 });
  if (!user.roles.includes('admin')) return new Response('Forbidden', { status: 403 });

  const token = process.env['NETLIFY_API_TOKEN'];
  if (!token) {
    console.error('submissions: missing NETLIFY_API_TOKEN env var');
    return new Response('Server misconfigured', { status: 500 });
  }
  const site = siteId();
  if (!site) {
    console.error('submissions: cannot determine site id');
    return new Response('Server misconfigured', { status: 500 });
  }

  try {
    const forms = await api<ApiForm[]>(token, `/sites/${site}/forms`);
    const wanted = forms.filter((form) => isKnownForm(form.name) && typeof form.id === 'string');
    const byForm = new Map<string, ApiSubmission[]>();
    let truncated = false;
    await Promise.all(
      wanted.map(async (form) => {
        const id = form.id as string;
        const items = await api<ApiSubmission[]>(token, `/forms/${id}/submissions?per_page=${PER_PAGE}`);
        if (items.length >= PER_PAGE) truncated = true;
        byForm.set(id, items);
      }),
    );
    return Response.json({ submissions: mapSubmissions(forms, byForm), truncated });
  } catch (error) {
    console.error(`submissions: upstream failed: ${error instanceof Error ? error.message : error}`);
    return new Response('Upstream unavailable', { status: 502 });
  }
};

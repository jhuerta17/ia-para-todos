import type { Submission, SubmissionForm } from './submissions';

export interface MonthBucket {
  key: string;
  label: string;
  participate: number;
  collaborate: number;
  newsletter: number;
  total: number;
}

export interface FormDelta {
  current: number;
  previous: number;
}

export const ANALYTICS_FORMS: SubmissionForm[] = ['participate', 'collaborate', 'newsletter'];

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/** Trailing calendar months, oldest first. Rows with bad dates are skipped. */
export function bucketByMonth(rows: Submission[], monthCount = 6, now = Date.now()): MonthBucket[] {
  const cursor = new Date(now);
  const buckets = new Map<string, MonthBucket>();
  const order: string[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    const key = monthKey(date.getFullYear(), date.getMonth());
    const sameYear = date.getFullYear() === cursor.getFullYear();
    const label =
      date.toLocaleDateString('en', { month: 'short' }) + (sameYear ? '' : ` ’${String(date.getFullYear()).slice(2)}`);
    buckets.set(key, { key, label, participate: 0, collaborate: 0, newsletter: 0, total: 0 });
    order.push(key);
  }
  for (const row of rows) {
    const time = Date.parse(row.createdAt);
    if (Number.isNaN(time)) continue;
    const date = new Date(time);
    const bucket = buckets.get(monthKey(date.getFullYear(), date.getMonth()));
    if (!bucket) continue;
    bucket[row.form] += 1;
    bucket.total += 1;
  }
  return order.map((key) => buckets.get(key) as MonthBucket);
}

/** Current vs previous calendar month per form. */
export function monthDeltas(rows: Submission[], now = Date.now()): Record<SubmissionForm, FormDelta> {
  const [previous, current] = bucketByMonth(rows, 2, now);
  const deltas = {} as Record<SubmissionForm, FormDelta>;
  for (const form of ANALYTICS_FORMS) {
    deltas[form] = { current: current[form], previous: previous[form] };
  }
  return deltas;
}

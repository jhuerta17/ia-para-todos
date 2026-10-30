/** Netlify Forms submissions, normalized for the admin dashboard. */
export type SubmissionForm = 'participate' | 'collaborate' | 'newsletter';

export interface Submission {
  id: string;
  form: SubmissionForm;
  createdAt: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  interest: string | null;
  message: string | null;
  language: string | null;
}

export const FORM_LABELS: Record<SubmissionForm, string> = {
  participate: 'Participate',
  collaborate: 'Collaborate',
  newsletter: 'Newsletter',
};

export const FORM_BADGE_COLORS: Record<SubmissionForm, 'primary' | 'info' | 'success'> = {
  participate: 'primary',
  collaborate: 'info',
  newsletter: 'success',
};

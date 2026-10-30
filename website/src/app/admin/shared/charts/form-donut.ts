import { Component, computed, input } from '@angular/core';
import { ANALYTICS_FORMS } from '../../data/analytics';
import { FORM_LABELS, SubmissionForm } from '../../data/submissions';

interface Slice {
  form: SubmissionForm;
  label: string;
  count: number;
  pct: number;
  dasharray: string;
  dashoffset: number;
}

const STROKE: Record<SubmissionForm, string> = {
  participate: 'stroke-brand-500',
  collaborate: 'stroke-sky-500',
  newsletter: 'stroke-green-500',
};

const DOT: Record<SubmissionForm, string> = {
  participate: 'bg-brand-500',
  collaborate: 'bg-sky-500',
  newsletter: 'bg-green-500',
};

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Request share per form: SVG donut plus a legend with counts. */
@Component({
  selector: 'app-form-donut',
  templateUrl: './form-donut.html',
})
export class FormDonut {
  readonly counts = input.required<Record<SubmissionForm, number>>();

  protected readonly STROKE = STROKE;
  protected readonly DOT = DOT;
  protected readonly radius = RADIUS;

  protected readonly total = computed(() => ANALYTICS_FORMS.reduce((sum, form) => sum + this.counts()[form], 0));

  protected readonly slices = computed<Slice[]>(() => {
    const counts = this.counts();
    const total = this.total();
    let start = 0;
    return ANALYTICS_FORMS.map((form) => {
      const count = counts[form];
      const frac = total === 0 ? 0 : count / total;
      const length = frac * CIRCUMFERENCE;
      // A 2-unit gap separates slices; full circles stay closed.
      const gap = length > 4 && length < CIRCUMFERENCE - 1 ? 2 : 0;
      const slice: Slice = {
        form,
        label: FORM_LABELS[form],
        count,
        pct: Math.round(frac * 100),
        dasharray: `${Math.max(0, length - gap)} ${CIRCUMFERENCE}`,
        dashoffset: -start,
      };
      start += length;
      return slice;
    });
  });

  protected readonly summary = computed(() => {
    const parts = this.slices().map((slice) => `${slice.label} ${slice.count}`);
    return `Requests by form, ${this.total()} total: ${parts.join(', ')}.`;
  });
}

import { Component, computed, input } from '@angular/core';
import { ANALYTICS_FORMS, MonthBucket } from '../../data/analytics';
import { FORM_LABELS, SubmissionForm } from '../../data/submissions';

interface BarSegment {
  form: SubmissionForm;
  y: number;
  height: number;
  rounded: boolean;
}

interface Bar {
  x: number;
  width: number;
  total: number;
  segments: BarSegment[];
  title: string;
}

const FILL: Record<SubmissionForm, string> = {
  participate: 'fill-brand-500',
  collaborate: 'fill-sky-500',
  newsletter: 'fill-green-500',
};

const DOT: Record<SubmissionForm, string> = {
  participate: 'bg-brand-500',
  collaborate: 'bg-sky-500',
  newsletter: 'bg-green-500',
};

const PLOT = { left: 44, right: 16, top: 16, bottom: 224, height: 260, width: 640 };

/** Stacked monthly bars, hand-rolled SVG so the admin ships no chart dependency. */
@Component({
  selector: 'app-trend-chart',
  templateUrl: './trend-chart.html',
})
export class TrendChart {
  readonly buckets = input.required<MonthBucket[]>();

  protected readonly FILL = FILL;
  protected readonly DOT = DOT;
  protected readonly width = PLOT.width;
  protected readonly height = PLOT.height;
  protected readonly bottom = PLOT.bottom;

  protected readonly scale = computed(() => {
    const buckets = this.buckets();
    const max = Math.max(0, ...buckets.map((bucket) => bucket.total));
    const step = Math.max(1, Math.ceil(max / 4));
    const slot = (PLOT.width - PLOT.left - PLOT.right) / Math.max(1, buckets.length);
    return { maxY: step * 4, step, slot, barWidth: Math.min(64, slot * 0.55) };
  });

  protected readonly bars = computed<Bar[]>(() => {
    const { maxY, slot, barWidth } = this.scale();
    const plotH = PLOT.bottom - PLOT.top;
    return this.buckets().map((bucket, index) => {
      const x = PLOT.left + slot * index + (slot - barWidth) / 2;
      const segments: BarSegment[] = [];
      let cursor = PLOT.bottom;
      const nonzero = ANALYTICS_FORMS.filter((form) => bucket[form] > 0);
      for (const form of nonzero) {
        const height = (bucket[form] / maxY) * plotH;
        cursor -= height;
        segments.push({ form, y: cursor, height, rounded: form === nonzero[nonzero.length - 1] });
      }
      const parts = ANALYTICS_FORMS.map((form) => `${FORM_LABELS[form]} ${bucket[form]}`);
      return { x, width: barWidth, total: bucket.total, segments, title: `${bucket.label}: ${bucket.total} total (${parts.join(', ')})` };
    });
  });

  protected readonly ticks = computed(() => {
    const { maxY, step } = this.scale();
    const plotH = PLOT.bottom - PLOT.top;
    return [0, 1, 2, 3, 4].map((i) => ({ value: step * i, y: PLOT.top + plotH * (1 - (step * i) / maxY) }));
  });

  protected readonly totals = computed(() => {
    const sums: Record<SubmissionForm, number> = { participate: 0, collaborate: 0, newsletter: 0 };
    for (const bucket of this.buckets()) for (const form of ANALYTICS_FORMS) sums[form] += bucket[form];
    return ANALYTICS_FORMS.map((form) => ({ form, label: FORM_LABELS[form], total: sums[form] }));
  });

  protected readonly grandTotal = computed(() => this.buckets().reduce((sum, bucket) => sum + bucket.total, 0));

  protected readonly summary = computed(() => {
    const buckets = this.buckets();
    if (buckets.length === 0) return 'No monthly data.';
    return `Monthly requests from ${buckets[0].label} to ${buckets[buckets.length - 1].label}: ${this.grandTotal()} total.`;
  });
}

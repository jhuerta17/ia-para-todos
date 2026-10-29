import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentDetail as Detail } from '../../data/content-detail';
import { PageCover } from '../../shared/page-cover/page-cover';
import { ActionLink } from '../../shared/action-link';
import { Icon } from '../../shared/icon';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
@Component({selector: 'app-content-detail', imports: [RouterLink, PageCover, ActionLink, Icon, RevealOnEnter], templateUrl: './content-detail.html', styleUrl: './content-detail.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class ContentDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  protected readonly detail = computed(() => this.data()['detail'] as Detail);
}

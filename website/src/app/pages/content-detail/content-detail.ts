import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentDetail as Detail } from '../../data/content-detail';
import { PageCover } from '../../shared/page-cover/page-cover';
import { ActionLink } from '../../shared/action-link';
import { Icon } from '../../shared/icon';
import { RevealOnEnter } from '../../shared/motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { PHOTO_NOTE } from '../../i18n/lang';

const copy = {
  es: { agenda: 'Agenda', agendaCaption: 'Bloques del taller · 100 minutos más margen para preguntas', time: 'Tiempo', practice: 'Práctica', tryIt: 'Pruébalo con un ejemplo inventado', verifyElsewhere: 'Verifícalo en otro lado', verifyLead: 'Compara la respuesta con otra fuente o una persona de confianza. Si algo importa, no lo des por cierto solo porque lo dice la IA.', closing: 'Aprender con calma y con cuidado', closingLead: 'Practica con datos inventados y evita compartir información personal.' },
  en: { agenda: 'Agenda', agendaCaption: 'Workshop blocks · 100 minutes plus time for questions', time: 'Time', practice: 'Practice', tryIt: 'Try it with a made-up example', verifyElsewhere: 'Verify it elsewhere', verifyLead: 'Compare the answer with another source or a trusted person. If something matters, do not take it as true just because AI says so.', closing: 'Learn calmly and carefully', closingLead: 'Practice with made-up data and avoid sharing personal information.' },
};

@Component({selector: 'app-content-detail', imports: [RouterLink, PageCover, ActionLink, Icon, RevealOnEnter], templateUrl: './content-detail.html', styleUrl: './content-detail.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class ContentDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly caption = computed(() => PHOTO_NOTE[this.language.lang()].single);
  protected readonly detail = computed(() => this.data()['detail'] as Detail);
}

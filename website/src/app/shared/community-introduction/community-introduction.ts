import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CollaborationCarousel } from '../collaboration-carousel/collaboration-carousel';
import { ActionLink } from '../action-link';
import { BrandMark } from '../brand-mark';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { PHOTO_NOTE } from '../../i18n/lang';

const copy = {
  es: { heading: 'Una iniciativa de vecinos para vecinos', quote: 'Aprender juntos, con paciencia y honestidad, abre puertas para toda la familia.', rolesHeading: 'Formas de colaborar', roles: 'Puedes ayudar a facilitar talleres, acompañar prácticas, traducir o difundir la iniciativa.', meet: 'Conocer la iniciativa', photo: 'Un grupo de personas adultas reunidas alrededor de una computadora.' },
  en: { heading: 'A neighbors-for-neighbors initiative', quote: 'Learning together, with patience and honesty, opens doors for the whole family.', rolesHeading: 'Ways to collaborate', roles: 'You can help facilitate workshops, guide practice, translate, or spread the word.', meet: 'Meet the initiative', photo: 'A group of adults gathered around a computer.' },
};

@Component({
  selector: 'app-community-introduction',
  imports: [CollaborationCarousel, ActionLink, BrandMark, Icon, RevealOnEnter],
  templateUrl: './community-introduction.html',
  styleUrl: './community-introduction.css',
  host: { '[class.compact]': 'compact()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityIntroduction {
  readonly compact = input(false);
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly caption = computed(() => PHOTO_NOTE[this.language.lang()].single);
}

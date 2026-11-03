import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CollaborationCarousel } from '../collaboration-carousel/collaboration-carousel';
import { ActionLink } from '../action-link';
import { BrandMark } from '../brand-mark';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';

const copy = {
  es: { heading: 'Una organización de vecinos para vecinos', quote: 'Aprender juntos, con paciencia y honestidad, abre puertas para toda la familia.', rolesHeading: 'Formas de colaborar', roles: 'Puedes ayudar a facilitar talleres, acompañar prácticas, traducir o difundir nuestra misión.', meet: 'Conocer la organización', photo: 'Dos mujeres de distintas generaciones revisando una computadora juntas.' },
  en: { heading: 'A neighbors-for-neighbors nonprofit', quote: 'Learning together, with patience and honesty, opens doors for the whole family.', rolesHeading: 'Ways to collaborate', roles: 'You can help facilitate workshops, guide practice, translate, or spread the word.', meet: 'Meet the organization', photo: 'Two women from different generations looking at a laptop together.' },
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
}

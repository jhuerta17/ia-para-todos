import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { CommunityIntroduction } from '../../shared/community-introduction/community-introduction';
import { CommunityInvitation } from '../../shared/community-invitation/community-invitation';
import { FaqSection } from '../../shared/faq-section/faq-section';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy: Record<Lang, { title: string; lead: string; paragraphs: string[] }> = {
  es: {
    title: 'Quiénes somos',
    lead: 'IA para todos es una iniciativa comunitaria para acercar la inteligencia artificial a la vida diaria, el trabajo y la familia, en español y desde cero.',
    paragraphs: [
      'Queremos reducir la brecha digital con talleres gratuitos, prácticos y accesibles. El enfoque inicial son personas adultas hispanohablantes que empiezan desde cero, especialmente en Dallas–Fort Worth. No necesitas una computadora: las prácticas parten de un teléfono.',
      'La iniciativa es inclusiva y no sectaria. Todas las personas son bienvenidas, sin importar sus creencias; los talleres no contienen contenido religioso. Nos importa aprender con paciencia, verificar la información y cuidar la privacidad.',
    ],
  },
  en: {
    title: 'Who we are',
    lead: 'AI for everyone is a community initiative to bring artificial intelligence closer to everyday life, work, and family, in Spanish and from scratch.',
    paragraphs: [
      'We want to close the digital divide with free, hands-on, accessible workshops. The initial focus is Spanish-speaking adults starting from zero, especially in Dallas–Fort Worth. You do not need a computer: practices start from a phone.',
      'The initiative is inclusive and nonsectarian. Everyone is welcome, whatever their beliefs; workshops contain no religious content. We care about learning patiently, verifying information, and protecting privacy.',
    ],
  },
};

@Component({selector: 'app-about', imports: [PageIntro, CommunityIntroduction, CommunityInvitation, FaqSection], templateUrl: './about.html', styles: `main:focus { outline: none; }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class About {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}

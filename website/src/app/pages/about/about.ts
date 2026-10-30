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
    lead: 'IA Para Todos es una iniciativa comunitaria que ofrece talleres gratuitos en español para aprender a usar la inteligencia artificial en la vida diaria, el trabajo y la familia. Nuestras sesiones son para principiantes, solo requieren un teléfono inteligente y no tienen ningún costo.',
    paragraphs: [
      'Queremos reducir la brecha digital con talleres prácticos y accesibles. El enfoque inicial son personas adultas hispanohablantes que empiezan desde cero, especialmente en Dallas–Fort Worth.',
      'La iniciativa es inclusiva y no sectaria. Todas las personas son bienvenidas, sin importar sus creencias; los talleres no contienen contenido religioso. Nos importa aprender con paciencia, verificar la información y cuidar la privacidad.',
      'Estamos en etapa exploratoria: aún no realizamos talleres oficiales ni formamos alianzas formales, y no somos una organización sin fines de lucro registrada.',
    ],
  },
  en: {
    title: 'Who we are',
    lead: 'IA Para Todos (AI for Everyone) is a community initiative offering free Spanish-language workshops that help adults understand and use artificial intelligence in daily life, work, and family. Sessions are beginner-friendly, smartphone-only, and always free.',
    paragraphs: [
      'We want to close the digital divide with hands-on, accessible workshops. The initial focus is Spanish-speaking adults starting from zero, especially in Dallas–Fort Worth.',
      'The initiative is inclusive and nonsectarian. Everyone is welcome, whatever their beliefs; workshops contain no religious content. We care about learning patiently, verifying information, and protecting privacy.',
      'We are in the exploratory stage: we have not yet held official workshops or formed formal partnerships, and we are not a registered nonprofit.',
    ],
  },
};

@Component({selector: 'app-about', imports: [PageIntro, CommunityIntroduction, CommunityInvitation, FaqSection], templateUrl: './about.html', styles: `main:focus { outline: none; }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class About {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}

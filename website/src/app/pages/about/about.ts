import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { CommunityIntroduction } from '../../shared/community-introduction/community-introduction';
import { CommunityInvitation } from '../../shared/community-invitation/community-invitation';
import { FaqSection } from '../../shared/faq-section/faq-section';
@Component({selector: 'app-about', imports: [PageIntro, CommunityIntroduction, CommunityInvitation, FaqSection], templateUrl: './about.html', styles: `main:focus { outline: none; }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class About {
  protected readonly paragraphs = [
    'Queremos reducir la brecha digital con talleres gratuitos, prácticos y accesibles. El enfoque inicial son personas adultas hispanohablantes que empiezan desde cero, especialmente en Dallas–Fort Worth. No necesitas una computadora: las prácticas parten de un teléfono.',
    'La iniciativa es inclusiva y no sectaria. Todas las personas son bienvenidas, sin importar sus creencias; los talleres no contienen contenido religioso. Nos importa aprender con paciencia, verificar la información y cuidar la privacidad.',
  ];
}

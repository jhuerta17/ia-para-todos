import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActionLink } from '../action-link';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

const copy: Record<Lang, { heading: string; anchor: string; name: string; role: string; paragraphs: string[]; quote: string; quoteBy: string; attend: string; help: string }> = {
  es: {
    heading: 'El fundador',
    anchor: 'fundador',
    name: 'Jaime Huerta Cruz',
    role: 'Fundador de IA Para Todos',
    paragraphs: [
      'Jaime nació en México y creció en un hogar de bajos ingresos. El español es su primer idioma y usó una computadora por primera vez en 2010. Esa experiencia lo acompaña hasta hoy: sabe lo que significa ver avanzar la tecnología sin tener las mismas oportunidades para aprender a usarla.',
      'Estudió ingeniería en computación en la Universidad de Texas en Dallas y hoy es ingeniero senior de software en una empresa Fortune 50. También enseñó programación a jóvenes en un centro de detención juvenil y trabajó como intérprete certificado de español para el 911, hospitales y abogados. Actualmente forma parte del Consejo Asesor de Dallas del Hispanic Scholarship Fund y entrevista a aspirantes a la Beca Gates. En cada una de estas experiencias ha visto cuánto importa poder aprender, hacer preguntas y recibir apoyo en el propio idioma.',
      'Por eso fundó IA Para Todos: para acercar la inteligencia artificial a la comunidad con talleres gratuitos, en español y desde cero. Quiere que más personas puedan usarla en la vida diaria, el trabajo y la familia, y que madres y padres tengan herramientas para acompañar a sus hijos. Para Jaime, aprender también significa reconocer cuándo la IA se equivoca, verificar sus respuestas y cuidar la información personal.',
      'Dallas–Fort Worth ha sido su hogar durante casi ocho años. Aquí empieza esta iniciativa, con la idea de aprender junto a sus vecinos y, con el tiempo, compartir lo que funcione con más comunidades del país. Su convicción es que la oportunidad de aprender no debería depender del idioma, de los ingresos ni de cuánto se sabe de tecnología.',
    ],
    quote: 'Una inversión en conocimiento paga el mejor interés.',
    quoteBy: 'Benjamin Franklin',
    attend: 'Ver los talleres',
    help: 'Quiero participar',
  },
  en: {
    heading: 'Our founder',
    anchor: 'founder',
    name: 'Jaime Huerta Cruz',
    role: 'Founder of IA Para Todos',
    paragraphs: [
      'Jaime was born in Mexico and grew up in a low-income household. Spanish is his first language, and he first used a computer in 2010. That experience stays with him: he knows what it feels like to watch technology move forward without having the same opportunities to learn how to use it.',
      'He studied computer engineering at the University of Texas at Dallas and now works as a senior software engineer at a Fortune 50 company. He has also taught coding to young people in a juvenile detention center and worked as a certified Spanish interpreter for 911, hospitals, and lawyers. Today, he serves on the Dallas Advisory Council of the Hispanic Scholarship Fund and interviews Gates Scholarship applicants. Across these experiences, he has seen how much it matters to be able to learn, ask questions, and get support in one’s own language.',
      'That is why he founded IA Para Todos: to bring AI learning to the community through free workshops in Spanish, starting with the basics. He wants more people to feel comfortable using it in daily life, at work, and with their families, and to help parents guide their children. For Jaime, learning also means recognizing when AI gets things wrong, checking its answers, and protecting personal information.',
      'Dallas–Fort Worth has been his home for almost eight years. This initiative begins here, with the idea of learning alongside his neighbors and, over time, sharing what works with more communities across the country. He believes the opportunity to learn should not depend on language, income, or prior knowledge of technology.',
    ],
    quote: 'An investment in knowledge pays the best interest.',
    quoteBy: 'Benjamin Franklin',
    attend: 'See the workshops',
    help: 'I want to join',
  },
};

@Component({selector: 'app-founder-story', imports: [ActionLink, RevealOnEnter], templateUrl: './founder-story.html', styleUrl: './founder-story.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class FounderStory {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}

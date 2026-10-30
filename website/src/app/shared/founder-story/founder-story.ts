import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActionLink } from '../action-link';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import type { Lang } from '../../i18n/lang';

const copy: Record<Lang, { heading: string; name: string; role: string; paragraphs: string[]; quote: string; quoteBy: string; attend: string; help: string }> = {
  es: {
    heading: 'El fundador',
    name: 'Jaime Huerta Cruz',
    role: 'Fundador de IA Para Todos',
    paragraphs: [
      'Nací en México y crecí en un hogar de bajos ingresos. El español es mi primer idioma y no usé una computadora por primera vez hasta 2010. Esa experiencia me acompaña hasta hoy: sé lo que significa ver avanzar la tecnología sin tener las mismas oportunidades para aprender a usarla.',
      'Estudié ingeniería en computación en la Universidad de Texas en Dallas y hoy soy ingeniero senior de software en una empresa Fortune 50. También enseñé programación a jóvenes en un centro de detención juvenil y trabajé como intérprete certificado de español para el 911, hospitales y abogados. Actualmente formo parte del Consejo Asesor de Dallas del Hispanic Scholarship Fund y entrevisto a aspirantes a la Beca Gates. En cada una de estas experiencias he visto cuánto importa poder aprender, hacer preguntas y recibir apoyo en tu propio idioma.',
      'Por eso fundé IA Para Todos: para acercar la inteligencia artificial a nuestra comunidad con talleres gratuitos, en español y desde cero. Quiero que más personas puedan usarla en la vida diaria, el trabajo y la familia, y que madres y padres tengan herramientas para acompañar a sus hijos. Aprender también significa reconocer cuándo la IA se equivoca, verificar sus respuestas y cuidar nuestra información.',
      'Dallas–Fort Worth ha sido mi hogar durante casi ocho años. Aquí empieza esta iniciativa, con la idea de aprender junto a nuestros vecinos y, con el tiempo, compartir lo que funcione con más comunidades del país. La oportunidad de aprender no debería depender del idioma que hablas, de tus ingresos ni de cuánto sabes de tecnología.',
    ],
    quote: 'Una inversión en conocimiento paga el mejor interés.',
    quoteBy: 'Benjamin Franklin',
    attend: 'Ver los talleres',
    help: 'Quiero participar',
  },
  en: {
    heading: 'Our founder',
    name: 'Jaime Huerta Cruz',
    role: 'Founder of IA Para Todos',
    paragraphs: [
      'I was born in Mexico and grew up in a low-income household. Spanish is my first language, and I did not use a computer for the first time until 2010. That experience stays with me: I know what it feels like to watch technology move forward without having the same opportunities to learn how to use it.',
      'I studied computer engineering at the University of Texas at Dallas and now work as a senior software engineer at a Fortune 50 company. I have also taught coding to young people in a juvenile detention center and worked as a certified Spanish interpreter for 911, hospitals, and lawyers. Today, I serve on the Dallas Advisory Council of the Hispanic Scholarship Fund and interview Gates Scholarship applicants. Across these experiences, I have seen how much it matters to be able to learn, ask questions, and get support in your own language.',
      'That is why I founded IA Para Todos: to bring AI learning to our community through free workshops in Spanish, starting with the basics. I want more people to feel comfortable using it in daily life, at work, and with their families, and to help parents guide their children. Learning also means recognizing when AI gets things wrong, checking its answers, and protecting our information.',
      'Dallas–Fort Worth has been my home for almost eight years. This initiative begins here, with the idea of learning alongside our neighbors and, over time, sharing what works with more communities across the country. The opportunity to learn should not depend on the language you speak, your income, or how much you know about technology.',
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

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
      'Nací en México y el español es mi primer idioma. Estudié ingeniería en computación en la Universidad de Texas en Dallas y hoy soy ingeniero senior de software en una empresa Fortune 50. También enseñé programación a jóvenes en un centro de detención juvenil, fui intérprete certificado de español para el 911, hospitales y abogados, y hoy formo parte del Consejo Asesor de Dallas del Hispanic Scholarship Fund y entrevisto a aspirantes de la Beca Gates.',
      'Cada vez que la tecnología da un salto, las familias trabajadoras de bajos ingresos se quedan atrás. Lo viví en carne propia: crecí en un hogar de bajos ingresos y no toqué una computadora hasta 2010, años después del auge de las computadoras. Con la inteligencia artificial está pasando lo mismo, y esta vez la IA ya se enseña en las escuelas.',
      'Fundé IA Para Todos para que las familias hispanohablantes entiendan qué es la IA, cómo usarla y cómo proteger a sus hijos: sus beneficios y sus riesgos. Vivo en Dallas–Fort Worth desde hace casi 8 años y creo en esta comunidad. Empezamos aquí, con la visión de llegar a todo el país.',
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
      'I was born in Mexico and Spanish is my first language. I studied computer engineering at the University of Texas at Dallas and today I am a senior software engineer at a Fortune 50 company. I have also taught coding to youth in a juvenile detention center, worked as a certified Spanish interpreter for 911, hospitals, and lawyers, and today I serve on the Dallas Advisory Council of the Hispanic Scholarship Fund and interview Gates Scholarship applicants.',
      'Every time technology leaps forward, hardworking low-income families get left behind. I lived it: I grew up in a low-income household and did not touch a computer until 2010, years after the computer boom. The same is happening with artificial intelligence — except this time AI is already being taught in schools.',
      'I founded IA Para Todos so Spanish-speaking families understand what AI is, how to use it, and how to protect their children: its benefits and its risks. I have lived in Dallas–Fort Worth for almost 8 years and I believe in this community. We start here, with the vision of reaching the whole country.',
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

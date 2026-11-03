import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PageCover } from '../../shared/page-cover/page-cover';
import { StatusStrip } from '../../shared/status-strip/status-strip';
import { MissionVision } from '../../shared/mission-vision/mission-vision';
import { FounderStory } from '../../shared/founder-story/founder-story';
import { ValuesSection } from '../../shared/values-section/values-section';
import { CommunityInvitation } from '../../shared/community-invitation/community-invitation';
import { ParticipationSection } from '../../shared/participation-section/participation-section';
import { FaqSection } from '../../shared/faq-section/faq-section';
import type { FaqItem } from '../../shared/faq-section/faq-section';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy: Record<Lang, { title: string; summary: string; photo: string; faqHeading: string; faqLead: string; faq: FaqItem[] }> = {
  es: {
    title: 'Quiénes somos',
    summary: 'IA Para Todos es una iniciativa comunitaria que ofrece talleres gratuitos en español para aprender a usar la inteligencia artificial en la vida diaria, el trabajo y la familia. Nuestras sesiones son para principiantes, solo requieren un teléfono inteligente y no tienen ningún costo.',
    photo: 'Una madre y su hija usando una computadora en casa.',
    faqHeading: 'Preguntas sobre la iniciativa',
    faqLead: 'Lo que nos preguntan sobre quiénes somos y cómo trabajamos.',
    faq: [
      { question: '¿Son una organización sin fines de lucro?', answer: 'Todavía no. Somos una iniciativa comunitaria en etapa exploratoria: aún no realizamos talleres oficiales ni tenemos alianzas formales. Los talleres y cursos son gratuitos y seguirán siéndolo.' },
      { question: '¿Cuánto cuestan los talleres?', answer: 'Nada. Son gratuitos para la comunidad y solo usan herramientas gratuitas. Empresas y donaciones externas cubren los costos.' },
      { question: '¿Los talleres tienen contenido religioso?', answer: 'No. La iniciativa es inclusiva y no sectaria: todas las personas son bienvenidas, sin importar sus creencias.' },
      { question: '¿Para quiénes son los talleres?', answer: 'Para personas adultas hispanohablantes que empiezan desde cero, especialmente en Dallas–Fort Worth. Solo necesitas un teléfono inteligente y curiosidad.' },
      { question: '¿Quién está detrás de la iniciativa?', answer: 'Jaime Huerta Cruz, ingeniero de software y vecino de Dallas–Fort Worth, fundó IA Para Todos para acercar la IA a nuestra comunidad en español. Puedes leer su historia en esta misma página.' },
    ],
  },
  en: {
    title: 'Who we are',
    summary: 'IA Para Todos (AI for Everyone) is a community initiative offering free Spanish-language workshops that help adults understand and use artificial intelligence in daily life, work, and family. Sessions are beginner-friendly, smartphone-only, and always free.',
    photo: 'A mother and daughter using a computer at home.',
    faqHeading: 'Questions about the initiative',
    faqLead: 'What people ask about who we are and how we work.',
    faq: [
      { question: 'Are you a nonprofit organization?', answer: 'Not yet. We are a community initiative in the exploratory stage: we have not held official workshops or formed formal partnerships. Workshops and courses are free and will stay that way.' },
      { question: 'How much do workshops cost?', answer: 'Nothing. They are free for the community and only use free tools. Companies and external donations cover the costs.' },
      { question: 'Do workshops include religious content?', answer: 'No. The initiative is inclusive and nonsectarian: everyone is welcome, whatever their beliefs.' },
      { question: 'Who are the workshops for?', answer: 'Spanish-speaking adults starting from zero, especially in Dallas–Fort Worth. You only need a smartphone and curiosity.' },
      { question: 'Who is behind the initiative?', answer: 'Jaime Huerta Cruz, a software engineer and Dallas–Fort Worth neighbor, founded IA Para Todos to bring AI learning to our community in Spanish. You can read his story on this very page.' },
    ],
  },
};

@Component({selector: 'app-about', imports: [PageCover, StatusStrip, MissionVision, FounderStory, ValuesSection, CommunityInvitation, ParticipationSection, FaqSection], templateUrl: './about.html', styles: `main:focus { outline: none; }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class About {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { ParticipationSection } from '../../shared/participation-section/participation-section';
import { FaqSection } from '../../shared/faq-section/faq-section';
@Component({selector: 'app-participation-page', imports: [PageIntro, ParticipationSection, FaqSection], template: `<main id="main-content" tabindex="-1"><app-page-intro [title]="community() ? 'Aprender en comunidad' : 'Participa — demostración'" [lead]="community() ? 'Todas las personas son bienvenidas. Queremos aprender juntos y acompañar a quienes dan sus primeros pasos con la tecnología.' : 'Explora cómo podría ser participar en un futuro taller. Aún no hay talleres programados ni inscripciones abiertas.'" [paragraphs]="paragraphs()" /><app-participation-section [page]="true" [context]="community() ? 'community' : 'workshops'" /><app-faq-section /></main>`, styles: `main:focus { outline: none; }`, changeDetection: ChangeDetectionStrategy.OnPush})
export class ParticipationPage {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  protected readonly community = computed(() => !!this.data()['community']);
  protected readonly paragraphs = computed(() => this.community() ? [
    'La iniciativa es inclusiva y no sectaria; los talleres no contienen contenido religioso. Se contemplan roles de facilitación, acompañamiento, traducción y difusión. Estos roles aún están por definir y no hay personas voluntarias reclutadas.',
    'El formulario de abajo es una demostración local. Usa datos inventados: nada se envía, se guarda, te suscribe ni te registra como participante o colaborador.',
  ] : ['El formulario es una práctica local. Usa datos inventados: nada se envía, se guarda, te suscribe ni te registra. Los talleres previstos serían gratuitos y usarían herramientas gratuitas.']);
}

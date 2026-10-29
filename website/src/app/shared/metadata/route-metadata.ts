import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RouteMetadata {
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly descriptions: Record<string, string> = {
    '': 'Iniciativa comunitaria en preparación: talleres gratuitos en español para aprender inteligencia artificial desde cero, con tu teléfono.',
    talleres: 'Explora cuatro talleres previstos de IA en español: primeros pasos, vida diaria, trabajo y negocios, y padres y familias. Borradores pendientes de piloto.',
    nosotros: 'Conoce la misión, el enfoque comunitario y la etapa exploratoria de IA para todos, una iniciativa educativa en español.',
    comunidad: 'Descubre formas propuestas de colaborar con IA para todos. Roles aún por definir y formulario de demostración local.',
    participar: 'Prueba la demostración local de participación con datos inventados. No envía información ni abre una inscripción.',
    historias: 'Cinco escenarios de aprendizaje inventados para imaginar cómo practicar con IA. Ejemplos ilustrativos, no testimonios.',
    contacto: 'Consulta el estado de los canales de contacto de IA para todos y su enfoque previsto en Dallas–Fort Worth.',
    '**': 'No encontramos esa página. Vuelve al inicio o explora los talleres previstos de IA para todos.',
  };

  update(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const data = route.data;
    const description: string = data['detail']?.summary ?? data['catalog']?.summary ?? data['information']?.intro ?? this.descriptions[route.routeConfig?.path ?? ''] ?? this.descriptions[''];
    const title = typeof route.title === 'string' ? route.title : 'IA para todos';
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    if (route.routeConfig?.path === '**') this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
    else this.meta.removeTag('name="robots"');
  }
}

import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DEFAULT_SOCIAL_IMAGE, SITE_LOCALE, SITE_URL } from './site';

@Injectable({ providedIn: 'root' })
export class RouteMetadata {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly descriptions: Record<string, string> = {
    '': 'Iniciativa comunitaria: talleres gratuitos en español para aprender inteligencia artificial desde cero, con tu teléfono.',
    talleres: 'Cuatro talleres de IA en español: primeros pasos, vida diaria, trabajo y negocios, y padres y familias.',
    nosotros: 'Conoce la misión y el enfoque comunitario de IA para todos, una iniciativa educativa en español.',
    comunidad: 'Formas de colaborar con IA para todos: facilitación, acompañamiento, traducción y difusión.',
    participar: 'Explora cómo participar en los talleres de IA para todos. El formulario es una práctica local con datos inventados.',
    historias: 'Cinco escenarios de aprendizaje inventados para imaginar cómo practicar con IA. Ejemplos ilustrativos, no testimonios.',
    contacto: 'Contacto de IA para todos, iniciativa educativa en español en Dallas–Fort Worth.',
    '**': 'No encontramos esa página. Vuelve al inicio o explora los talleres de IA para todos.',
  };

  update(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const data = route.data;
    const path = route.routeConfig?.path ?? '';
    const description: string = data['detail']?.summary ?? data['catalog']?.summary ?? data['information']?.intro ?? this.descriptions[path] ?? this.descriptions[''];
    const title = typeof route.title === 'string' ? route.title : 'IA para todos';
    const image = `${SITE_URL}${DEFAULT_SOCIAL_IMAGE.path}`;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: SITE_LOCALE });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:width', content: String(DEFAULT_SOCIAL_IMAGE.width) });
    this.meta.updateTag({ property: 'og:image:height', content: String(DEFAULT_SOCIAL_IMAGE.height) });
    this.meta.updateTag({ property: 'og:image:alt', content: DEFAULT_SOCIAL_IMAGE.alt });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: DEFAULT_SOCIAL_IMAGE.alt });
    if (path === '**') {
      this.meta.updateTag({ property: 'og:url', content: SITE_URL });
      this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
      this.removeCanonical();
    } else {
      const canonical = path === '' ? `${SITE_URL}/` : `${SITE_URL}/${path}`;
      this.meta.updateTag({ property: 'og:url', content: canonical });
      this.meta.removeTag('name="robots"');
      this.setCanonical(canonical);
    }
  }

  private setCanonical(href: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private removeCanonical(): void {
    this.document.querySelector('link[rel="canonical"]')?.remove();
  }
}

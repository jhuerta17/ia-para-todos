import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from './site';
import { BRAND_NAME, Lang, OG_LOCALE } from '../../i18n/lang';
import { Language } from '../../i18n/language';

const DESCRIPTIONS: Record<Lang, Record<string, string>> = {
  es: {
    home: 'Iniciativa comunitaria: talleres gratuitos en español para aprender inteligencia artificial desde cero, con tu teléfono.',
    talleres: 'Cuatro talleres de IA en español: primeros pasos, vida diaria, trabajo y negocios, y padres y familias.',
    nosotros: 'Conoce la misión y el enfoque comunitario de IA para todos, una iniciativa educativa en español.',
    comunidad: 'Formas de colaborar con IA para todos: facilitación, acompañamiento, traducción y difusión.',
    participar: 'Explora cómo participar en los talleres de IA para todos. El formulario es una práctica local con datos inventados.',
    historias: 'Cinco escenarios de aprendizaje inventados para imaginar cómo practicar con IA. Ejemplos ilustrativos, no testimonios.',
    contacto: 'Contacto de IA para todos, iniciativa educativa en español en Dallas–Fort Worth.',
    '**': 'No encontramos esa página. Vuelve al inicio o explora los talleres de IA para todos.',
  },
  en: {
    home: 'Community initiative: free workshops in Spanish to learn artificial intelligence from scratch, with your phone.',
    talleres: 'Four AI workshops in Spanish: first steps, everyday life, work and business, and parents and families.',
    nosotros: 'Learn about the mission and community focus of AI for everyone, an educational initiative in Spanish.',
    comunidad: 'Ways to collaborate with AI for everyone: facilitation, guidance, translation, and outreach.',
    participar: 'Explore how to take part in AI for everyone workshops. The form is a local practice with made-up data.',
    historias: 'Five fictional learning scenarios to imagine practicing with AI. Illustrative examples, not testimonials.',
    contacto: 'Contact AI for everyone, a Spanish-language educational initiative in Dallas–Fort Worth.',
    '**': 'We could not find that page. Go back home or explore the AI for everyone workshops.',
  },
};

const NOT_FOUND_TITLE: Record<Lang, string> = {
  es: 'Página no encontrada · IA para todos',
  en: 'Page not found · AI for everyone',
};

@Injectable({ providedIn: 'root' })
export class RouteMetadata {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly language = inject(Language);

  update(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const data = route.data;
    const lang = this.language.lang();
    const descriptions = DESCRIPTIONS[lang];
    const key = typeof data['key'] === 'string' ? data['key'] : '';
    const description: string = data['detail']?.summary ?? data['catalog']?.summary ?? data['information']?.intro ?? descriptions[key] ?? descriptions['home'];
    const title = typeof route.title === 'string' ? route.title : BRAND_NAME[lang];
    const image = DEFAULT_SOCIAL_IMAGE[lang];
    this.document.documentElement.lang = lang;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:site_name', content: BRAND_NAME[lang] });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALE[lang] });
    this.meta.updateTag({ property: 'og:image', content: `${SITE_URL}${image.path}` });
    this.meta.updateTag({ property: 'og:image:width', content: String(image.width) });
    this.meta.updateTag({ property: 'og:image:height', content: String(image.height) });
    this.meta.updateTag({ property: 'og:image:alt', content: image.alt });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: `${SITE_URL}${image.path}` });
    this.meta.updateTag({ name: 'twitter:image:alt', content: image.alt });
    this.updateSchema(lang);
    if (route.routeConfig?.path === '**') {
      this.title.setTitle(NOT_FOUND_TITLE[lang]);
      this.meta.updateTag({ property: 'og:url', content: SITE_URL });
      this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
      this.removeCanonical();
      this.removeAlternates();
    } else {
      const path = route.routeConfig?.path ?? '';
      const canonical = path === '' ? `${SITE_URL}/` : `${SITE_URL}/${path}`;
      this.meta.updateTag({ property: 'og:url', content: canonical });
      this.meta.removeTag('name="robots"');
      this.setCanonical(canonical);
      this.setAlternates(data['pair'] as string | undefined, canonical);
    }
  }

  private setAlternates(pair: string | undefined, canonical: string): void {
    if (typeof pair !== 'string') {
      this.removeAlternates();
      return;
    }
    const peer = `${SITE_URL}${pair}`;
    const es = this.language.lang() === 'es' ? canonical : peer;
    const en = this.language.lang() === 'en' ? canonical : peer;
    this.setLink('alternate-es', 'alternate', 'es', es);
    this.setLink('alternate-en', 'alternate', 'en', en);
    this.setLink('alternate-default', 'alternate', 'x-default', es);
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

  private setLink(id: string, rel: string, hreflang: string, href: string): void {
    let link = this.document.querySelector<HTMLLinkElement>(`link[data-hreflang="${id}"]`);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('data-hreflang', id);
      link.rel = rel;
      link.hreflang = hreflang;
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private removeAlternates(): void {
    this.document.querySelectorAll('link[data-hreflang]').forEach(link => link.remove());
  }

  private updateSchema(lang: Lang): void {
    const script = this.document.querySelector<HTMLScriptElement>('script#site-schema');
    if (!script) return;
    try {
      const schema = JSON.parse(script.textContent ?? '{}') as { '@graph'?: { '@type'?: string; name?: string; inLanguage?: string }[] };
      for (const node of schema['@graph'] ?? []) {
        if (node['@type'] === 'WebSite' || node['@type'] === 'Organization') node['name'] = BRAND_NAME[lang];
        if (node['@type'] === 'WebSite') node['inLanguage'] = lang;
      }
      script.textContent = JSON.stringify(schema);
    } catch {
      // Keep the static schema when it cannot be parsed.
    }
  }
}

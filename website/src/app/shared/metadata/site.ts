/**
 * Single source of truth for site-wide launch metadata.
 *
 * SITE_URL is provisional: the production domain is not decided yet
 * (see docs/brand/brand-guidelines.md). Replace it with the real
 * canonical https origin before launch, update the matching placeholder
 * values in src/index.html, then rebuild so canonicals, social URLs,
 * sitemap.xml and robots.txt agree on one host. The postbuild script
 * fails the build when these values drift apart.
 */
export const SITE_URL = 'https://ia-para-todos.example.org';

export const SITE_NAME = 'IA para todos';
export const SITE_LOCALE = 'es_ES';

export const DEFAULT_SOCIAL_IMAGE = {
  path: '/images/social/og-banner-1200x630.jpg',
  width: 1200,
  height: 630,
  alt: 'IA para todos: talleres gratuitos en español para aprender inteligencia artificial desde cero.',
} as const;

export const SITE_LOGO = {
  path: '/images/brand/ia-para-todos-symbol-color.png',
  width: 1254,
  height: 1254,
} as const;

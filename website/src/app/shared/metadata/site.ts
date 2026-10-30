import type { Lang } from '../../i18n/lang';

/**
 * Single source of truth for site-wide launch metadata.
 *
 * SITE_URL is the canonical production origin. Update the matching values
 * in src/index.html when it changes, then rebuild so canonicals, social
 * URLs, sitemap.xml and robots.txt agree on one host. The postbuild
 * script fails the build when these values drift apart.
 */
export const SITE_URL = 'https://ia-para-todos-jh.netlify.app';

export const DEFAULT_SOCIAL_IMAGE: Record<Lang, { path: string; width: number; height: number; alt: string }> = {
  es: {
    path: '/images/social/og-banner-1200x630.jpg',
    width: 1200,
    height: 630,
    alt: 'IA Para Todos: talleres gratuitos en español para aprender inteligencia artificial desde cero.',
  },
  en: {
    path: '/images/social/og-banner-en-1200x630.jpg',
    width: 1200,
    height: 630,
    alt: 'AI for everyone: free workshops in Spanish to learn artificial intelligence from scratch.',
  },
};

export const SITE_LOGO = {
  path: '/images/brand/ia-para-todos-symbol-color.png',
  width: 1254,
  height: 1254,
} as const;

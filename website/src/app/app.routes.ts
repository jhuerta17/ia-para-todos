import { adminGuard, adminGuardChild } from './admin/auth/admin-guard';
import { portalGuard, portalGuardChild } from './portal/auth/portal-guard';
import { pageTransitionGuard } from './shared/page-transition/page-transition-guard';
import { informationPages } from './data/information-pages';
import { resourceDetails } from './data/resource-details';
import { activityDetails } from './data/activity-details';
import { workshopDetails } from './data/workshop-details';
import { resources } from './data/resources';
import { Routes } from '@angular/router';
import { activities } from './data/activities';
import { workshops } from './data/workshops';
import { BRAND_NAME, DetailKind, Lang, PATHS, StaticKey, detailUrl, sectionUrl } from './i18n/lang';
import { Home } from './pages/home';

const TITLES: Record<Lang, Record<StaticKey, string>> = {
  es: {
    home: 'IA para todos', talleres: 'Talleres · IA para todos', actividades: 'Actividades · IA para todos',
    recursos: 'Recursos para aprender · IA para todos', nosotros: 'Nosotros · IA para todos', comunidad: 'Comunidad · IA para todos',
    participar: 'Participa · IA para todos', contacto: 'Contacto · IA para todos',
    cursos: 'Cursos en línea · IA para todos',
    donar: 'Donar · IA para todos',
    privacidad: '', terminos: '', seguridad: '',
  },
  en: {
    home: 'AI for everyone', talleres: 'Workshops · AI for everyone', actividades: 'Activities · AI for everyone',
    recursos: 'Resources for learning · AI for everyone', nosotros: 'About us · AI for everyone', comunidad: 'Community · AI for everyone',
    participar: 'Participate · AI for everyone', contacto: 'Contact · AI for everyone',
    cursos: 'Online courses · AI for everyone',
    donar: 'Donate · AI for everyone',
    privacidad: '', terminos: '', seguridad: '',
  },
};

const CATALOGS = {
  es: {
    actividades: { kind: 'activities', title: 'Actividades', summary: 'Ideas para practicar con ejemplos cotidianos, a tu ritmo y en comunidad.', image: 'peer-support', status: 'Prácticas guiadas para aprender con ejemplos cotidianos.', entries: activities.es },
    recursos: { kind: 'resources', title: 'Recursos para aprender', summary: 'Guías sencillas para descubrir la IA, practicar con cuidado y seguir aprendiendo a tu ritmo.', image: 'community-learning', status: 'Guías para descubrir la IA y seguir aprendiendo a tu ritmo.', entries: resources.es },
  },
  en: {
    actividades: { kind: 'activities', title: 'Activities', summary: 'Ideas for practicing with everyday examples, at your pace and in community.', image: 'peer-support', status: 'Guided practices for learning with everyday examples.', entries: activities.en },
    recursos: { kind: 'resources', title: 'Resources for learning', summary: 'Simple guides to discover AI, practice carefully, and keep learning at your pace.', image: 'community-learning', status: 'Guides to discover AI and keep learning at your pace.', entries: resources.en },
  },
} as const;

const peer = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');

function staticRoutes(lang: Lang): Routes {
  const other = peer(lang);
  const brand = BRAND_NAME[lang];
  const pair = (key: StaticKey) => sectionUrl(key, other);
  return [
    { path: PATHS.home[lang], component: Home, title: TITLES[lang].home, data: { lang, key: 'home', pair: pair('home') } },
    { path: PATHS.talleres[lang], loadComponent: () => import('./pages/workshop-list/workshop-list').then(module => module.WorkshopList), title: TITLES[lang].talleres, data: { lang, key: 'talleres', pair: pair('talleres') } },
    { path: PATHS.actividades[lang], loadComponent: () => import('./pages/catalog-page/catalog-page').then(module => module.CatalogPage), title: TITLES[lang].actividades, data: { lang, key: 'actividades', pair: pair('actividades'), catalog: CATALOGS[lang].actividades } },
    { path: PATHS.recursos[lang], loadComponent: () => import('./pages/catalog-page/catalog-page').then(module => module.CatalogPage), title: TITLES[lang].recursos, data: { lang, key: 'recursos', pair: pair('recursos'), catalog: CATALOGS[lang].recursos } },
    { path: PATHS.nosotros[lang], loadComponent: () => import('./pages/about/about').then(module => module.About), title: TITLES[lang].nosotros, data: { lang, key: 'nosotros', pair: pair('nosotros') } },
    { path: PATHS.comunidad[lang], loadComponent: () => import('./pages/participation-page/participation-page').then(module => module.ParticipationPage), title: TITLES[lang].comunidad, data: { lang, key: 'comunidad', pair: pair('comunidad'), community: true } },
    { path: PATHS.participar[lang], loadComponent: () => import('./pages/participation-page/participation-page').then(module => module.ParticipationPage), title: TITLES[lang].participar, data: { lang, key: 'participar', pair: pair('participar') } },
    { path: PATHS.contacto[lang], loadComponent: () => import('./pages/contact/contact').then(module => module.Contact), title: TITLES[lang].contacto, data: { lang, key: 'contacto', pair: pair('contacto') } },
    { path: PATHS.cursos[lang], loadComponent: () => import('./pages/courses/courses').then(module => module.Courses), title: TITLES[lang].cursos, data: { lang, key: 'cursos', pair: pair('cursos') } },
    { path: PATHS.donar[lang], loadComponent: () => import('./pages/donate/donate').then(module => module.Donate), title: TITLES[lang].donar, data: { lang, key: 'donar', pair: pair('donar') } },
    ...informationPages[lang].map((information, index) => ({ path: information.path, loadComponent: () => import('./pages/information/information').then(module => module.Information), title: `${information.title} · ${brand}`, data: { lang, pair: `/${informationPages[other][index].path}`, information } })),
  ];
}

function detailRoutes(lang: Lang): Routes {
  const other = peer(lang);
  const brand = BRAND_NAME[lang];
  const details: { kind: DetailKind; entries: { slug: string; title: string }[]; details: { summary: string }[] }[] = [
    { kind: 'talleres', entries: workshops[lang], details: workshopDetails[lang] },
    { kind: 'actividades', entries: activities[lang], details: activityDetails[lang] },
    { kind: 'recursos', entries: resources[lang], details: resourceDetails[lang] },
  ];
  const peerSlugs: Record<DetailKind, string[]> = {
    talleres: workshops[other].map(entry => entry.slug),
    actividades: activities[other].map(entry => entry.slug),
    recursos: resources[other].map(entry => entry.slug),
  };
  return details.flatMap(({ kind, entries, details }) =>
    entries.map((entry, index) => ({
      path: `${PATHS[kind][lang]}/${entry.slug}`,
      loadComponent: () => import('./pages/content-detail/content-detail').then(module => module.ContentDetail),
      title: `${entry.title} · ${brand}`,
      data: { lang, pair: detailUrl(kind, peerSlugs[kind][index], other), detail: details[index] },
    })),
  );
}

/** Wraps public routes with the page-transition guard: activation waits for
 * the wipe panel to cover the viewport, so the swap stays hidden. Admin
 * routes are left untouched and stay instant. */
function withWipe(routes: Routes): Routes {
  return routes.map((route) => ({ ...route, canActivate: [...(route.canActivate ?? []), pageTransitionGuard] }));
}

export const routes: Routes = [
  ...withWipe(staticRoutes('es')),
  ...withWipe(detailRoutes('es')),
  ...withWipe(staticRoutes('en')),
  ...withWipe(detailRoutes('en')),
  {
    path: 'admin', loadComponent: () => import('./admin/layout/admin-layout/admin-layout').then(module => module.AdminLayout),
    canActivate: [adminGuard],
    canActivateChild: [adminGuardChild],
    children: [
      { path: '', loadComponent: () => import('./admin/pages/admin-overview/admin-overview').then(module => module.AdminOverview), title: 'Dashboard · AI for everyone', data: { lang: 'en', admin: true } },
      { path: 'requests', loadComponent: () => import('./admin/pages/admin-inbox/admin-inbox').then(module => module.AdminInbox), title: 'Requests · AI for everyone', data: { lang: 'en', admin: true } },
      { path: 'workshops', loadComponent: () => import('./admin/pages/admin-workshops/admin-workshops').then(module => module.AdminWorkshops), title: 'Workshops · AI for everyone', data: { lang: 'en', admin: true } },
      { path: 'impact', loadComponent: () => import('./admin/pages/admin-impact/admin-impact').then(module => module.AdminImpact), title: 'Impact · AI for everyone', data: { lang: 'en', admin: true } },
      { path: 'supporters', loadComponent: () => import('./admin/pages/admin-supporters/admin-supporters').then(module => module.AdminSupporters), title: 'Supporters · AI for everyone', data: { lang: 'en', admin: true } },
      { path: 'plans', loadComponent: () => import('./admin/pages/admin-plans/admin-plans').then(module => module.AdminPlans), title: 'Plans · AI for everyone', data: { lang: 'en', admin: true } },
      { path: 'sign-in', loadComponent: () => import('./admin/pages/admin-access/admin-access').then(module => module.AdminAccess), title: 'Admin sign-in · AI for everyone', data: { lang: 'en', admin: true, adminLogin: true, bare: true } },
    ],
  },
  {
    // Student portal (step 2: Identity auth, any signed-in role).
    // Stays instant like admin: no page-transition guard on app surfaces.
    path: 'portal', loadComponent: () => import('./portal/layout/portal-layout/portal-layout').then(module => module.PortalLayout),
    canActivate: [portalGuard],
    canActivateChild: [portalGuardChild],
    children: [
      { path: '', loadComponent: () => import('./portal/pages/portal-home/portal-home').then(module => module.PortalHome), title: 'Portal del estudiante · IA para todos', data: { lang: 'es', portal: true } },
      { path: 'sign-in', loadComponent: () => import('./portal/pages/portal-sign-in/portal-sign-in').then(module => module.PortalSignIn), title: 'Iniciar sesión · IA para todos', data: { lang: 'es', portal: true, portalAuth: true } },
      { path: 'sign-up', loadComponent: () => import('./portal/pages/portal-sign-up/portal-sign-up').then(module => module.PortalSignUp), title: 'Crear cuenta · IA para todos', data: { lang: 'es', portal: true, portalAuth: true } },
    ],
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then(module => module.NotFound), title: 'Página no encontrada · IA para todos', canActivate: [pageTransitionGuard] },
];

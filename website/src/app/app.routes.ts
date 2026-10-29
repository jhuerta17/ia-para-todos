import { informationPages } from './data/information-pages';
import { resourceDetails } from './data/resource-details';
import { activityDetails } from './data/activity-details';
import { workshopDetails } from './data/workshop-details';
import { resources } from './data/resources';
import { Routes } from '@angular/router';
import { activities } from './data/activities';
import { workshops } from './data/workshops';
import { Home } from './pages/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'IA para todos' },
  { path: 'talleres', loadComponent: () => import('./pages/workshop-list/workshop-list').then(module => module.WorkshopList), title: 'Talleres previstos · IA para todos' },
  { path: 'actividades', loadComponent: () => import('./pages/catalog-page/catalog-page').then(module => module.CatalogPage), title: 'Actividades previstas · IA para todos', data: { catalog: { kind: 'activities', title: 'Actividades previstas', summary: 'Ideas para practicar con ejemplos cotidianos. Son propuestas para futuros talleres, sin fechas ni sedes confirmadas.', image: 'peer-support', status: 'Actividades previstas; no son eventos programados.', entries: activities } } },
  { path: 'recursos', loadComponent: () => import('./pages/catalog-page/catalog-page').then(module => module.CatalogPage), title: 'Recursos para aprender · IA para todos', data: { catalog: { kind: 'resources', title: 'Recursos para aprender', summary: 'Guías sencillas para descubrir la IA, practicar con cuidado y seguir aprendiendo a tu ritmo.', image: 'community-learning', status: 'Recursos educativos en borrador, pendientes de revisión. Aún no publicados.', entries: resources } } },
  { path: 'nosotros', loadComponent: () => import('./pages/about/about').then(module => module.About), title: 'Nosotros · IA para todos' },
  { path: 'comunidad', loadComponent: () => import('./pages/participation-page/participation-page').then(module => module.ParticipationPage), title: 'Comunidad · IA para todos', data: { community: true } },
  { path: 'participar', loadComponent: () => import('./pages/participation-page/participation-page').then(module => module.ParticipationPage), title: 'Participa — demostración · IA para todos' },
  { path: 'historias', loadComponent: () => import('./pages/stories/stories').then(module => module.Stories), title: 'Historias ilustrativas · IA para todos' },
  { path: 'contacto', loadComponent: () => import('./pages/contact/contact').then(module => module.Contact), title: 'Contacto · IA para todos' },
  ...informationPages.map(information => ({ path: information.path, loadComponent: () => import('./pages/information/information').then(module => module.Information), title: `${information.title} · IA para todos`, data: { information } })),
  ...workshops.map((workshop, index) => ({ path: `talleres/${workshop.slug}`, loadComponent: () => import('./pages/content-detail/content-detail').then(module => module.ContentDetail), title: `${workshop.title} · IA para todos`, data: { detail: workshopDetails[index] } })),
  ...activities.map((activity, index) => ({ path: `actividades/${activity.slug}`, loadComponent: () => import('./pages/content-detail/content-detail').then(module => module.ContentDetail), title: `${activity.title} · IA para todos`, data: { detail: activityDetails[index] } })),
  ...resources.map((resource, index) => ({ path: `recursos/${resource.slug}`, loadComponent: () => import('./pages/content-detail/content-detail').then(module => module.ContentDetail), title: `${resource.title} · IA para todos`, data: { detail: resourceDetails[index] } })),
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then(module => module.NotFound), title: 'Página no encontrada · IA para todos' },
];

import { ParticipationPage } from './pages/participation-page/participation-page';
import { Stories } from './pages/stories/stories';
import { About } from './pages/about/about';
import { resourceDetails } from './data/resource-details';
import { CatalogPage } from './pages/catalog-page/catalog-page';
import { activityDetails } from './data/activity-details';
import { ContentDetail } from './pages/content-detail/content-detail';
import { workshopDetails } from './data/workshop-details';
import { WorkshopList } from './pages/workshop-list/workshop-list';
import { resources } from './data/resources';
import { Routes } from '@angular/router';
import { activities } from './data/activities';
import { workshops } from './data/workshops';
import { Home } from './pages/home';
import { PagePreview } from './pages/page-preview';

const pages = [
  ['contacto', 'Conversemos', 'Los canales públicos de contacto aún no están disponibles. Esta página forma parte de una demostración local.'],
  ['privacidad', 'Privacidad de la demostración', 'Esta demostración no envía formularios, no almacena datos personales y no procesa pagos.'],
  ['terminos', 'Acerca de esta demostración', 'El sitio está en preparación. Sus contenidos describen una iniciativa educativa exploratoria y no constituyen una oferta de talleres programados.'],
  ['seguridad', 'Aprender con cuidado', 'Practica con ejemplos inventados, evita compartir datos personales y verifica la información antes de usarla o compartirla.'],
];

export const routes: Routes = [
  { path: '', component: Home, title: 'IA para todos' },
  { path: 'talleres', component: WorkshopList, title: 'Talleres previstos · IA para todos' },
  { path: 'actividades', component: CatalogPage, title: 'Actividades previstas · IA para todos', data: { catalog: { kind: 'activities', title: 'Actividades previstas', summary: 'Ideas para practicar con ejemplos cotidianos. Son propuestas para futuros talleres, sin fechas ni sedes confirmadas.', image: 'peer-support', status: 'Actividades previstas; no son eventos programados.', entries: activities } } },
  { path: 'recursos', component: CatalogPage, title: 'Recursos para aprender · IA para todos', data: { catalog: { kind: 'resources', title: 'Recursos para aprender', summary: 'Guías sencillas para descubrir la IA, practicar con cuidado y seguir aprendiendo a tu ritmo.', image: 'community-learning', status: 'Recursos educativos en borrador, pendientes de revisión. Aún no publicados.', entries: resources } } },
  { path: 'nosotros', component: About, title: 'Nosotros · IA para todos' },
  { path: 'comunidad', component: ParticipationPage, title: 'Comunidad · IA para todos', data: { community: true } },
  { path: 'participar', component: ParticipationPage, title: 'Participa — demostración · IA para todos' },
  { path: 'historias', component: Stories, title: 'Historias ilustrativas · IA para todos' },
  ...pages.map(([path, heading, description]) => ({
    path, component: PagePreview, title: `${heading} · IA para todos`,
    data: { heading, description },
  })),
  ...workshops.map((workshop, index) => ({ path: `talleres/${workshop.slug}`, component: ContentDetail, title: `${workshop.title} · IA para todos`, data: { detail: workshopDetails[index] } })),
  ...activities.map((activity, index) => ({ path: `actividades/${activity.slug}`, component: ContentDetail, title: `${activity.title} · IA para todos`, data: { detail: activityDetails[index] } })),
  ...resources.map((resource, index) => ({ path: `recursos/${resource.slug}`, component: ContentDetail, title: `${resource.title} · IA para todos`, data: { detail: resourceDetails[index] } })),
  { path: '**', component: PagePreview, title: 'Página no encontrada · IA para todos',
    data: { heading: 'No encontramos esta página', description: 'Puedes volver al inicio para seguir explorando.' } },
];

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
  ['nosotros', 'Nosotros', 'Queremos acercar la inteligencia artificial a las comunidades mediante talleres gratuitos y prácticos en español. La iniciativa está en etapa exploratoria.'],
  ['recursos', 'Recursos para aprender', 'Estamos preparando guías sencillas para practicar, cuidar tus datos y verificar las respuestas de la inteligencia artificial.'],
  ['comunidad', 'Aprender en comunidad', 'Estamos explorando formas de colaborar y acompañar a quienes quieren aprender. Aún no contamos con alianzas formales.'],
  ['historias', 'Posibilidades para aprender', 'Aquí compartiremos situaciones ilustrativas sobre cómo practicar con inteligencia artificial. No representan testimonios ni resultados reales.'],
  ['contacto', 'Conversemos', 'Los canales públicos de contacto aún no están disponibles. Esta página forma parte de una demostración local.'],
  ['participar', 'Aprendamos paso a paso', 'La participación en futuros talleres será gratuita. Aún no hay inscripciones abiertas ni talleres programados.'],
  ['privacidad', 'Privacidad de la demostración', 'Esta demostración no envía formularios, no almacena datos personales y no procesa pagos.'],
  ['terminos', 'Acerca de esta demostración', 'El sitio está en preparación. Sus contenidos describen una iniciativa educativa exploratoria y no constituyen una oferta de talleres programados.'],
  ['seguridad', 'Aprender con cuidado', 'Practica con ejemplos inventados, evita compartir datos personales y verifica la información antes de usarla o compartirla.'],
];

export const routes: Routes = [
  { path: '', component: Home, title: 'IA para todos' },
  { path: 'talleres', component: WorkshopList, title: 'Talleres previstos · IA para todos' },
  { path: 'actividades', component: CatalogPage, title: 'Actividades previstas · IA para todos', data: { catalog: { kind: 'activities', title: 'Actividades previstas', summary: 'Ideas para practicar con ejemplos cotidianos. Son propuestas para futuros talleres, sin fechas ni sedes confirmadas.', image: 'peer-support', status: 'Actividades previstas; no son eventos programados.', entries: activities } } },
  ...pages.map(([path, heading, description]) => ({
    path, component: PagePreview, title: `${heading} · IA para todos`,
    data: { heading, description },
  })),
  ...workshops.map((workshop, index) => ({ path: `talleres/${workshop.slug}`, component: ContentDetail, title: `${workshop.title} · IA para todos`, data: { detail: workshopDetails[index] } })),
  ...activities.map((activity, index) => ({ path: `actividades/${activity.slug}`, component: ContentDetail, title: `${activity.title} · IA para todos`, data: { detail: activityDetails[index] } })),
  ...resources.map(resource => ({ path: `recursos/${resource.slug}`, component: PagePreview, title: `${resource.title} · IA para todos`, data: { heading: resource.title, description: `${resource.summary} Recurso en borrador, aún no publicado.` } })),
  { path: '**', component: PagePreview, title: 'Página no encontrada · IA para todos',
    data: { heading: 'No encontramos esta página', description: 'Puedes volver al inicio para seguir explorando.' } },
];

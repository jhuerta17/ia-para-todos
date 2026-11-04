// Browser plugin not available. Use the existing Playwright runtime and fictional APIs.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createPortalFixture } from './portal-fixture.mjs';
import { discoveryReply } from '../src/app/workshops/meta-workflows.ts';
const website=fileURLToPath(new URL('..',import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH ||= join(website,'../.playwright-browsers');
const {chromium}=await import('playwright-core');
const dist=join(website,'dist/website/browser');
const evidence=join(tmpdir(),'ia-para-todos-meta-browser');await mkdir(evidence,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.json':'application/json','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://local').pathname;let file=join(dist,path);if((await stat(file)).isDirectory())file=join(file,'index.html');res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});const errors=[],consoleErrors=[];
const user={id:'meta-browser-user',email:'fictional@example.com',app_metadata:{provider:'email',roles:['admin']},user_metadata:{full_name:'Example Admin'},confirmed_at:'2026-01-01'};
const jwt='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({exp:9999999999,email:user.email})).toString('base64url')+'.fixture';
const now=Date.now(),session={id:'11111111-1111-4111-8111-111111111111',topic:'trabajo-negocios',titleEs:'Taller de negocio ficticio',titleEn:'Fictional business workshop',language:'es',startsAt:new Date(now+7*86400000).toISOString(),endsAt:new Date(now+7*86400000+7200000).toISOString(),timeZone:'America/Chicago',venue:'Example Library',address:'Example address',accessibilityEs:'Acceso de ejemplo',accessibilityEn:'Example access',bringEs:'Teléfono',bringEn:'Phone',status:'published',capacity:10,available:5};
const fixture=createPortalFixture();let generated=0;let failDraft=false;let liveDraft=false;
const page=await browser.newPage({viewport:{width:1280,height:900}});page.setDefaultTimeout(10000);
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type())&&!m.text().includes('Failed to load resource'))consoleErrors.push(m.text());});
await page.addInitScript(({user,jwt})=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('gotrue.user',JSON.stringify({...user,url:'/.netlify/identity',audience:'',token:{access_token:jwt,expires_at:Date.now()+3600000,expires_in:3600,refresh_token:'fixture',token_type:'bearer'}}));sessionStorage.setItem('seeded','1');}},{user,jwt});
await page.route('**/.netlify/identity/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(new URL(route.request().url()).pathname.endsWith('/user')?user:{})}));
await page.route('**/api/portal/**',route=>{const url=new URL(route.request().url());const result=fixture(url.pathname.slice('/api/portal/'.length)+url.search,route.request().method(),route.request().postDataJSON(),user.id);return route.fulfill({status:result.status,contentType:'application/json',body:JSON.stringify(result.body)});});
await page.route('**/api/workshops/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({sessions:[session],reservations:[],completed:false})}));
await page.route('**/api/whatsapp/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'not_configured',missing:['WHATSAPP_ACCESS_TOKEN']})}));
await page.route('**/api/ai-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({live:false,reason:'paused'})}));
await page.route('**/api/ai-assist',route=>{generated++;return route.fulfill({status:failDraft?503:200,contentType:'application/json',body:JSON.stringify(failDraft?{reason:'unavailable'}:{reply:'Instagram\nExample invitation\nFacebook\nExample announcement\nWhatsApp\nExample invitation',demo:!liveDraft})});});
try{
  // Follow the actual links produced by discovery, without submitting bookings.
  for (const [command,lang] of [['Talleres','es'],['Workshops','en']]) {
    const reply=discoveryReply(command,[session],base,undefined,now).reply;
    const link=reply.split('\n').map(line=>line.match(/https?:\/\/\S+\?session=\S+/)?.[0]).find(Boolean);
    assert(link,'discovery contains a direct registration link');
    await page.goto(link,{waitUntil:'networkidle'});
    assert.equal(new URL(page.url()).searchParams.get('session'),session.id);
    assert(await page.title());
    await page.getByRole('heading',{name:lang==='es'?session.titleEs:session.titleEn,exact:true}).waitFor();
    await page.locator('#booking-name').waitFor();
    await page.locator('#booking-name').fill('Fictional visitor');
    assert.equal(await page.locator('#booking-name').inputValue(),'Fictional visitor');
    assert(await page.locator('.booking-registration button[type="submit"]').isDisabled());
    await page.screenshot({path:join(evidence,`whatsapp-registration-${lang}.png`),fullPage:false});
  }
  await page.goto(base+'/',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Por qué elegimos Meta',exact:true}).waitFor();await page.locator('app-meta-learning').screenshot({path:join(evidence,'why-meta-desktop.png')});assert(await page.locator('app-meta-learning img').evaluate(img=>img.complete&&img.naturalWidth>0));
  await page.goto(base+'/en/courses',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Learn with Meta AI',exact:true}).waitFor();assert.equal(await page.getByRole('link',{name:'Explore the free path',exact:true}).getAttribute('href'),'/portal/courses/learn-meta-ai');
  await page.goto(base+'/portal/courses',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Aprende con Meta AI',exact:true}).waitFor();
  assert.equal(await page.locator('.course-entry').count(),2);await page.locator('a[href="/portal/courses/learn-meta-ai"]').click();await page.getByRole('button',{name:'Inscribirme gratis',exact:true}).click();await page.getByRole('link',{name:'Continuar aprendiendo',exact:true}).waitFor();
  const ids=['everyday-messages','interview-practice','small-business'];
  for(const id of ids){await page.goto(base+'/portal/courses/learn-meta-ai/lessons/'+id,{waitUntil:'networkidle'});await page.locator('app-ai-tutor').waitFor();await page.getByRole('textbox',{name:'Escribe tu pregunta o tu prompt…'}).fill('Ayúdame a mejorar esta instrucción con datos ficticios');await page.getByRole('button',{name:'Enviar',exact:true}).click();await page.locator('.bubble.ai .sample').waitFor();await page.getByRole('textbox',{name:'Escribe tu pregunta o tu prompt…'}).fill('Hazla más breve y clara');await page.getByRole('button',{name:'Enviar',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.bubble.ai .sample').length===2);await page.getByRole('button',{name:'Marcar como completada',exact:true}).click();await page.getByRole('button',{name:'Completada',exact:true}).waitFor();}
  assert.equal(generated,0,'sample tutor never contacts inference endpoint');await page.reload();await page.getByTestId('course-progress').getByText('3 de 3 lecciones completadas').waitFor();await page.screenshot({path:join(evidence,'meta-challenge-desktop.png'),fullPage:false});
  await page.goto(base+'/portal/courses/first-prompt',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Inscribirme gratis',exact:true}).waitFor();assert.equal(await page.getByTestId('course-progress').count(),0,'legacy course still independent');
  await page.goto(base+'/portal/courses/learn-meta-ai/lessons/interview-practice',{waitUntil:'networkidle'});await page.getByRole('button',{name:'EN',exact:true}).click();await page.getByRole('heading',{name:'Prepare for an interview',exact:true}).waitFor();
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:join(evidence,'meta-challenge-mobile.png'),fullPage:false});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(base+'/admin/outreach',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Community outreach kit',exact:true}).waitFor();await page.getByText('Not configured. Missing: WHATSAPP_ACCESS_TOKEN',{exact:true}).waitFor();const generate=page.getByRole('button',{name:'Prepare three drafts',exact:true});assert(!await generate.isEnabled());await page.getByRole('checkbox').check();await page.getByLabel('Draft language',{exact:true}).selectOption('en');await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Prepare three drafts'))?.disabled);await generate.focus();await page.keyboard.press('Enter');await page.getByLabel('Instagram, Facebook, and WhatsApp — review and edit',{exact:true}).waitFor();await page.getByText('Powered by Meta Muse Spark · Sample reply; not generated live.',{exact:true}).waitFor();assert.equal(generated,1);
  await page.getByLabel('Instagram, Facebook, and WhatsApp — review and edit',{exact:true}).fill('Reviewed invitation');await page.getByRole('button',{name:'Copy drafts',exact:true}).click();await page.locator('#whatsapp-preview').fill('Workshops');await page.getByRole('button',{name:'Simulate reply',exact:true}).click();await page.locator('pre').getByText('Upcoming workshops.',{exact:false}).waitFor();await page.locator('#whatsapp-preview').fill('1');await page.getByRole('button',{name:'Simulate reply',exact:true}).click();await page.locator('pre').getByText('Book on the website; this message does not reserve a place.',{exact:false}).waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:join(evidence,'outreach-mobile.png'),fullPage:false});
  liveDraft=true;await generate.click();await page.getByText('Powered by Meta Muse Spark · Generated live.',{exact:true}).waitFor();failDraft=true;await generate.click();await page.getByRole('alert').getByText('Could not generate drafts.',{exact:false}).waitFor();assert.equal(await page.locator('#outreach-draft').count(),0);
  failDraft=false;liveDraft=false;await page.setViewportSize({width:1280,height:900});await generate.click();await page.locator('#outreach-draft').waitFor();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:join(evidence,'outreach-desktop.png'),fullPage:false});
  await page.goto(base+'/admin/outreach?demo=1',{waitUntil:'networkidle'});await page.getByText('Fictional data. Nothing will be published or sent.',{exact:true}).waitFor();await page.getByRole('checkbox').check();const count=generated;await generate.click();await page.locator('#outreach-draft').waitFor();assert.equal(generated,count,'demo makes no generation request');
  assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
  console.log('PASS Meta browser: page identity, bilingual public links, two-course enrollment isolation, all three challenge/revision flows, reload, sample/live/error labels, outreach consent/edit/copy, WhatsApp simulated selection, demo isolation, keyboard activation, mobile overflow, and clean console.');console.log('Evidence: '+evidence);
}catch(error){console.error('Failed page:',page.url(),(await page.locator('body').innerText()).slice(-5000));await page.screenshot({path:join(evidence,'failure.png'),fullPage:false});throw error;}finally{await browser.close();await new Promise(r=>server.close(r));}

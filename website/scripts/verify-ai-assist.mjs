// ai-assist proxy checks: pure units plus no-key handler behavior.
// Runs against the function module directly — no Netlify backend needed.
//
// Usage: npm run verify:ai
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mod = await import(join(root, 'netlify', 'functions', 'ai-assist.mts'));
const { scrubPII, buildSampleReply, buildMessages, parseReply } = mod;
const handle = mod.default;

const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`  ${ok ? 'ok' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
  if (!ok) failures.push(name);
};

check('scrub redacts email', scrubPII('escribe a ana@ejemplo.com ya') === 'escribe a [correo] ya');
check('scrub redacts phone', scrubPII('llama al 555-123-4567 hoy').includes('[teléfono]'));
check('scrub caps length', scrubPII('x'.repeat(5000)).length === 2000);
const msgs = buildMessages('tutor', 'es', [{ role: 'user', content: 'hola' }], '¿qué es un prompt?');
check('messages carry system + history + input', msgs.length === 3 && msgs[0].role === 'system' && msgs[2].content.includes('prompt'));
check('sample tutor es labels demo', buildSampleReply('tutor', 'es', 'hola').includes('respuesta de ejemplo'));
check('sample triage en echoes short input', buildSampleReply('triage', 'en', 'I can help').includes('I can help'));
check('parseReply extracts content', parseReply({ choices: [{ message: { content: '  hola  ' } }] }) === 'hola');
check('parseReply rejects junk', parseReply({ nope: 1 }) === null && parseReply(null) === null);

const post = (body) =>
  new Request('http://x/.netlify/functions/ai-assist', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
const get = new Request('http://x/.netlify/functions/ai-assist', { method: 'GET' });
check('GET rejected', (await handle(get, {})).status === 405);
check('bad body rejected', (await handle(post({ task: 'nope' }), {})).status === 400);
check('empty input rejected', (await handle(post({ task: 'tutor', lang: 'es', input: '  ' }), {})).status === 400);
const demo = await handle(post({ task: 'tutor', lang: 'es', history: [], input: '¿qué es un prompt?' }), {});
const demoJson = await demo.json();
check(
  'no-key returns labeled demo reply',
  demo.status === 200 && demoJson.demo === true && typeof demoJson.reply === 'string' && demoJson.reply.length > 20,
  `demo=${demoJson.demo}`,
);
const triage = await handle(post({ task: 'triage', lang: 'es', history: [], input: 'Puedo ayudar sábados' }), {});
const triageJson = await triage.json();
check('triage demo reply', triage.status === 200 && triageJson.demo === true && triageJson.reply.includes('Gracias'));

if (failures.length > 0) {
  console.log(`FAILURES: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('verify:ai: ok');

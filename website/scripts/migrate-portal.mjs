import { fileURLToPath } from 'node:url';
import { migratePortal } from './lib/portal-migrations.mjs';
const url=process.env.PORTAL_MIGRATION_DATABASE_URL;
if(!url){console.error('Set the server-only PORTAL_MIGRATION_DATABASE_URL before migrating.');process.exit(1);}
try {
  const pending=await migratePortal({connectionString:url,directory:fileURLToPath(new URL('../db/migrations',import.meta.url)),dryRun:process.argv.includes('--check')});
  console.log(`portal migrations: ${process.argv.includes('--check')?'pending':'applied'} ${pending.length}${pending.length?': '+pending.join(', '):''}`);
} catch {
  // Driver errors can contain credentials or SQL values; do not print them.
  console.error('Portal migration failed. Check connection, permissions, and migration integrity. No later migration was applied.');process.exitCode=1;
}

import type { Config } from '@netlify/functions';
import { PortalRepository } from '../lib/portal-repository.mts';
import { portalPool } from '../lib/portal-db.mts';
export default async () => {
  const repo = new PortalRepository(portalPool());
  await repo.purge();
  const { admin } = await import('@netlify/identity');
  await repo.retryDeletions(async id => {
    try { await admin.deleteUser(id); }
    catch (error) { if ((error as { status?: number }).status !== 404) throw error; }
  });
  return new Response(null,{status:204});
};
// Daily at 04:00 UTC; expired content is already excluded from API reads.
export const config: Config = { schedule: '0 4 * * *' };

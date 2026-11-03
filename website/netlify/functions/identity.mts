import type { UserValidateEvent, UserSignupEvent, UserDeletedEvent } from '@netlify/functions';
import { env } from '../lib/ai-security.mts';
import { portalPool } from '../lib/portal-db.mts';
import { transaction } from '../lib/portal-db.mts';
import { emailHash, reserveAdmission, PRIVACY_VERSION, PortalRepository } from '../lib/portal-repository.mts';

const invited = (user: UserValidateEvent['user']) => !!user.invitedAt || user.roles?.includes('admin') || (user.appMetadata?.['roles'] as string[] | undefined)?.includes('admin');
export default {
  async userValidate(event: UserValidateEvent) {
    if (invited(event.user)) return;
    if (env('PORTAL_SIGNUP_ENABLED') !== 'true' || event.user.userMetadata?.['adult'] !== true ||
        event.user.userMetadata?.['privacy_version'] !== PRIVACY_VERSION || !event.user.email) return event.deny();
    try { await transaction(portalPool(), db => reserveAdmission(db, emailHash(event.user.email!), event.user.id)); }
    catch { return event.deny(); }
  },
  async userSignup(event: UserSignupEvent) {
    if (invited(event.user)) return;
    if (!event.user.confirmedAt || event.user.userMetadata?.['adult'] !== true ||
        event.user.userMetadata?.['privacy_version'] !== PRIVACY_VERSION || !event.user.email) return event.deny();
    try {
      const repo = new PortalRepository(portalPool());
      await repo.consent({ ...event.user, roles: [] });
      // Browser metadata can never grant an administrative role.
      return { user: { ...event.user, appMetadata: { ...event.user.appMetadata, roles: ['student'] } } };
    } catch { return event.deny(); }
  },
  async userDeleted(event: UserDeletedEvent) {
    // Dashboard deletions also remove portal data, even if no deletion job existed.
    await transaction(portalPool(), async db => {
      await db.query('DELETE FROM portal_chats WHERE user_id=$1',[event.user.id]);
      await db.query('DELETE FROM portal_enrollments WHERE user_id=$1',[event.user.id]);
      await db.query('DELETE FROM portal_daily_usage WHERE user_id=$1',[event.user.id]);
      await db.query('DELETE FROM portal_admissions WHERE user_id=$1',[event.user.id]);
      await db.query("INSERT INTO portal_profiles(user_id,state) VALUES($1,'deleted') ON CONFLICT(user_id) DO UPDATE SET state='deleted',adult_attested_at=NULL,privacy_version=NULL",[event.user.id]);
      await db.query('UPDATE portal_deletion_jobs SET completed_at=now() WHERE user_id=$1',[event.user.id]);
    });
  },
};

import type { Student } from './portal-repository.mts';

interface IdentityReader {
  getUser: () => Promise<Student | null>;
  admin: { getUser: (id: string) => Promise<Student> };
}

// Netlify's verified JWT claims omit confirmedAt. The SDK can fall back to
// those claims when its /user lookup uses the Functions operator token.
// Read the full record for the already authenticated subject in that case;
// never infer email confirmation from the existence of a valid session.
export async function portalUser(identity?: IdentityReader): Promise<Student | null> {
  const reader = identity ?? await import('@netlify/identity');
  const user = await reader.getUser();
  if (!user || user.confirmedAt) return user;
  const fullUser = await reader.admin.getUser(user.id);
  if (fullUser.id !== user.id) throw new Error('identity_subject_mismatch');
  return fullUser;
}

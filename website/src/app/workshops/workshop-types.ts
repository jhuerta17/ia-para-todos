export const TOPICS = ['introduccion-ia', 'vida-diaria', 'trabajo-negocios', 'padres-familias'] as const;
export type Topic = typeof TOPICS[number];
export interface WorkshopSession {
  id: string; topic: Topic; titleEs: string; titleEn: string; language: 'es' | 'en';
  startsAt: string; endsAt: string; timeZone: string; venue: string; address: string;
  accessibilityEs: string; accessibilityEn: string; bringEs: string; bringEn: string;
  status: 'draft' | 'published' | 'cancelled'; capacity: number; available: number;
  totalReservations?: number;
}
export interface Reservation {
  id: string; reference: string; status: 'confirmed' | 'cancelled'; session: WorkshopSession;
  name?: string; contact?: string; contactType?: 'email' | 'phone'; followUpNeeded?: boolean;
  linked?: boolean;
}
export interface BookingInput {
  sessionId: string; token: string; name: string; contact: string;
  contactType: 'email' | 'phone'; adult: boolean; privacy: boolean; website?: string;
}

export const TUTOR_INPUT_LIMIT = 2000;
export const TUTOR_CONTEXT_LIMIT = 6;

/** Best-effort PII scrub before anything leaves for the model. Pure. */
export function scrubPII(value: string): string {
  return value
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[correo]')
    .replace(/(\+?\d[\d .-]{7,}\d)/g, '[teléfono]')
    .slice(0, TUTOR_INPUT_LIMIT);
}

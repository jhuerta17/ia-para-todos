// Expand this allowlist as protected portal pages are introduced.
const destinations = new Set(['/portal']);

export function portalReturn(value: unknown): string {
  return typeof value === 'string' && destinations.has(value) ? value : '/portal';
}

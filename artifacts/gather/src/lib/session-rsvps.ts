const SESSION_RSVPS_KEY = 'gather:session-rsvps';

let memoryFallback: string[] = [];

export function getSessionRsvpIds(): string[] {
  if (typeof window === 'undefined') return memoryFallback;

  try {
    const stored = window.sessionStorage.getItem(SESSION_RSVPS_KEY);
    if (!stored) return memoryFallback;

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return memoryFallback;

    const ids = Array.from(
      new Set(parsed.filter((value): value is string => typeof value === 'string')),
    );
    memoryFallback = ids;
    return ids;
  } catch {
    return memoryFallback;
  }
}

export function addSessionRsvp(workshopId: string): void {
  const currentIds = getSessionRsvpIds();
  if (currentIds.includes(workshopId)) return;

  memoryFallback = [...currentIds, workshopId];

  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(
      SESSION_RSVPS_KEY,
      JSON.stringify(memoryFallback),
    );
  } catch {
    // Keep the current-tab fallback if session storage is unavailable.
  }
}

const RSVP_KEY_PREFIX = 'gather:customer-rsvps:';
const memoryFallback = new Map<string, string[]>();

export function getCustomerRsvpIds(customerId: string): string[] {
  const fallback = memoryFallback.get(customerId) ?? [];
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(`${RSVP_KEY_PREFIX}${customerId}`);
    if (!stored) return fallback;

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return fallback;

    const ids = Array.from(
      new Set(parsed.filter((value): value is string => typeof value === 'string')),
    );
    memoryFallback.set(customerId, ids);
    return ids;
  } catch {
    return fallback;
  }
}

export function addCustomerRsvp(customerId: string, workshopId: string): void {
  const currentIds = getCustomerRsvpIds(customerId);
  if (currentIds.includes(workshopId)) return;

  const nextIds = [...currentIds, workshopId];
  memoryFallback.set(customerId, nextIds);

  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      `${RSVP_KEY_PREFIX}${customerId}`,
      JSON.stringify(nextIds),
    );
  } catch {
    // Keep this customer's RSVPs available for the current tab.
  }
}

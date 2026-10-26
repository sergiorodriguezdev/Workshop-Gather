import { migrateMyRsvps } from '@workspace/api-client-react';

const legacyRsvpKeyPrefix = 'gather:customer-rsvps:';

function readLegacyWorkshopIds(userId: string): string[] {
  try {
    const stored = window.localStorage.getItem(`${legacyRsvpKeyPrefix}${userId}`);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return Array.from(
      new Set(parsed.filter((value): value is string => typeof value === 'string' && value.length > 0)),
    ).slice(0, 100);
  } catch {
    return [];
  }
}

export async function migrateLegacyCustomerRsvps(userId: string) {
  const legacyWorkshopIds = readLegacyWorkshopIds(userId);
  const result = await migrateMyRsvps({ legacyWorkshopIds });
  const completedIds = new Set([
    ...result.migratedWorkshopIds,
    ...result.alreadyPresentWorkshopIds,
  ]);
  const remainingIds = legacyWorkshopIds.filter((id) => !completedIds.has(id));

  try {
    const key = `${legacyRsvpKeyPrefix}${userId}`;
    if (remainingIds.length > 0) {
      window.localStorage.setItem(key, JSON.stringify(remainingIds));
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // The database migration is complete even if browser storage is unavailable.
  }

  return result;
}

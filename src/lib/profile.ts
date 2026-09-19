/**
 * Local-only profile.
 *
 * The remerg.com registration survey collects justice status, age, ZIP, race
 * and gender before showing the map. Replicating that as a signup wall would be
 * the wrong call on mobile for two reasons: it blocks someone who needs a phone
 * number in the next thirty seconds, and it asks a justice-involved person to
 * hand over identifying details to an app on a phone that may not be theirs.
 *
 * So the survey becomes an optional personalization step, answers live in
 * on-device storage only, and nothing is transmitted. `toSurveyPayload()` maps
 * back onto the website's field names for the day Remerg wants real accounts —
 * at which point it should be an explicit, separate opt-in.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'remerg.profile.v1';

export type Profile = {
  /** Survey `sur_resources_needed[]` — the `val_N` ids from NEEDS. */
  needs: string[];
  /** Survey `sur_description`. */
  justiceStatus: string | null;
  /** Survey `sur_age`. */
  ageRange: string | null;
  /** Survey `sur_zip_code`. Used only to sort resources by distance. */
  zip: string | null;
  /** Hotline + resource ids the person pinned. */
  saved: string[];
  onboarded: boolean;
};

export const EMPTY_PROFILE: Profile = {
  needs: [],
  justiceStatus: null,
  ageRange: null,
  zip: null,
  saved: [],
  onboarded: false,
};

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY_PROFILE;
    return { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<Profile>) };
  } catch {
    return EMPTY_PROFILE;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // A failed write must never crash the app; the session just isn't persisted.
  }
}

/** Wipe everything. Surfaced prominently in Settings — see the privacy note above. */
export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Shape the local profile into remerg.com's survey field names. Not sent today. */
export function toSurveyPayload(p: Profile) {
  return {
    sur_description: p.justiceStatus ?? '',
    sur_age: p.ageRange ?? '',
    sur_zip_code: p.zip ?? '',
    'sur_resources_needed[]': p.needs,
  };
}

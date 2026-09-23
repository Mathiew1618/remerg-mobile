/**
 * Placing calls, opening maps, opening links.
 *
 * Dialing is the single most important action in this app, so it gets haptics
 * and a forgiving parser rather than a bare `Linking.openURL`.
 */

import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert, Linking, Platform } from 'react-native';

/**
 * Pull a dialable string out of a human-written number.
 *
 * Remerg lists entries like "988, then press 1" (Veterans Crisis Line). Only
 * the leading digits belong in the `tel:` URL; the "then press 1" is an
 * instruction for the human, and passing it to the dialer breaks the call.
 */
export function toDialable(raw: string): string {
  const leading = raw.match(/^[\d\-().+\s]+/)?.[0] ?? raw;
  const cleaned = leading.replace(/[^\d+]/g, '');
  return cleaned || raw.replace(/[^\d+]/g, '');
}

/** The "then press 1" half, if there is one. */
export function dialSuffixNote(raw: string): string | null {
  const rest = raw.replace(/^[\d\-().+\s]+/, '').trim();
  return rest ? rest.replace(/^,\s*/, '') : null;
}

export async function callNumber(raw: string, displayName?: string) {
  const dialable = toDialable(raw);
  const url = Platform.select({ ios: `telprompt:${dialable}`, default: `tel:${dialable}` })!;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics are cosmetic; never let them block a call.
  }
  try {
    const ok = await Linking.canOpenURL(url);
    if (!ok) throw new Error('unsupported');
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      displayName ? `Call ${displayName}` : 'Call',
      `This device can't place calls. The number is:\n\n${raw}`,
    );
  }
}

type PlaceTarget = {
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  website?: string | null;
};

/**
 * "Directions" on any card. A place with coordinates opens the in-app map
 * (app/place.tsx): the route, turn by turn, and a 3D view, without leaving the
 * app. Only a record with no coordinates falls back to the phone's maps app.
 */
export function openPlace(t: PlaceTarget) {
  if (typeof t.lat === 'number' && typeof t.lng === 'number') {
    router.push({
      pathname: '/place',
      params: {
        name: t.name,
        lat: String(t.lat),
        lng: String(t.lng),
        ...(t.address ? { address: t.address } : {}),
        ...(t.phone ? { phone: t.phone } : {}),
        ...(t.website ? { website: t.website } : {}),
      },
    });
    return;
  }
  void openDirections([t.name, t.address].filter(Boolean).join(', '));
}

/** Hand off to Apple/Google Maps: the fallback, and voice navigation. */
export async function openDirections(query: string, lat?: number | null, lng?: number | null) {
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';
  const url = hasCoords
    ? Platform.select({
        ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
        default: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(query)})`,
      })!
    : Platform.select({
        ios: `http://maps.apple.com/?q=${encodeURIComponent(query)}`,
        default: `geo:0,0?q=${encodeURIComponent(query)}`,
      })!;
  try {
    const ok = await Linking.canOpenURL(url);
    await Linking.openURL(
      ok ? url : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    );
  } catch {
    Alert.alert('Directions unavailable', query);
  }
}

export async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Couldn't open link", url);
  }
}

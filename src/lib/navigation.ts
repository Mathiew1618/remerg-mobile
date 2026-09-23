/**
 * In-app directions: where the person is, and the route from there.
 *
 * PRIVACY — this is the one place the app sends anything about the person off
 * the phone, so it only runs when they tap "Get directions", and the screen
 * says what is sent:
 *
 *   - Location comes from the phone's GPS, asked for at that moment. If they
 *     say no (or it fails), a rough city-level estimate comes from their IP
 *     address instead, and the screen says it is approximate.
 *   - The start and end points go to the OpenStreetMap routing service
 *     (routing.openstreetmap.de, run by FOSSGIS) to compute the route. Nothing
 *     is stored by this app.
 */

import * as Location from 'expo-location';

export type LatLng = { lat: number; lng: number };
export type Origin = LatLng & { source: 'gps' | 'ip'; accuracyM: number | null };
export type TravelMode = 'drive' | 'walk';
export type RouteStep = { text: string; distanceM: number };
export type Route = {
  mode: TravelMode;
  distanceM: number;
  durationS: number;
  /** [lng, lat] pairs, as GeoJSON has them. */
  coords: [number, number][];
  steps: RouteStep[];
};

const TIMEOUT_MS = 12000;

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** GPS first; the IP estimate only when GPS is refused or unavailable. */
export async function getOrigin(): Promise<Origin> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
      ]);
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyM: pos.coords.accuracy ?? null,
        source: 'gps',
      };
    }
  } catch {
    // Fall through to the IP estimate.
  }
  return ipOrigin();
}

async function ipOrigin(): Promise<Origin> {
  // Two free, keyless lookups, so one being down does not end the route.
  try {
    const j = await getJson<{ success: boolean; latitude: number; longitude: number }>('https://ipwho.is/');
    if (j.success && Number.isFinite(j.latitude)) {
      return { lat: j.latitude, lng: j.longitude, accuracyM: null, source: 'ip' };
    }
  } catch {}
  const j = await getJson<{ latitude: number; longitude: number }>('https://ipapi.co/json/');
  if (!Number.isFinite(j.latitude)) throw new Error('Could not estimate your location');
  return { lat: j.latitude, lng: j.longitude, accuracyM: null, source: 'ip' };
}

type OsrmStep = {
  distance: number;
  name: string;
  maneuver: { type: string; modifier?: string; exit?: number };
};
type OsrmResponse = {
  code: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
    legs: { steps: OsrmStep[] }[];
  }[];
};

const PROFILE: Record<TravelMode, string> = { drive: 'routed-car', walk: 'routed-foot' };

export async function getRoute(from: LatLng, to: LatLng, mode: TravelMode): Promise<Route> {
  const url =
    `https://routing.openstreetmap.de/${PROFILE[mode]}/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
  const j = await getJson<OsrmResponse>(url);
  const r = j.routes?.[0];
  if (j.code !== 'Ok' || !r) throw new Error('No route found between these points');
  return {
    mode,
    distanceM: r.distance,
    durationS: r.duration,
    coords: r.geometry.coordinates,
    steps: r.legs.flatMap((l) => l.steps).map((s) => ({ text: stepText(s), distanceM: s.distance })),
  };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** OSRM gives maneuvers, not sentences; this turns one into plain English. */
function stepText(s: OsrmStep): string {
  // Footpaths and car-park lanes often have no name; "onto the road" would be
  // wrong as well as vague, so an unnamed way just gets the movement.
  const onto = s.name ? ` onto ${s.name}` : '';
  const { type, modifier, exit } = s.maneuver;
  switch (type) {
    case 'depart':
      return s.name ? `Start on ${s.name}` : 'Start';
    case 'arrive':
      return 'Arrive at your destination';
    case 'roundabout':
    case 'rotary':
      return `At the roundabout, take ${exit ? `exit ${exit}` : 'the exit'}${onto}`;
    case 'continue':
    case 'new name':
      return `Continue${onto || ' straight'}`;
    default:
      if (!modifier || modifier === 'straight') return `Continue straight${onto}`;
      if (modifier === 'uturn') return `Make a U-turn${onto}`;
      return `${cap(modifier.startsWith('slight') || modifier.startsWith('sharp') ? `take a ${modifier}` : `turn ${modifier}`)}${onto}`;
  }
}

export function formatDistance(m: number): string {
  const mi = m / 1609.344;
  if (mi < 0.1) return `${Math.round(m * 3.28084 / 10) * 10} ft`;
  return `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`;
}

export function formatDuration(s: number): string {
  const min = Math.round(s / 60);
  if (min < 60) return `${Math.max(1, min)} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

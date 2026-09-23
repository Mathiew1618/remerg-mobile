import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';

import PlaceMap from '@/components/place-map';
import { ActionButton } from '@/components/ui/action-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Band } from '@/components/ui/band';
import { Screen } from '@/components/ui/screen';
import { callNumber, openDirections, openUrl } from '@/lib/dial';
import {
  formatDistance,
  formatDuration,
  getOrigin,
  getRoute,
  type Origin,
  type Route,
  type TravelMode,
} from '@/lib/navigation';

/**
 * A place, on an in-app map: where it is, how to get there from where you are,
 * and what it looks like in 3D — without handing off to another app.
 *
 * Reached from every card's "Directions" button when the record has
 * coordinates (see openPlace in lib/dial). The phone's own maps app stays one
 * tap away at the bottom for turn-by-turn voice navigation.
 */

const ION_TOKEN = process.env.EXPO_PUBLIC_CESIUM_ION_TOKEN ?? null;

/** Great-circle distance, for the IP-estimate sanity check. */
function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 +
    Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

const MODES: { id: TravelMode; label: string; icon: IconName }[] = [
  { id: 'drive', label: 'Drive', icon: 'mci:car' },
  { id: 'walk', label: 'Walk', icon: 'mci:walk' },
];

export default function PlaceScreen() {
  const p = useLocalSearchParams<{
    name: string; lat: string; lng: string; address?: string; phone?: string; website?: string;
  }>();
  const dest = { name: p.name ?? 'Destination', lat: Number(p.lat), lng: Number(p.lng) };
  const { height: winH } = useWindowDimensions();
  const mapH = Math.round(Math.min(460, Math.max(280, winH * 0.46)));

  const [mode, setMode] = useState<TravelMode>('drive');
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [note3D, setNote3D] = useState<string | null>(null);

  const directions = useCallback(async (m: TravelMode) => {
    setBusy(true); setError(null);
    try {
      const from = origin ?? (await getOrigin());
      // An IP estimate can be a whole VPN exit or carrier hub away. Tested from
      // Colorado it put the start in Maine and produced a 2,137-mile route. A
      // start that far off is not a route, so say so instead of drawing one.
      if (from.source === 'ip' && milesBetween(from, dest) > 100) {
        setError(
          "We can't tell where you are from your internet connection. Allow location access and tap Get directions again.",
        );
        return;
      }
      setOrigin(from);
      setRoute(await getRoute(from, dest, m));
    } catch (e: any) {
      setError(e?.message ?? 'Could not get directions');
    } finally {
      setBusy(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, p.lat, p.lng]);

  const pickMode = (m: TravelMode) => {
    setMode(m);
    if (route) void directions(m);   // already routing: re-route in the new mode
  };

  const onStatus = useCallback(async (s: string, detail?: string) => {
    if (s === '3d-unavailable') { setShow3D(false); setNote3D(detail ?? '3D is unavailable here'); }
    if (s === '3d-ready') setNote3D(null);
    if (s === 'error') setError(detail ?? 'The map could not load');
  }, []);

  if (!Number.isFinite(dest.lat) || !Number.isFinite(dest.lng)) {
    return (
      <Screen>
        <Text className="text-base text-muted">This place has no map location.</Text>
      </Screen>
    );
  }

  return (
    <Screen bands>
      <Band tone="green">
      <PlaceMap
        dest={dest}
        origin={origin}
        route={route?.coords ?? null}
        show3D={show3D}
        ionToken={ION_TOKEN}
        height={mapH}
        onStatus={onStatus}
        dom={{ style: { height: mapH, borderRadius: 18, overflow: 'hidden' } }}
      />

      <Text className="mt-4 text-[22px] font-extrabold leading-7 tracking-tight text-brand">{dest.name}</Text>
      {p.address ? <Text className="mt-1 text-[14px] font-semibold leading-5 text-brand/80">{p.address}</Text> : null}

      <View className="mt-3.5 flex-row flex-wrap gap-2">
        {p.phone ? (
          <ActionButton icon="mci:phone-in-talk" label="Call" primary onPress={() => callNumber(p.phone!, dest.name)} />
        ) : null}
        <ActionButton
          icon={show3D ? 'mci:map-outline' : 'mci:cube-outline'}
          label={show3D ? 'Map view' : '3D view'}
          onPress={() => { setNote3D(null); setShow3D((v) => !v); }}
        />
        {p.website ? <ActionButton icon="mci:web" label="Website" onPress={() => openUrl(p.website!)} /> : null}
      </View>
      {note3D ? <Text className="mt-2 text-xs font-semibold text-brand">3D view unavailable: {note3D}</Text> : null}
      </Band>

      <Band tone="blue">
      <View className="rounded-card bg-surface p-4">
        <View className="flex-row items-center gap-2">
          {MODES.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => pickMode(m.id)}
              accessibilityRole="button"
              accessibilityLabel={m.label}
              accessibilityState={{ selected: mode === m.id }}
              className={`min-h-chip flex-1 flex-row items-center justify-center gap-1.5 rounded-full ${
                mode === m.id ? 'bg-brand' : 'bg-elevated'
              }`}>
              <Icon name={m.icon} size={18} className={mode === m.id ? 'text-brand-on' : 'text-brand'} />
              <Text className={`text-sm font-bold ${mode === m.id ? 'text-brand-on' : 'text-ink'}`}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        {!route ? (
          <Pressable
            onPress={() => directions(mode)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Get directions"
            className="mt-3 min-h-touch flex-row items-center justify-center gap-2 rounded-field bg-brand active:opacity-80">
            {busy ? <ActivityIndicator color="white" /> : <Icon name="mci:navigation-variant" size={20} className="text-brand-on" />}
            <Text className="text-base font-bold text-brand-on">{busy ? 'Finding your route…' : 'Get directions'}</Text>
          </Pressable>
        ) : (
          <View className="mt-3">
            <Text className="text-2xl font-extrabold text-ink">
              {formatDuration(route.durationS)}{' '}
              <Text className="text-base font-semibold text-muted">· {formatDistance(route.distanceM)}</Text>
            </Text>
            <Text className="mt-1 text-xs leading-4 text-muted">
              {origin?.source === 'gps'
                ? 'From your current location.'
                : 'From an approximate location based on your internet connection — it can be miles off. Allow location for an exact route.'}
            </Text>
            {busy ? <ActivityIndicator className="mt-2" /> : null}
            <View className="mt-3">
              {route.steps.map((s, i) => (
                <View key={i} className="flex-row items-start gap-3 border-t border-line py-2.5">
                  <Text className="w-6 text-right text-[13px] font-bold text-muted">{i + 1}</Text>
                  <Text className="flex-1 text-[14px] leading-5 text-ink">{s.text}</Text>
                  {s.distanceM > 0 ? <Text className="text-[13px] text-muted">{formatDistance(s.distanceM)}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        )}
        {error ? <Text className="mt-2 text-sm text-crisis">{error}</Text> : null}
      </View>
      </Band>

      <Band tone="white">
        <Text className="text-[12px] leading-5 text-muted">
          Directions use your location only when you tap them. Your start point is sent to the
          OpenStreetMap routing service for this one route and is not stored by this app.
        </Text>

      <Pressable
        onPress={() => openDirections(`${dest.name}${p.address ? `, ${p.address}` : ''}`, dest.lat, dest.lng)}
        accessibilityRole="link"
        accessibilityLabel="Open in your phone's maps app"
        className="mt-4 flex-row items-center justify-center gap-1.5 py-2 active:opacity-60">
        <Icon name="mci:open-in-new" size={15} className="text-muted" />
        <Text className="text-[13px] text-muted">Open in your phone&apos;s maps app for voice navigation</Text>
      </Pressable>
      </Band>
    </Screen>
  );
}

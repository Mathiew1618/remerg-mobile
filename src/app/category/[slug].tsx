import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { HalfwayHouseCard } from '@/components/halfway-house-card';
import { ResourceCard } from '@/components/resource-card';
import { CommCorrFilters, ResourceFilters } from '@/components/resource-filters';
import { ActionButton } from '@/components/ui/action-button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import {
  COMMCORR_FETCHED_AT,
  PROGRAMS,
  applyCommCorrFilters,
  type CommCorrFilter,
} from '@/data/commcorr';
import {
  RESOURCES_FETCHED_AT,
  applyFilters,
  resourcesForCategory,
  type ResourceFilter,
} from '@/data/resources';
import { categoryBySlug } from '@/data/taxonomy';
import { useTheme } from '@/hooks/use-theme';
import { callNumber, openDirections, openUrl } from '@/lib/dial';
import { REMERG_ORIGIN, fetchResources, type Resource as LiveResource } from '@/lib/remerg';

export default function CategoryScreen() {
  const colors = useTheme();
  const navigation = useNavigation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const category = categoryBySlug(slug);

  const [live, setLive] = useState<LiveResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ResourceFilter[]>([]);
  const [ccFilters, setCcFilters] = useState<CommCorrFilter[]>([]);

  // Halfway houses come from DCJ and have their own shape, so they are matched
  // first. Bundled SAMHSA data covers some of the rest; the remainder still
  // depend on Remerg opening up their `resources` post type.
  const programs = useMemo(() => (slug === 'halfway-houses' ? PROGRAMS : []), [slug]);
  const shownPrograms = useMemo(
    () => applyCommCorrFilters(programs, ccFilters),
    [programs, ccFilters],
  );
  const bundled = useMemo(() => resourcesForCategory(slug ?? ''), [slug]);
  const shown = useMemo(() => applyFilters(bundled, filters), [bundled, filters]);

  useEffect(() => {
    navigation.setOptions({ title: category?.name ?? 'Category' });
  }, [navigation, category]);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    fetchResources(slug).then((res) => {
      if (!alive) return;
      setLive(res.data);
      setError(res.error);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (!category) {
    return (
      <Screen>
        <Text className="text-2xl font-extrabold text-ink">Not found</Text>
      </Screen>
    );
  }

  const toggle = (f: ResourceFilter) =>
    setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  const toggleCc = (f: CommCorrFilter) =>
    setCcFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <Screen>
      <View className="mb-3.5 flex-row items-center gap-3.5 rounded-card bg-elevated p-4">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
          <Icon name={category.icon} size={28} className="text-brand" />
        </View>
        <View className="flex-1">
          <Text className="text-[22px] font-extrabold tracking-tight text-ink">{category.name}</Text>
          <Text className="mt-0.5 text-[13px] leading-5 text-muted">{category.blurb}</Text>
        </View>
      </View>

      {programs.length > 0 ? (
        <>
          <CommCorrFilters active={ccFilters} onToggle={toggleCc} />
          <Text className="mb-2 text-xs font-bold text-muted">
            {shownPrograms.length} of {programs.length}{' '}
            {programs.length === 1 ? 'program' : 'programs'} statewide
          </Text>
          {shownPrograms.map((p) => (
            <HalfwayHouseCard key={p.id} program={p} />
          ))}
          {shownPrograms.length === 0 ? (
            <Text className="py-6 text-center text-sm text-muted">
              No program matches every filter. Try removing one.
            </Text>
          ) : null}
          <Text className="mt-1 text-[11px] italic leading-4 text-muted">
            Source: Colorado DCJ, Office of Community Corrections · pulled {COMMCORR_FETCHED_AT}.
            Beds are assigned by your community corrections board — this list is who exists, not
            who has space.
          </Text>
        </>
      ) : bundled.length > 0 ? (
        <>
          <ResourceFilters active={filters} onToggle={toggle} />
          <Text className="mb-2 text-xs font-bold text-muted">
            {shown.length} {shown.length === 1 ? 'place' : 'places'} in Colorado
          </Text>
          {shown.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
          <Text className="mt-1 text-[11px] italic leading-4 text-muted">
            Source: SAMHSA findtreatment.gov · pulled {RESOURCES_FETCHED_AT}. Call ahead to confirm
            hours and intake.
          </Text>
        </>
      ) : loading ? (
        <View className="items-center gap-2 py-10">
          <ActivityIndicator color={colors.tint} />
          <Text className="text-sm text-muted">Checking remerg.com…</Text>
        </View>
      ) : live.length > 0 ? (
        live.map((r) => (
          <View key={r.id} className="mb-3 rounded-card border border-line bg-surface p-3.5">
            <Text className="text-[17px] font-bold text-ink">{r.name}</Text>
            {r.address ? <Text className="mt-0.5 text-[13px] text-muted">{r.address}</Text> : null}
            <View className="mt-3.5 flex-row flex-wrap gap-2">
              {r.phone ? (
                <ActionButton
                  icon="mci:phone-in-talk"
                  label="Call"
                  primary
                  onPress={() => callNumber(r.phone!, r.name)}
                />
              ) : null}
              {r.address ? (
                <ActionButton
                  icon="mci:navigation-variant"
                  label="Directions"
                  onPress={() => openDirections(r.address!, r.lat, r.lng)}
                />
              ) : null}
              {r.website ? (
                <ActionButton icon="mci:web" label="Website" onPress={() => openUrl(r.website!)} />
              ) : null}
            </View>
          </View>
        ))
      ) : (
        <View className="items-center gap-2.5 rounded-card border border-line bg-elevated p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
            <Icon name="mci:lock-outline" size={28} className="text-brand" />
          </View>
          <Text className="text-center text-[17px] font-bold text-ink">No public listings yet</Text>
          <Text className="text-center text-sm leading-5 text-muted">
            There is no open dataset for {category.name.toLowerCase()} in Colorado, and Remerg keeps
            theirs behind a login. Two things that work right now:
          </Text>
          <Pressable
            onPress={() => callNumber('211', 'Colorado 211')}
            accessibilityRole="button"
            className="mt-1 min-h-touch w-full flex-row items-center justify-center gap-2 rounded-full bg-brand active:opacity-85">
            <Icon name="mci:phone-in-talk" size={18} className="text-brand-on" />
            <Text className="text-[15px] font-extrabold text-brand-on">
              Call 211 for a live search
            </Text>
          </Pressable>
          <Pressable
            onPress={() => openUrl(`${REMERG_ORIGIN}/resource-map/`)}
            accessibilityRole="button"
            className="min-h-touch w-full flex-row items-center justify-center gap-2 rounded-full border border-line active:opacity-70">
            <Icon name="mci:open-in-new" size={16} className="text-ink" />
            <Text className="text-sm font-bold text-ink">Open the map on remerg.com</Text>
          </Pressable>
          {error ? <Text className="mt-1 text-[11px] text-muted">{error}</Text> : null}
        </View>
      )}
    </Screen>
  );
}

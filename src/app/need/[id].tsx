import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HalfwayHouseCard } from '@/components/halfway-house-card';
import { HotlineCard } from '@/components/hotline-card';
import { ResourceCard } from '@/components/resource-card';
import { CommCorrFilters, ResourceFilters } from '@/components/resource-filters';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import {
  COMMCORR_FETCHED_AT,
  PROGRAMS,
  applyCommCorrFilters,
  searchPrograms,
  type CommCorrFilter,
} from '@/data/commcorr';
import { HOTLINES, type HotlineCategory } from '@/data/hotlines';
import {
  RESOURCES_FETCHED_AT,
  applyFilters,
  resourcesForNeed,
  searchResources,
  type ResourceFilter,
} from '@/data/resources';
import { categoryBySlug, needById } from '@/data/taxonomy';
import { callNumber } from '@/lib/dial';

/** Which hotline categories are worth surfacing for a given need. */
const HOTLINES_FOR_NEED: Record<string, HotlineCategory[]> = {
  val_2: ['basic-needs'],
  val_4: ['crisis'],
  val_5: ['recovery'],
  val_8: ['health'],
  val_9: ['basic-needs'],
  val_13: ['safety', 'crisis'],
  val_14: ['recovery', 'crisis'],
};

const PAGE = 15;

export default function NeedScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const need = needById(id);

  const [filters, setFilters] = useState<ResourceFilter[]>([]);
  const [ccFilters, setCcFilters] = useState<CommCorrFilter[]>([]);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    navigation.setOptions({ title: need?.short ?? 'Resource' });
  }, [navigation, need]);

  const relatedHotlines = useMemo(() => {
    const cats = HOTLINES_FOR_NEED[id ?? ''] ?? [];
    return cats.length ? HOTLINES.filter((h) => cats.includes(h.category)).slice(0, 3) : [];
  }, [id]);

  // Housing is the one need answered by the halfway-house list rather than by
  // treatment facilities, and it is the need people open the app for first.
  const programs = useMemo(() => (id === 'val_0' ? PROGRAMS : []), [id]);
  const programMatches = useMemo(
    () => searchPrograms(applyCommCorrFilters(programs, ccFilters), query),
    [programs, ccFilters, query],
  );

  const allForNeed = useMemo(() => resourcesForNeed(id ?? ''), [id]);
  const matches = useMemo(
    () => searchResources(applyFilters(allForNeed, filters), query),
    [allForNeed, filters, query],
  );

  if (!need) {
    return (
      <Screen>
        <Text className="text-2xl font-extrabold text-ink">Not found</Text>
      </Screen>
    );
  }

  const cats = need.related.map(categoryBySlug).filter((c) => c !== undefined);
  const toggle = (f: ResourceFilter) =>
    setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  const toggleCc = (f: CommCorrFilter) =>
    setCcFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <Screen>
      <View className="mb-6 flex-row items-center gap-3.5">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-brand-soft">
          <Icon name={need.icon} size={32} className="text-brand" />
        </View>
        <Text className="flex-1 text-[26px] font-extrabold tracking-tight text-ink">
          {need.label}
        </Text>
      </View>

      {relatedHotlines.length > 0 ? (
        <>
          <Text className="mb-2.5 text-lg font-extrabold text-ink">Call someone now</Text>
          {relatedHotlines.map((h) => (
            <HotlineCard key={h.id} hotline={h} />
          ))}
        </>
      ) : null}

      {programs.length > 0 ? (
        <>
          <Text className="mb-2.5 mt-6 text-lg font-extrabold text-ink">
            Halfway houses &amp; community corrections ({programs.length})
          </Text>

          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, city or ZIP"
            accessibilityLabel="Search programs"
          />

          <CommCorrFilters active={ccFilters} onToggle={toggleCc} />

          <Text className="mb-2 text-xs font-semibold text-muted">
            {programMatches.length === 0
              ? 'No program matches those filters.'
              : `Showing ${programMatches.length} of ${programs.length}`}
          </Text>

          {programMatches.map((prog) => (
            <HalfwayHouseCard key={prog.id} program={prog} />
          ))}

          <Text className="mt-1 text-[11px] italic leading-4 text-muted">
            Source: Colorado DCJ, Office of Community Corrections · pulled {COMMCORR_FETCHED_AT}.
            A bed is assigned by your community corrections board — this is who exists, not who has
            space tonight.
          </Text>
        </>
      ) : null}

      {allForNeed.length > 0 ? (
        <>
          <Text className="mb-2.5 mt-6 text-lg font-extrabold text-ink">
            Places in Colorado ({allForNeed.length})
          </Text>

          <SearchField
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setLimit(PAGE);
            }}
            placeholder="Search by name, city or ZIP"
            accessibilityLabel="Search places"
          />

          <ResourceFilters
            active={filters}
            onToggle={(f) => {
              toggle(f);
              setLimit(PAGE);
            }}
          />

          <Text className="mb-2 text-xs font-semibold text-muted">
            {matches.length === 0
              ? 'No places match those filters.'
              : `Showing ${Math.min(limit, matches.length)} of ${matches.length}`}
          </Text>

          {matches.slice(0, limit).map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}

          {limit < matches.length ? (
            <Pressable
              onPress={() => setLimit((l) => l + PAGE)}
              accessibilityRole="button"
              className="mb-3 min-h-touch items-center justify-center rounded-full border border-line active:opacity-70">
              <Text className="text-sm font-bold text-brand">
                Show {Math.min(PAGE, matches.length - limit)} more
              </Text>
            </Pressable>
          ) : null}

          <Text className="mt-1 text-[11px] italic leading-4 text-muted">
            Source: SAMHSA findtreatment.gov · pulled {RESOURCES_FETCHED_AT}. Always call ahead —
            hours, intake rules and bed availability change.
          </Text>
        </>
      ) : null}

      {cats.length > 0 ? (
        <>
          <Text className="mb-2.5 mt-6 text-lg font-extrabold text-ink">On the Remerg map</Text>
          {cats.map((cat) => (
            <Pressable
              key={cat.slug}
              onPress={() => router.push(`/category/${cat.slug}`)}
              accessibilityRole="button"
              className="mt-2.5 flex-row items-center gap-3.5 rounded-card border border-line bg-surface p-3.5 active:opacity-75">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft">
                <Icon name={cat.icon} size={22} className="text-brand" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-ink">{cat.name}</Text>
                <Text className="mt-0.5 text-[13px] leading-5 text-muted">{cat.blurb}</Text>
              </View>
              <Icon name="ion:chevron-forward" size={18} className="text-muted" />
            </Pressable>
          ))}
        </>
      ) : null}

      <Pressable
        onPress={() => callNumber('211', 'Colorado 211')}
        accessibilityRole="button"
        className="mt-6 min-h-touch flex-row items-center gap-2.5 rounded-field border border-line bg-elevated p-3.5 active:opacity-80">
        <Icon name="mci:phone-in-talk" size={18} className="text-brand" />
        <Text className="flex-1 text-[13px] leading-5 text-muted">
          Can&apos;t find it here? Tap to call{' '}
          <Text className="font-extrabold text-ink">211</Text> and a person will search
          Colorado&apos;s full database with you.
        </Text>
      </Pressable>
    </Screen>
  );
}

import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HalfwayHouseCard } from '@/components/halfway-house-card';
import { HotlineCard } from '@/components/hotline-card';
import { MemberCard } from '@/components/member-card';
import { ResourceCard } from '@/components/resource-card';
import { CommCorrFilters, ResourceFilters } from '@/components/resource-filters';
import { Icon } from '@/components/ui/icon';
import { Band, BandHeading } from '@/components/ui/band';
import { Screen } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import {
  COMMCORR_FETCHED_AT,
  PROGRAMS,
  applyCommCorrFilters,
  searchPrograms,
  type CommCorrFilter,
} from '@/data/commcorr';
import { HOTLINES } from '@/data/hotlines';
import {
  RESOURCES_FETCHED_AT,
  applyFilters,
  resourcesForNeed,
  searchResources,
  type ResourceFilter,
} from '@/data/resources';
import { categoryBySlug } from '@/data/taxonomy';
import { HAS_MEMBER_LISTINGS, MEMBERS_FETCHED_AT, membersFor } from '@/data/members';
import { topicBySlug } from '@/data/topics';
import { callNumber, openUrl } from '@/lib/dial';

/**
 * One of Remerg's twenty topics (data/topics.ts): its subtopics as the website
 * lists them, then whatever this app can actually show for it — crisis lines,
 * treatment facilities, halfway houses, related map categories — and a way
 * through to the full list on remerg.com.
 */

const PAGE = 15;

export default function TopicScreen() {
  const navigation = useNavigation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const topic = topicBySlug(slug ?? '');
  const c = topic?.content ?? {};

  const [filters, setFilters] = useState<ResourceFilter[]>([]);
  const [ccFilters, setCcFilters] = useState<CommCorrFilter[]>([]);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [sub, setSub] = useState<string | null>(null);
  const [orgLimit, setOrgLimit] = useState(PAGE);
  const orgs = useMemo(() => (topic ? membersFor(topic, sub) : []), [topic, sub]);

  useEffect(() => {
    navigation.setOptions({ title: topic?.name ?? 'Resource' });
  }, [navigation, topic]);

  const relatedHotlines = useMemo(() => {
    const cats = c.hotlines ?? [];
    return cats.length ? HOTLINES.filter((h) => cats.includes(h.category)).slice(0, 3) : [];
  }, [c.hotlines]);

  const programs = useMemo(() => (c.halfwayHouses ? PROGRAMS : []), [c.halfwayHouses]);
  const programMatches = useMemo(
    () => searchPrograms(applyCommCorrFilters(programs, ccFilters), query),
    [programs, ccFilters, query],
  );

  const allForNeed = useMemo(() => (c.treatment ? resourcesForNeed(c.treatment) : []), [c.treatment]);
  const matches = useMemo(
    () => searchResources(applyFilters(allForNeed, filters), query),
    [allForNeed, filters, query],
  );

  if (!topic) {
    return (
      <Screen>
        <Text className="text-2xl font-extrabold text-ink">Not found</Text>
      </Screen>
    );
  }

  const cats = (c.mapCategories ?? []).map(categoryBySlug).filter((x) => x !== undefined);
  const toggle = (f: ResourceFilter) =>
    setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  const toggleCc = (f: CommCorrFilter) =>
    setCcFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  const hasContent = orgs.length > 0 || relatedHotlines.length > 0 || programs.length > 0 || allForNeed.length > 0;

  return (
    <Screen bands>
      <Band tone="green">
      <View className="mb-4 flex-row items-center gap-3.5">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
          <Icon name={topic.icon} size={32} className="text-brand" />
        </View>
        <Text className="flex-1 text-[24px] font-extrabold uppercase leading-7 tracking-wide text-brand">
          {topic.name}
        </Text>
      </View>

      {topic.subtopics.length > 0 ? (
        <View className="mb-5 flex-row flex-wrap gap-1.5">
          {topic.subtopics.map((st) => {
            // With listings on this device the chips filter them; without,
            // they are simply Remerg's subtopic list.
            const on = sub === st.slug;
            return (
              <Pressable
                key={st.slug}
                disabled={!HAS_MEMBER_LISTINGS}
                onPress={() => { setSub(on ? null : st.slug); setOrgLimit(PAGE); }}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={st.name}
                className={`rounded-full px-3 py-1.5 active:opacity-75 ${on ? 'bg-brand' : 'bg-surface'}`}>
                <Text className={`text-[13px] font-semibold ${on ? 'text-white' : 'text-brand'}`}>{st.name}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Pressable
        onPress={() => openUrl(topic.url)}
        accessibilityRole="link"
        accessibilityLabel={`See every ${topic.name} organization on remerg.com`}
        className="flex-row items-center gap-3 rounded-card bg-brand p-4 active:opacity-85">
        <Icon name="mci:open-in-new" size={20} className="text-accent" />
        <View className="flex-1">
          <Text className="text-[15px] font-extrabold text-white">Every {topic.name} organization</Text>
          <Text className="mt-0.5 text-xs leading-4 text-white/75">
            On remerg.com. The full list needs a free Remerg account.
          </Text>
        </View>
        <Icon name="ion:chevron-forward" size={18} className="text-accent" />
      </Pressable>
      </Band>

      <Band tone="blue">
      {!hasContent ? (
        <View className="rounded-card bg-surface p-4">
          <Text className="text-base font-extrabold text-brand">Listed on remerg.com</Text>
          <Text className="mt-1 text-[14px] leading-5 text-muted">
            The app does not carry {topic.name} organizations yet. Open the list above, or call 211
            and a person will find one near you.
          </Text>
          <Pressable
            onPress={() => callNumber('211', 'Colorado 211')}
            accessibilityRole="button"
            className="mt-3 min-h-chip flex-row items-center justify-center gap-2 rounded-full bg-accent active:opacity-85">
            <Icon name="mci:phone-in-talk" size={18} className="text-brand" />
            <Text className="text-sm font-extrabold text-brand">Call 211</Text>
          </Pressable>
        </View>
      ) : null}

      {orgs.length > 0 ? (
        <>
          <BandHeading tone="blue">
            {sub ? topic.subtopics.find((x) => x.slug === sub)?.name : 'Organizations'} ({orgs.length})
          </BandHeading>
          {orgs.slice(0, orgLimit).map((o) => (
            <MemberCard key={o.slug} org={o} />
          ))}
          {orgLimit < orgs.length ? (
            <Pressable
              onPress={() => setOrgLimit((l) => l + PAGE)}
              accessibilityRole="button"
              className="mb-3 min-h-touch items-center justify-center rounded-full bg-accent active:opacity-85">
              <Text className="text-sm font-bold text-brand">Show {Math.min(PAGE, orgs.length - orgLimit)} more</Text>
            </Pressable>
          ) : null}
          <Text className="mb-6 mt-1 text-[11px] italic leading-4 text-white/70">
            From Remerg&apos;s member listings · pulled {MEMBERS_FETCHED_AT} with your own account, on this
            device only.
          </Text>
        </>
      ) : null}

      {relatedHotlines.length > 0 ? (
        <>
          <BandHeading tone="blue">Call someone now</BandHeading>
          {relatedHotlines.map((h) => (
            <HotlineCard key={h.id} hotline={h} />
          ))}
        </>
      ) : null}

      {programs.length > 0 ? (
        <>
          <BandHeading tone="blue" className="mt-6">
            Halfway houses &amp; community corrections ({programs.length})
          </BandHeading>

          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, city or ZIP"
            accessibilityLabel="Search programs"
          />

          <CommCorrFilters active={ccFilters} onToggle={toggleCc} />

          <Text className="mb-2 mt-2 text-xs font-semibold text-white/75">
            {programMatches.length === 0
              ? 'No program matches those filters.'
              : `Showing ${programMatches.length} of ${programs.length}`}
          </Text>

          {programMatches.map((prog) => (
            <HalfwayHouseCard key={prog.id} program={prog} />
          ))}

          <Text className="mt-1 text-[11px] italic leading-4 text-white/70">
            Source: Colorado DCJ, Office of Community Corrections · pulled {COMMCORR_FETCHED_AT}.
            A bed is assigned by your community corrections board — this is who exists, not who has
            space tonight.
          </Text>
        </>
      ) : null}

      {allForNeed.length > 0 ? (
        <>
          <BandHeading tone="blue" className="mt-6">
            Places in Colorado ({allForNeed.length})
          </BandHeading>

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

          <Text className="mb-2 mt-2 text-xs font-semibold text-white/75">
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
              className="mb-3 min-h-touch items-center justify-center rounded-full bg-accent active:opacity-85">
              <Text className="text-sm font-bold text-brand">
                Show {Math.min(PAGE, matches.length - limit)} more
              </Text>
            </Pressable>
          ) : null}

          <Text className="mt-1 text-[11px] italic leading-4 text-white/70">
            Source: SAMHSA findtreatment.gov · pulled {RESOURCES_FETCHED_AT}. Always call ahead —
            hours, intake rules and bed availability change.
          </Text>
        </>
      ) : null}

      </Band>

      <Band tone="white">
      {cats.length > 0 ? (
        <>
          <BandHeading tone="white">On the Remerg map</BandHeading>
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
        className="mt-4 min-h-touch flex-row items-center gap-2.5 rounded-field border border-line bg-elevated p-3.5 active:opacity-80">
        <Icon name="mci:phone-in-talk" size={18} className="text-brand" />
        <Text className="flex-1 text-[13px] leading-5 text-muted">
          Can&apos;t find it here? Tap to call{' '}
          <Text className="font-extrabold text-ink">211</Text> and a person will search
          Colorado&apos;s full database with you.
        </Text>
      </Pressable>
      </Band>
    </Screen>
  );
}

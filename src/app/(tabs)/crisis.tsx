import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { FilterChips, type FilterOption } from '@/components/filter-chips';
import { HotlineCard } from '@/components/hotline-card';
import { Screen } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { HOTLINES, type HotlineCategory } from '@/data/hotlines';

type Filter = HotlineCategory | 'all';

const FILTERS: FilterOption<Filter>[] = [
  { key: 'all', label: 'All' },
  { key: 'crisis', label: 'Crisis' },
  { key: 'recovery', label: 'Recovery' },
  { key: 'safety', label: 'Safety' },
  { key: 'health', label: 'Health' },
  { key: 'basic-needs', label: 'Food & 211' },
];

export default function CrisisScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HOTLINES.filter((h) => {
      // 'emergency' (911) is never filtered out — it belongs in every view.
      const matchesFilter = filter === 'all' || h.category === filter || h.category === 'emergency';
      if (!matchesFilter) return false;
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        h.numbers.some((n) => n.number.includes(q) || (n.label ?? '').toLowerCase().includes(q))
      );
    });
  }, [filter, query]);

  return (
    <Screen>
      <Text className="text-[28px] font-extrabold tracking-tight text-ink">Crisis lines</Text>
      <Text className="mb-3.5 mt-1 text-sm leading-5 text-muted">
        Saved on your phone. These work with no signal and no data.
      </Text>

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search lines or numbers"
        accessibilityLabel="Search crisis lines"
      />

      {/* Single-select, so tapping a chip replaces the filter rather than adding. */}
      <FilterChips
        options={FILTERS}
        active={[filter]}
        onToggle={(key) => setFilter((cur) => (cur === key ? 'all' : key))}
      />

      {results.length === 0 ? (
        <Text className="mt-8 text-center text-[15px] text-muted">
          No lines match “{query}”.
        </Text>
      ) : (
        results.map((h) => <HotlineCard key={h.id} hotline={h} />)
      )}

      <Text className="mt-3.5 text-xs italic leading-5 text-muted">
        Verified against remerg.com on 18 Sep 2026. If a number has changed, call 211 for the
        current listing.
      </Text>
    </Screen>
  );
}

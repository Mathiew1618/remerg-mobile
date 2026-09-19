import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { HotlineCard } from '@/components/hotline-card';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { HOTLINES, type HotlineCategory } from '@/data/hotlines';
import { useTheme } from '@/hooks/use-theme';

const FILTERS: { key: HotlineCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'crisis', label: 'Crisis' },
  { key: 'recovery', label: 'Recovery' },
  { key: 'safety', label: 'Safety' },
  { key: 'health', label: 'Health' },
  { key: 'basic-needs', label: 'Food & 211' },
];

export default function CrisisScreen() {
  const colors = useTheme();
  const [filter, setFilter] = useState<HotlineCategory | 'all'>('all');
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
      <Text style={[styles.h1, { color: colors.text }]}>Crisis lines</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Saved on your phone. These work with no signal and no data.
      </Text>

      <View style={[styles.search, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search lines or numbers"
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search crisis lines"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroll}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.tint : colors.backgroundElement,
                  borderColor: active ? colors.tint : colors.border,
                },
              ]}>
              <Text style={[styles.chipText, { color: active ? colors.onTint : colors.text }]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {results.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          No lines match “{query}”.
        </Text>
      ) : (
        results.map((h) => <HotlineCard key={h.id} hotline={h} />)
      )}

      <Text style={[styles.footnote, { color: colors.textSecondary }]}>
        Verified against remerg.com on 18 Sep 2026. If a number has changed, call 211 for the
        current listing.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sub: { fontSize: 14, lineHeight: 20, marginTop: Spacing.one, marginBottom: Spacing.three },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 46,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontSize: 16 },
  chipScroll: { marginVertical: Spacing.three },
  chips: { gap: Spacing.two, paddingRight: Spacing.three },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontSize: 14, fontWeight: '700' },
  empty: { fontSize: 15, textAlign: 'center', marginTop: Spacing.five },
  footnote: { fontSize: 12, lineHeight: 18, marginTop: Spacing.three, fontStyle: 'italic' },
});

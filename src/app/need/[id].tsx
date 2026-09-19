import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HotlineCard } from '@/components/hotline-card';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { HOTLINES, type HotlineCategory } from '@/data/hotlines';
import { categoryBySlug, needById } from '@/data/taxonomy';
import { useTheme } from '@/hooks/use-theme';

/** Which hotline categories are worth surfacing for a given need. */
const HOTLINES_FOR_NEED: Record<string, HotlineCategory[]> = {
  val_2: ['basic-needs'],           // Food
  val_4: ['crisis'],                // Mental health
  val_5: ['recovery'],              // Substance use
  val_8: ['health'],                // Health care
  val_9: ['basic-needs'],           // Benefits
  val_13: ['safety', 'crisis'],     // Relationship / family
  val_14: ['recovery', 'crisis'],   // Peer support
};

export default function NeedScreen() {
  const colors = useTheme();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const need = needById(id);

  useEffect(() => {
    navigation.setOptions({ title: need?.short ?? 'Resource' });
  }, [navigation, need]);

  const relatedHotlines = useMemo(() => {
    const cats = HOTLINES_FOR_NEED[id ?? ''] ?? [];
    if (cats.length === 0) return [];
    return HOTLINES.filter((h) => cats.includes(h.category)).slice(0, 4);
  }, [id]);

  if (!need) {
    return (
      <Screen>
        <Text style={[styles.h1, { color: colors.text }]}>Not found</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          That resource type doesn&apos;t exist.
        </Text>
      </Screen>
    );
  }

  const cats = need.related.map(categoryBySlug).filter((c) => c !== undefined);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name={need.icon} size={30} color={colors.tint} />
        </View>
        <Text style={[styles.h1, { color: colors.text }]}>{need.label}</Text>
      </View>

      {relatedHotlines.length > 0 ? (
        <>
          <Text style={[styles.h2, { color: colors.text }]}>Call someone now</Text>
          {relatedHotlines.map((h) => (
            <HotlineCard key={h.id} hotline={h} />
          ))}
        </>
      ) : null}

      {cats.length > 0 ? (
        <>
          <Text style={[styles.h2, { color: colors.text }]}>Places to go</Text>
          {cats.map((cat) => (
            <Pressable
              key={cat.slug}
              onPress={() => router.push(`/category/${cat.slug}`)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                { borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
              ]}>
              <Ionicons name={cat.icon} size={22} color={colors.tint} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{cat.name}</Text>
                <Text style={[styles.rowBlurb, { color: colors.textSecondary }]}>{cat.blurb}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </>
      ) : null}

      <View style={[styles.note, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
        <Text style={[styles.noteText, { color: colors.textSecondary }]}>
          Dial <Text style={{ fontWeight: '800' }}>211</Text> any time for a live person who can
          search Colorado&apos;s full resource database with you.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.three, marginBottom: Spacing.four },
  heroIcon: { width: 60, height: 60, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: '800', marginTop: Spacing.three, marginBottom: Spacing.two },
  body: { fontSize: 15, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
  },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowBlurb: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  note: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  noteText: { flex: 1, fontSize: 13, lineHeight: 19 },
});

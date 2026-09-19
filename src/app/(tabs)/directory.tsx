import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { CrisisBar } from '@/components/crisis-bar';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { MAP_CATEGORIES, type MapCategory } from '@/data/taxonomy';
import { useTheme } from '@/hooks/use-theme';
import { fetchMapCategories } from '@/lib/remerg';

export default function DirectoryScreen() {
  const colors = useTheme();
  const [categories, setCategories] = useState<MapCategory[]>(MAP_CATEGORIES);
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetchMapCategories().then((res) => {
      if (!alive) return;
      setCategories(res.data);
      setLive(res.live);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Screen>
      <Text style={[styles.h1, { color: colors.text }]}>Find a place</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        The six categories on Remerg&apos;s resource map.
      </Text>

      <CrisisBar />

      <View style={styles.status}>
        {live === null ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <Ionicons
            name={live ? 'cloud-done-outline' : 'cloud-offline-outline'}
            size={15}
            color={colors.textSecondary}
          />
        )}
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {live === null
            ? 'Checking remerg.com…'
            : live
              ? 'Categories synced with remerg.com'
              : 'Offline — showing the built-in list'}
        </Text>
      </View>

      {categories.map((cat) => (
        <Pressable
          key={cat.slug}
          onPress={() => router.push(`/category/${cat.slug}`)}
          accessibilityRole="button"
          accessibilityLabel={cat.name}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
          ]}>
          <View style={[styles.icon, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name={cat.icon} size={22} color={colors.tint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{cat.name}</Text>
            <Text style={[styles.rowBlurb, { color: colors.textSecondary }]}>{cat.blurb}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sub: { fontSize: 14, lineHeight: 20, marginTop: Spacing.one, marginBottom: Spacing.three },
  status: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.three, marginBottom: Spacing.two, minHeight: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
  },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowBlurb: { fontSize: 13, lineHeight: 18, marginTop: 2 },
});

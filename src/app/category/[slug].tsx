import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { categoryBySlug } from '@/data/taxonomy';
import { useTheme } from '@/hooks/use-theme';
import { callNumber, openDirections, openUrl } from '@/lib/dial';
import { REMERG_ORIGIN, fetchResources, type Resource } from '@/lib/remerg';

export default function CategoryScreen() {
  const colors = useTheme();
  const navigation = useNavigation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const category = categoryBySlug(slug);

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: category?.name ?? 'Category' });
  }, [navigation, category]);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    fetchResources(slug).then((res) => {
      if (!alive) return;
      setResources(res.data);
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
        <Text style={[styles.h1, { color: colors.text }]}>Not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: colors.backgroundElement }]}>
        <Ionicons name={category.icon} size={28} color={colors.tint} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.h1, { color: colors.text }]}>{category.name}</Text>
          <Text style={[styles.blurb, { color: colors.textSecondary }]}>{category.blurb}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>
            Checking remerg.com…
          </Text>
        </View>
      ) : resources.length > 0 ? (
        resources.map((r) => (
          <View key={r.id} style={[styles.card, { borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{r.name}</Text>
            {r.address ? (
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{r.address}</Text>
            ) : null}
            {r.description ? (
              <Text style={[styles.cardBody, { color: colors.textSecondary }]} numberOfLines={4}>
                {r.description}
              </Text>
            ) : null}
            <View style={styles.actions}>
              {r.phone ? (
                <Action icon="call" label="Call" onPress={() => callNumber(r.phone!, r.name)} />
              ) : null}
              {r.address ? (
                <Action
                  icon="navigate"
                  label="Directions"
                  onPress={() => openDirections(r.address!, r.lat, r.lng)}
                />
              ) : null}
              {r.website ? (
                <Action icon="globe-outline" label="Website" onPress={() => openUrl(r.website!)} />
              ) : null}
            </View>
          </View>
        ))
      ) : (
        /*
         * Honest empty state.
         *
         * remerg.com registers the `resources` post type with the REST API but
         * does not expose its records anonymously (X-WP-Total: 0), so there is
         * genuinely nothing to list yet. Showing a permanent spinner or faking
         * placeholder orgs would be worse than saying so and handing over a
         * route that actually works right now.
         */
        <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="lock-closed-outline" size={26} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Listings aren&apos;t public yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Remerg keeps the {category.name.toLowerCase()} records behind a login on their website,
            so this app can&apos;t pull them in yet. Two things that work right now:
          </Text>

          <Pressable
            onPress={() => callNumber('211', 'Colorado 211')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.primaryCta, { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 }]}>
            <Ionicons name="call" size={18} color={colors.onTint} />
            <Text style={[styles.primaryCtaText, { color: colors.onTint }]}>
              Call 211 for a live search
            </Text>
          </Pressable>

          <Pressable
            onPress={() => openUrl(`${REMERG_ORIGIN}/resource-map/`)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.secondaryCta, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="open-outline" size={16} color={colors.text} />
            <Text style={[styles.secondaryCtaText, { color: colors.text }]}>
              Open the map on remerg.com
            </Text>
          </Pressable>

          {error ? (
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}>
      <Ionicons name={icon} size={16} color={colors.tint} />
      <Text style={[styles.actionText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    marginBottom: Spacing.four,
  },
  h1: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  blurb: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  center: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five },
  centerText: { fontSize: 14 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.three, marginBottom: Spacing.three },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardMeta: { fontSize: 13, marginTop: 2 },
  cardBody: { fontSize: 14, lineHeight: 20, marginTop: Spacing.two },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.three },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    minHeight: 40,
  },
  actionText: { fontSize: 14, fontWeight: '700' },
  emptyBox: { alignItems: 'center', gap: Spacing.two, padding: Spacing.four, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
    alignSelf: 'stretch',
  },
  primaryCtaText: { fontSize: 15, fontWeight: '800' },
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  secondaryCtaText: { fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 11, marginTop: Spacing.one },
});

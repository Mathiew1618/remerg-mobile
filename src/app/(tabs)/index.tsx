import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CrisisBar } from '@/components/crisis-bar';
import { NeedTile } from '@/components/need-tile';
import { Screen } from '@/components/ui/screen';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { NEEDS } from '@/data/taxonomy';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/lib/profile-context';

export default function HomeScreen() {
  const colors = useTheme();
  const { profile } = useProfile();

  // Anything the person flagged during personalization floats to the top; the
  // rest keep their original order so the grid never feels shuffled.
  const ordered = useMemo(() => {
    if (profile.needs.length === 0) return NEEDS;
    const picked = NEEDS.filter((n) => profile.needs.includes(n.id));
    const rest = NEEDS.filter((n) => !profile.needs.includes(n.id));
    return [...picked, ...rest];
  }, [profile.needs]);

  const hasPicks = profile.needs.length > 0;

  return (
    <Screen>
      <View style={styles.brandRow}>
        <View style={[styles.mark, { backgroundColor: Brand.navy }]}>
          <Text style={styles.markText}>R</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.wordmark, { color: colors.text }]}>Remerg</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Colorado re-entry resources
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/about')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="About Remerg">
          <Ionicons name="information-circle-outline" size={26} color={colors.textSecondary} />
        </Pressable>
      </View>

      <CrisisBar />

      <Text style={[styles.h2, { color: colors.text }]}>
        {hasPicks ? 'Your resources' : 'What do you need?'}
      </Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        {hasPicks
          ? 'Starting with what you told us matters most.'
          : 'Tap anything below. Nothing here requires an account.'}
      </Text>

      <View style={styles.grid}>
        {ordered.map((need) => (
          <NeedTile
            key={need.id}
            need={need}
            selected={profile.needs.includes(need.id)}
            onPress={() => router.push(`/need/${need.id}`)}
          />
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/personalize')}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.personalize,
          { borderColor: colors.border, backgroundColor: colors.backgroundElement, opacity: pressed ? 0.8 : 1 },
        ]}>
        <Ionicons name="options-outline" size={22} color={colors.tint} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.personalizeTitle, { color: colors.text }]}>
            {hasPicks ? 'Update what you need' : 'Personalize this app'}
          </Text>
          <Text style={[styles.personalizeSub, { color: colors.textSecondary }]}>
            Optional · stays on this phone · never sent anywhere
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.three },
  mark: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 13, fontWeight: '500' },
  h2: { fontSize: 20, fontWeight: '800', marginTop: Spacing.four },
  sub: { fontSize: 14, lineHeight: 20, marginTop: Spacing.one, marginBottom: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  personalize: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  personalizeTitle: { fontSize: 15, fontWeight: '700' },
  personalizeSub: { fontSize: 12, marginTop: 2 },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { callNumber } from '@/lib/dial';

/**
 * The safety net. Present on every primary screen.
 *
 * On remerg.com, crisis hotlines live inside a modal you have to go find. On a
 * phone that is the wrong hierarchy: the moment someone most needs this app is
 * the moment they have the least patience for navigating it. So the left half
 * dials 988 immediately and the right half opens the full list.
 */
export function CrisisBar() {
  const colors = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.crisisSurface, borderColor: colors.crisis }]}>
      <Pressable
        onPress={() => callNumber('988', 'Suicide & Crisis Lifeline')}
        accessibilityRole="button"
        accessibilityLabel="Call 988, the Suicide and Crisis Lifeline"
        style={({ pressed }) => [styles.primary, { backgroundColor: colors.crisis, opacity: pressed ? 0.8 : 1 }]}>
        <Ionicons name="call" size={18} color="#FFFFFF" />
        <View>
          <Text style={styles.primaryTitle}>Need help now</Text>
          <Text style={styles.primarySub}>Call 988 · 24/7</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push('/crisis')}
        accessibilityRole="button"
        accessibilityLabel="See all crisis hotlines"
        hitSlop={8}
        style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.6 : 1 }]}>
        <Text style={[styles.secondaryText, { color: colors.crisis }]}>All lines</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.crisis} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  primary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    minHeight: 52,
  },
  primaryTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  primarySub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  secondary: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.two, paddingVertical: Spacing.two },
  secondaryText: { fontSize: 13, fontWeight: '700' },
});

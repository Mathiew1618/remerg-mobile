import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openUrl } from '@/lib/dial';
import { REMERG_ORIGIN } from '@/lib/remerg';

/** Copy lifted from remerg.com/about/ so the app tells the same story. */
const STATS = [
  { value: '31%', label: 'of people released from Colorado prisons are re-incarcerated within three years' },
  { value: '$150k', label: 'estimated cost of a single incidence of recidivism' },
];

export default function AboutScreen() {
  const colors = useTheme();

  return (
    <Screen>
      <Text style={[styles.h1, { color: colors.text }]}>
        Ending recidivism in Colorado, one resource at a time.
      </Text>

      <Text style={[styles.body, { color: colors.textSecondary }]}>
        Remerg is a 501(c)(3) founded to break down the barriers to re-entry and stop the revolving
        door of recidivism. By connecting people leaving prison and jail with housing, employment
        and community resources — when they need them — Remerg fosters agency and supports success.
      </Text>

      <Text style={[styles.quote, { color: colors.text, borderColor: colors.accent }]}>
        There are enough barriers to starting over. Navigating resources shouldn&apos;t have to be
        one of them.
      </Text>

      <View style={styles.stats}>
        {STATS.map((s) => (
          <View key={s.value} style={[styles.stat, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.statValue, { color: colors.tint }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => openUrl(`${REMERG_ORIGIN}/about/`)}
        accessibilityRole="link"
        style={({ pressed }) => [styles.link, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
        <Ionicons name="open-outline" size={18} color={colors.tint} />
        <Text style={[styles.linkText, { color: colors.text }]}>Read more at remerg.com</Text>
      </Pressable>

      <Pressable
        onPress={() => openUrl(`${REMERG_ORIGIN}/support/`)}
        accessibilityRole="link"
        style={({ pressed }) => [styles.link, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
        <Ionicons name="heart-outline" size={18} color={colors.crisis} />
        <Text style={[styles.linkText, { color: colors.text }]}>Support Remerg</Text>
      </Pressable>

      <View style={[styles.disclaimer, { borderColor: colors.border }]}>
        <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
          This app is an independent client built against Remerg&apos;s public website. It is not
          published or endorsed by Remerg. Hotline numbers were verified on 18 September 2026 —
          always dial 911 in an emergency.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: '800', lineHeight: 33, letterSpacing: -0.5 },
  body: { fontSize: 15, lineHeight: 23, marginTop: Spacing.three },
  quote: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '600',
    fontStyle: 'italic',
    borderLeftWidth: 3,
    paddingLeft: Spacing.three,
    marginTop: Spacing.four,
  },
  stats: { gap: Spacing.two, marginTop: Spacing.four },
  stat: { padding: Spacing.three, borderRadius: Radius.lg },
  statValue: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  statLabel: { fontSize: 13, lineHeight: 19, marginTop: Spacing.one },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  linkText: { fontSize: 15, fontWeight: '700' },
  disclaimer: { marginTop: Spacing.five, paddingTop: Spacing.three, borderTopWidth: StyleSheet.hairlineWidth },
  disclaimerText: { fontSize: 12, lineHeight: 18 },
});

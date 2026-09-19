import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HotlineCard } from '@/components/hotline-card';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { HOTLINES } from '@/data/hotlines';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/lib/profile-context';

export default function SavedScreen() {
  const colors = useTheme();
  const { profile, reset } = useProfile();

  const savedHotlines = useMemo(
    () => HOTLINES.filter((h) => profile.saved.includes(h.id)),
    [profile.saved],
  );

  return (
    <Screen>
      <Text style={[styles.h1, { color: colors.text }]}>Saved</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Pinned lines, kept on this phone.
      </Text>

      {savedHotlines.length === 0 ? (
        <View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="bookmark-outline" size={30} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing pinned yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Tap the bookmark on any crisis line to keep it here for fast access.
          </Text>
          <Pressable
            onPress={() => router.push('/crisis')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cta, { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 }]}>
            <Text style={[styles.ctaText, { color: colors.onTint }]}>Browse crisis lines</Text>
          </Pressable>
        </View>
      ) : (
        savedHotlines.map((h) => <HotlineCard key={h.id} hotline={h} />)
      )}

      <View style={[styles.privacy, { borderColor: colors.border }]}>
        <Text style={[styles.privacyTitle, { color: colors.text }]}>Your data</Text>
        <Text style={[styles.privacyBody, { color: colors.textSecondary }]}>
          Everything you&apos;ve entered — needs, status, ZIP, pins — is stored only on this device.
          Nothing is uploaded to Remerg or anyone else.
        </Text>
        <Pressable
          onPress={reset}
          accessibilityRole="button"
          style={({ pressed }) => [styles.wipe, { borderColor: colors.crisis, opacity: pressed ? 0.7 : 1 }]}>
          <Ionicons name="trash-outline" size={16} color={colors.crisis} />
          <Text style={[styles.wipeText, { color: colors.crisis }]}>Erase everything on this device</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sub: { fontSize: 14, lineHeight: 20, marginTop: Spacing.one, marginBottom: Spacing.four },
  empty: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.five,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  cta: { marginTop: Spacing.two, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: Radius.pill },
  ctaText: { fontSize: 15, fontWeight: '700' },
  privacy: { marginTop: Spacing.five, paddingTop: Spacing.four, borderTopWidth: StyleSheet.hairlineWidth },
  privacyTitle: { fontSize: 16, fontWeight: '700' },
  privacyBody: { fontSize: 13, lineHeight: 19, marginTop: Spacing.one },
  wipe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  wipeText: { fontSize: 14, fontWeight: '700' },
});

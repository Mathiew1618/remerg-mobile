import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CallButton } from '@/components/call-button';
import { Radius, Spacing } from '@/constants/theme';
import type { Hotline } from '@/data/hotlines';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/lib/profile-context';

export function HotlineCard({ hotline }: { hotline: Hotline }) {
  const colors = useTheme();
  const { profile, toggleSaved } = useProfile();
  const urgent = hotline.category === 'emergency' || hotline.category === 'crisis';
  const isSaved = profile.saved.includes(hotline.id);

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text }]}>{hotline.name}</Text>
          <View style={styles.badges}>
            {hotline.availability === '24/7' ? (
              <Badge text="24/7" bg={colors.accentSurface} fg={colors.accent} />
            ) : null}
            {hotline.availability === 'varies' ? (
              <Badge text="Hours vary by area" bg={colors.backgroundElement} fg={colors.textSecondary} />
            ) : null}
            {hotline.availability === 'hours' ? (
              <Badge text="Business hours" bg={colors.backgroundElement} fg={colors.textSecondary} />
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={() => toggleSaved(hotline.id)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? `Unpin ${hotline.name}` : `Pin ${hotline.name}`}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isSaved ? colors.tint : colors.textSecondary}
          />
        </Pressable>
      </View>

      {hotline.description ? (
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{hotline.description}</Text>
      ) : null}

      {hotline.numbers.map((n) => (
        <CallButton
          key={`${hotline.id}-${n.number}-${n.label ?? ''}`}
          number={n.number}
          label={n.label}
          name={hotline.name}
          urgent={urgent}
        />
      ))}
    </View>
  );
}

function Badge({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  titleWrap: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one, marginTop: Spacing.one },
  badge: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: Radius.pill },
  badgeText: { fontSize: 11, fontWeight: '700' },
  desc: { fontSize: 14, lineHeight: 20, marginTop: Spacing.two },
});

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HitSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { callNumber, dialSuffixNote } from '@/lib/dial';

type Props = {
  number: string;
  /** Region or sub-line label, e.g. "Denver". */
  label?: string | null;
  name?: string;
  /** Emergency styling — red fill instead of navy outline. */
  urgent?: boolean;
};

/**
 * One tap = one call. No confirmation sheet, no intermediate detail screen.
 *
 * Sized above the 44pt minimum (see HitSize) because the realistic use case is
 * someone dialing one-handed under stress.
 */
export function CallButton({ number, label, name, urgent = false }: Props) {
  const colors = useTheme();
  const note = dialSuffixNote(number);

  const bg = urgent ? colors.crisis : colors.backgroundElement;
  const fg = urgent ? '#FFFFFF' : colors.text;

  return (
    <Pressable
      onPress={() => callNumber(number, name)}
      accessibilityRole="button"
      accessibilityLabel={`Call ${name ?? ''} ${label ?? ''} ${number}`.replace(/\s+/g, ' ').trim()}
      accessibilityHint="Opens your phone dialer"
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: bg, borderColor: urgent ? colors.crisis : colors.border, opacity: pressed ? 0.75 : 1 },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: urgent ? 'rgba(255,255,255,0.2)' : colors.background }]}>
        <Ionicons name="call" size={20} color={urgent ? '#FFFFFF' : colors.tint} />
      </View>

      <View style={styles.text}>
        {label ? <Text style={[styles.label, { color: urgent ? 'rgba(255,255,255,0.85)' : colors.textSecondary }]}>{label}</Text> : null}
        <Text style={[styles.number, { color: fg }]}>{number}</Text>
        {note ? (
          <Text style={[styles.note, { color: urgent ? 'rgba(255,255,255,0.85)' : colors.textSecondary }]}>
            {note}
          </Text>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={urgent ? 'rgba(255,255,255,0.7)' : colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: HitSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
  },
  iconWrap: { width: 36, height: 36, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  number: { fontSize: 18, fontWeight: '700' },
  note: { fontSize: 12, marginTop: 1 },
});

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { Need } from '@/data/taxonomy';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  need: Need;
  onPress: () => void;
  selected?: boolean;
};

/** Big, iconographic, two-per-row. Readable at arm's length and low literacy. */
export function NeedTile({ need, onPress, selected = false }: Props) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={need.label}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: selected ? colors.tint : colors.backgroundElement,
          borderColor: selected ? colors.tint : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <Ionicons name={need.icon} size={26} color={selected ? colors.onTint : colors.tint} />
      <Text numberOfLines={2} style={[styles.label, { color: selected ? colors.onTint : colors.text }]}>
        {need.short}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 96,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
    justifyContent: 'center',
  },
  label: { fontSize: 15, fontWeight: '700', lineHeight: 19 },
});

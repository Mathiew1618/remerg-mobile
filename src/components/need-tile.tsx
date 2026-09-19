import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import type { Need } from '@/data/taxonomy';

type Props = {
  need: Need;
  onPress: () => void;
  selected?: boolean;
};

/**
 * Big, iconographic, two per row — readable at arm's length and by someone who
 * reads slowly. The icon sits in its own tinted chip so the symbol, not the
 * word, is what you scan for.
 */
export function NeedTile({ need, onPress, selected = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={need.label}
      className={`min-h-[116px] flex-grow basis-[47%] justify-between rounded-card border p-3.5 active:opacity-80 ${
        selected ? 'border-brand bg-brand' : 'border-line bg-surface'
      }`}>
      <View
        className={`h-11 w-11 items-center justify-center rounded-2xl ${
          selected ? 'bg-brand-on/20' : 'bg-brand-soft'
        }`}>
        <Icon name={need.icon} size={24} className={selected ? 'text-brand-on' : 'text-brand'} />
      </View>
      <Text
        numberOfLines={2}
        className={`text-[15px] font-bold leading-5 ${selected ? 'text-brand-on' : 'text-ink'}`}>
        {need.short}
      </Text>
    </Pressable>
  );
}

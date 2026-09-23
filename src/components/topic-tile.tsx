import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import type { Topic } from '@/data/topics';

type Props = {
  topic: Topic;
  onPress: () => void;
  /** One of the person's own picks from Personalize. */
  picked?: boolean;
};

/**
 * A topic tile for the navy band: a white card with the icon in a mint
 * circle and the name in remerg.com's bold uppercase. A personalized pick is
 * the inverse, a mint card with a white circle, so it stands out in the grid.
 */
export function TopicTile({ topic, onPress, picked = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={topic.name}
      className={`min-h-[124px] flex-grow basis-[47%] items-center justify-center gap-2.5 rounded-card px-2.5 py-4 active:scale-[0.98] active:opacity-90 ${
        picked ? 'bg-accent' : 'bg-surface'
      }`}>
      <View className={`h-14 w-14 items-center justify-center rounded-full ${picked ? 'bg-surface' : 'bg-accent'}`}>
        <Icon name={topic.icon} size={28} className="text-brand" />
      </View>
      <Text
        numberOfLines={3}
        className="text-center text-[13px] font-extrabold uppercase leading-4 tracking-wide text-brand">
        {topic.name}
      </Text>
    </Pressable>
  );
}

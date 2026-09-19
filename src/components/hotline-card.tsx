import { Pressable, Text, View } from 'react-native';

import { CallButton } from '@/components/call-button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import type { Availability, Hotline } from '@/data/hotlines';
import { useProfile } from '@/lib/profile-context';

const AVAILABILITY: Record<Availability, { text: string; tone: 'accent' | 'neutral' }> = {
  '24/7': { text: 'Open 24/7', tone: 'accent' },
  hours: { text: 'Business hours', tone: 'neutral' },
  varies: { text: 'Hours vary by area', tone: 'neutral' },
};

export function HotlineCard({ hotline }: { hotline: Hotline }) {
  const { profile, toggleSaved } = useProfile();
  const urgent = hotline.category === 'emergency' || hotline.category === 'crisis';
  const isSaved = profile.saved.includes(hotline.id);
  const availability = AVAILABILITY[hotline.availability];

  return (
    <View className="mb-3 rounded-card border border-line bg-surface p-3.5">
      <View className="flex-row items-start gap-2">
        <View className="flex-1">
          <Text className="text-[17px] font-bold leading-6 text-ink">{hotline.name}</Text>
          <View className="mt-1.5 flex-row flex-wrap gap-1">
            <Badge
              text={availability.text}
              tone={availability.tone}
              icon={hotline.availability === '24/7' ? 'mci:clock-outline' : undefined}
            />
          </View>
        </View>

        <Pressable
          onPress={() => toggleSaved(hotline.id)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityState={{ selected: isSaved }}
          accessibilityLabel={isSaved ? `Unpin ${hotline.name}` : `Pin ${hotline.name}`}
          className="active:opacity-60">
          <Icon
            name={isSaved ? 'mci:bookmark' : 'mci:bookmark-outline'}
            size={22}
            className={isSaved ? 'text-brand' : 'text-muted'}
          />
        </Pressable>
      </View>

      {hotline.description ? (
        <Text className="mt-2 text-sm leading-5 text-muted">{hotline.description}</Text>
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

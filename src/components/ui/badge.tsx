import { Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';

export type BadgeTone = 'neutral' | 'accent' | 'brand' | 'crisis';

const TONES: Record<BadgeTone, { wrap: string; text: string }> = {
  neutral: { wrap: 'bg-elevated', text: 'text-muted' },
  accent: { wrap: 'bg-accent-soft', text: 'text-accent' },
  brand: { wrap: 'bg-brand-soft', text: 'text-brand' },
  crisis: { wrap: 'bg-crisis-soft', text: 'text-crisis' },
};

/** Small status pill. Shared so every card labels things the same way. */
export function Badge({
  text,
  tone = 'neutral',
  icon,
}: {
  text: string;
  tone?: BadgeTone;
  icon?: IconName;
}) {
  const t = TONES[tone];
  return (
    <View className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${t.wrap}`}>
      {icon ? <Icon name={icon} size={12} className={t.text} /> : null}
      <Text className={`text-[11px] font-bold ${t.text}`}>{text}</Text>
    </View>
  );
}

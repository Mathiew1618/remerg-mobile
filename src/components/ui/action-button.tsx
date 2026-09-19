import { Pressable, Text } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';

/**
 * The pill action used on every card: Call, Directions, Website.
 *
 * `primary` is reserved for the call action. Dialing is the point of this app,
 * so on any card that has a number, exactly one button should be filled.
 */
export function ActionButton({
  icon,
  label,
  onPress,
  primary = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`min-h-chip flex-row items-center gap-1.5 rounded-full px-4 active:opacity-75 ${
        primary ? 'bg-brand' : 'bg-elevated'
      }`}>
      <Icon name={icon} size={16} className={primary ? 'text-brand-on' : 'text-brand'} />
      <Text className={`text-sm font-bold ${primary ? 'text-brand-on' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}

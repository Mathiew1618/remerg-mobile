import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { callNumber, dialSuffixNote } from '@/lib/dial';

type Props = {
  number: string;
  /** Region or sub-line label, e.g. "Denver". */
  label?: string | null;
  name?: string;
  /** Emergency styling — red fill instead of a quiet outline. */
  urgent?: boolean;
};

/**
 * One tap = one call. No confirmation sheet, no intermediate detail screen.
 *
 * Deliberately taller than the 44pt minimum: the realistic use case is someone
 * dialing one-handed, under stress.
 */
export function CallButton({ number, label, name, urgent = false }: Props) {
  const note = dialSuffixNote(number);

  return (
    <Pressable
      onPress={() => callNumber(number, name)}
      accessibilityRole="button"
      accessibilityLabel={`Call ${name ?? ''} ${label ?? ''} ${number}`.replace(/\s+/g, ' ').trim()}
      accessibilityHint="Opens your phone dialer"
      className={`mt-2 min-h-touch flex-row items-center gap-3 rounded-field border px-3.5 py-2 active:opacity-75 ${
        urgent ? 'border-crisis bg-crisis' : 'border-line bg-elevated'
      }`}>
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          urgent ? 'bg-white/20' : 'bg-surface'
        }`}>
        <Icon name="mci:phone-in-talk" size={20} {...(urgent ? { color: '#FFFFFF' } : { className: 'text-brand' })} />
      </View>

      <View className="flex-1">
        {label ? (
          <Text
            className={`text-xs font-semibold uppercase tracking-wide ${
              urgent ? 'text-white/85' : 'text-muted'
            }`}>
            {label}
          </Text>
        ) : null}
        <Text className={`text-lg font-bold ${urgent ? 'text-white' : 'text-ink'}`}>{number}</Text>
        {note ? (
          <Text className={`text-xs ${urgent ? 'text-white/85' : 'text-muted'}`}>{note}</Text>
        ) : null}
      </View>

      <Icon
        name="ion:chevron-forward"
        size={18}
        {...(urgent ? { color: 'rgba(255,255,255,0.7)' } : { className: 'text-muted' })}
      />
    </Pressable>
  );
}

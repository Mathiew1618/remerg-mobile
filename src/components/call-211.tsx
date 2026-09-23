import { Pressable, Text } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { callNumber } from '@/lib/dial';

/** The fallback at the bottom of a page: a person who can search everything. */
export function Call211({ className = '' }: { className?: string }) {
  return (
    <Pressable
      onPress={() => callNumber('211', 'Colorado 211')}
      accessibilityRole="button"
      accessibilityLabel="Call 211"
      className={`min-h-touch flex-row items-center gap-3 rounded-card bg-elevated p-4 active:opacity-80 ${className}`}>
      <Icon name="mci:phone-in-talk" size={20} className="text-brand" />
      <Text className="flex-1 text-[13px] leading-5 text-muted">
        Can&apos;t find it? Tap to call <Text className="font-extrabold text-brand">211</Text> and a
        person will search Colorado&apos;s full database with you.
      </Text>
    </Pressable>
  );
}

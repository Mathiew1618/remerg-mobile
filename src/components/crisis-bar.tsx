import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { callNumber } from '@/lib/dial';

/**
 * The safety net. Present on every primary screen.
 *
 * On remerg.com, crisis hotlines live inside a modal you have to go find. On a
 * phone that is the wrong hierarchy: the moment someone most needs this app is
 * the moment they have the least patience for navigating it. So the left part
 * dials 988 immediately and the right part opens the full list.
 *
 * Deliberately slim — one row, the height of a touch target — so it is always
 * there without taking over the screen. It keeps crisis red: 988 must never be
 * mistaken for an ordinary link.
 */
export function CrisisBar() {
  return (
    <View className="min-h-[46px] flex-row items-center overflow-hidden rounded-field border border-crisis/25 bg-surface">
      <Pressable
        onPress={() => callNumber('988', 'Suicide & Crisis Lifeline')}
        accessibilityRole="button"
        accessibilityLabel="Call 988, the Suicide and Crisis Lifeline"
        className="min-h-[46px] flex-1 flex-row items-center gap-2 px-3 active:opacity-70">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-crisis">
          <Icon name="mci:phone-in-talk" size={15} color="#FFFFFF" />
        </View>
        <Text className="text-[14px] font-extrabold text-crisis">Need help now?</Text>
        <Text className="text-[13px] font-semibold text-ink">Call 988 · 24/7</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/crisis')}
        accessibilityRole="button"
        accessibilityLabel="See all crisis hotlines"
        hitSlop={8}
        className="min-h-[46px] flex-row items-center border-l border-line px-3 active:opacity-60">
        <Text className="text-[13px] font-bold text-crisis">All lines</Text>
        <Icon name="ion:chevron-forward" size={15} className="text-crisis" />
      </Pressable>
    </View>
  );
}

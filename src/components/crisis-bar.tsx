import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { callNumber } from '@/lib/dial';

/**
 * The safety net. Present on every primary screen.
 *
 * On remerg.com, crisis hotlines live inside a modal you have to go find. On a
 * phone that is the wrong hierarchy: the moment someone most needs this app is
 * the moment they have the least patience for navigating it. So the left half
 * dials 988 immediately and the right half opens the full list.
 */
export function CrisisBar() {
  return (
    <View className="flex-row items-center gap-2 rounded-card border border-crisis/30 bg-crisis-soft p-2">
      <Pressable
        onPress={() => callNumber('988', 'Suicide & Crisis Lifeline')}
        accessibilityRole="button"
        accessibilityLabel="Call 988, the Suicide and Crisis Lifeline"
        className="min-h-[54px] flex-1 flex-row items-center gap-2.5 rounded-field bg-crisis px-3.5 active:opacity-80">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Icon name="mci:phone-in-talk" size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text className="text-[15px] font-extrabold text-white">Need help now</Text>
          <Text className="text-xs font-semibold text-white/90">Call 988 · 24/7</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push('/crisis')}
        accessibilityRole="button"
        accessibilityLabel="See all crisis hotlines"
        hitSlop={8}
        className="flex-row items-center px-2 py-2 active:opacity-60">
        <Text className="text-[13px] font-bold text-crisis">All lines</Text>
        <Icon name="ion:chevron-forward" size={16} className="text-crisis" />
      </Pressable>
    </View>
  );
}

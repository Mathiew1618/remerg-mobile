import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CrisisBar } from '@/components/crisis-bar';
import { NeedTile } from '@/components/need-tile';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { NEEDS } from '@/data/taxonomy';
import { useProfile } from '@/lib/profile-context';

export default function HomeScreen() {
  const { profile } = useProfile();

  // Anything the person flagged during personalization floats to the top; the
  // rest keep their original order so the grid never feels shuffled.
  const ordered = useMemo(() => {
    if (profile.needs.length === 0) return NEEDS;
    const picked = NEEDS.filter((n) => profile.needs.includes(n.id));
    const rest = NEEDS.filter((n) => !profile.needs.includes(n.id));
    return [...picked, ...rest];
  }, [profile.needs]);

  const hasPicks = profile.needs.length > 0;

  return (
    <Screen>
      <View className="mb-4 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-field bg-brand">
          <Text className="text-[22px] font-extrabold text-brand-on">R</Text>
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-extrabold tracking-tight text-ink">Remerg</Text>
          <Text className="text-[13px] font-medium text-muted">Colorado re-entry resources</Text>
        </View>
        <Pressable
          onPress={() => router.push('/about')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="About Remerg"
          className="active:opacity-60">
          <Icon name="mci:information-outline" size={26} className="text-muted" />
        </Pressable>
      </View>

      <CrisisBar />

      <Text className="mt-6 text-xl font-extrabold tracking-tight text-ink">
        {hasPicks ? 'Your resources' : 'What do you need?'}
      </Text>
      <Text className="mb-3.5 mt-1 text-sm leading-5 text-muted">
        {hasPicks
          ? 'Starting with what you told us matters most.'
          : 'Tap anything below. Nothing here requires an account.'}
      </Text>

      <View className="flex-row flex-wrap gap-2.5">
        {ordered.map((need) => (
          <NeedTile
            key={need.id}
            need={need}
            selected={profile.needs.includes(need.id)}
            onPress={() => router.push(`/need/${need.id}`)}
          />
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/personalize')}
        accessibilityRole="button"
        className="mt-6 flex-row items-center gap-3 rounded-card border border-line bg-elevated p-3.5 active:opacity-80">
        <Icon name="mci:tune-variant" size={22} className="text-brand" />
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-ink">
            {hasPicks ? 'Update what you need' : 'Personalize this app'}
          </Text>
          <Text className="mt-0.5 text-xs text-muted">
            Optional · stays on this phone · never sent anywhere
          </Text>
        </View>
        <Icon name="ion:chevron-forward" size={18} className="text-muted" />
      </Pressable>
    </Screen>
  );
}

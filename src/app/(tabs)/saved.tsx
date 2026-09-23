import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HotlineCard } from '@/components/hotline-card';
import { Icon } from '@/components/ui/icon';
import { Band } from '@/components/ui/band';
import { Screen } from '@/components/ui/screen';
import { HOTLINES } from '@/data/hotlines';
import { useProfile } from '@/lib/profile-context';

export default function SavedScreen() {
  const { profile, reset } = useProfile();

  const savedHotlines = useMemo(
    () => HOTLINES.filter((h) => profile.saved.includes(h.id)),
    [profile.saved],
  );

  return (
    <Screen bands>
      <Band tone="green">
        <Text className="text-[30px] font-extrabold tracking-tight text-brand">Saved</Text>
        <Text className="mt-1 text-[15px] font-semibold leading-6 text-brand">
          Pinned lines, kept on this phone.
        </Text>
      </Band>

      <Band tone="blue">
        {savedHotlines.length === 0 ? (
          <View className="items-center gap-2 rounded-card bg-surface p-8">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
              <Icon name="mci:bookmark-outline" size={28} className="text-brand" />
            </View>
            <Text className="mt-1 text-[17px] font-extrabold text-brand">Nothing pinned yet</Text>
            <Text className="text-center text-sm leading-5 text-muted">
              Tap the bookmark on any crisis line to keep it here for fast access.
            </Text>
            <Pressable
              onPress={() => router.push('/crisis')}
              accessibilityRole="button"
              className="mt-2 min-h-chip justify-center rounded-full bg-accent px-6 active:opacity-85">
              <Text className="text-[15px] font-extrabold text-brand">Browse crisis lines</Text>
            </Pressable>
          </View>
        ) : (
          savedHotlines.map((h) => <HotlineCard key={h.id} hotline={h} />)
        )}
      </Band>

      <Band tone="white">
        <Text className="text-base font-extrabold text-brand">Your data</Text>
        <Text className="mt-1 text-[13px] leading-5 text-muted">
          Everything you&apos;ve entered — needs, status, ZIP, pins — is stored only on this device.
          Nothing is uploaded to Remerg or anyone else.
        </Text>
        <Pressable
          onPress={reset}
          accessibilityRole="button"
          className="mt-3.5 min-h-chip flex-row items-center justify-center gap-2 rounded-field border border-crisis active:opacity-70">
          <Icon name="ion:trash-outline" size={16} className="text-crisis" />
          <Text className="text-sm font-bold text-crisis">Erase everything on this device</Text>
        </Pressable>
      </Band>
    </Screen>
  );
}

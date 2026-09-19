import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HotlineCard } from '@/components/hotline-card';
import { Icon } from '@/components/ui/icon';
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
    <Screen>
      <Text className="text-[28px] font-extrabold tracking-tight text-ink">Saved</Text>
      <Text className="mb-6 mt-1 text-sm leading-5 text-muted">
        Pinned lines, kept on this phone.
      </Text>

      {savedHotlines.length === 0 ? (
        <View className="items-center gap-2 rounded-card border border-line bg-elevated p-8">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
            <Icon name="mci:bookmark-outline" size={28} className="text-brand" />
          </View>
          <Text className="mt-1 text-[17px] font-bold text-ink">Nothing pinned yet</Text>
          <Text className="text-center text-sm leading-5 text-muted">
            Tap the bookmark on any crisis line to keep it here for fast access.
          </Text>
          <Pressable
            onPress={() => router.push('/crisis')}
            accessibilityRole="button"
            className="mt-2 min-h-chip justify-center rounded-full bg-brand px-6 active:opacity-85">
            <Text className="text-[15px] font-bold text-brand-on">Browse crisis lines</Text>
          </Pressable>
        </View>
      ) : (
        savedHotlines.map((h) => <HotlineCard key={h.id} hotline={h} />)
      )}

      <View className="mt-8 border-t border-line pt-6">
        <Text className="text-base font-bold text-ink">Your data</Text>
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
      </View>
    </Screen>
  );
}

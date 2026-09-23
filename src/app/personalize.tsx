import { router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Band, BandHeading } from '@/components/ui/band';
import { Screen } from '@/components/ui/screen';
import { AGE_RANGES, JUSTICE_STATUS, NEEDS } from '@/data/taxonomy';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/lib/profile-context';

/**
 * The website's registration survey, rebuilt as an optional, skippable,
 * device-local step. See the note at the top of src/lib/profile.ts for why this
 * is deliberately not a signup wall.
 */
export default function PersonalizeScreen() {
  const colors = useTheme();
  const { profile, update, toggleNeed } = useProfile();

  return (
    <Screen bands>
      <Band tone="green">
      <View className="flex-row items-start gap-2.5 rounded-field bg-surface p-3.5">
        <Icon name="mci:lock-outline" size={18} className="text-accent-ink" />
        <Text className="flex-1 text-[13px] font-semibold leading-5 text-ink">
          Everything here stays on this phone. It is never uploaded, and you can skip all of it.
        </Text>
      </View>

      <BandHeading tone="green" className="mb-1 mt-6">What do you need help with?</BandHeading>
      <Text className="text-[13px] font-semibold leading-5 text-brand/80">Pick as many as apply.</Text>
      <View className="mt-3.5 flex-row flex-wrap gap-2">
        {NEEDS.map((n) => {
          const on = profile.needs.includes(n.id);
          return (
            <Pressable
              key={n.id}
              onPress={() => toggleNeed(n.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={n.label}
              className={`min-h-[42px] flex-row items-center gap-1.5 rounded-full border px-3.5 active:opacity-75 ${
                on ? 'border-brand bg-brand' : 'border-transparent bg-surface'
              }`}>
              <Icon name={n.icon} size={16} className={on ? 'text-brand-on' : 'text-brand'} />
              <Text className={`text-sm font-bold ${on ? 'text-brand-on' : 'text-ink'}`}>
                {n.short}
              </Text>
            </Pressable>
          );
        })}
      </View>

      </Band>

      <Band tone="blue">
      <BandHeading tone="blue">Where are you in the process?</BandHeading>
      <View className="gap-2">
        {JUSTICE_STATUS.map((s) => {
          const on = profile.justiceStatus === s;
          return (
            <Pressable
              key={s}
              onPress={() => update({ justiceStatus: on ? null : s })}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              className={`min-h-touch flex-row items-center gap-2.5 rounded-field border px-3.5 active:opacity-75 ${
                on ? 'border-accent bg-accent' : 'border-transparent bg-surface'
              }`}>
              <Icon
                name={on ? 'mci:radiobox-marked' : 'mci:radiobox-blank'}
                size={20}
                className={on ? 'text-brand' : 'text-muted'}
              />
              <Text className="flex-1 py-3 text-sm leading-5 text-ink">{s}</Text>
            </Pressable>
          );
        })}
      </View>

      <BandHeading tone="blue" className="mt-6">Age range</BandHeading>
      <View className="flex-row flex-wrap gap-2">
        {AGE_RANGES.map((a) => {
          const on = profile.ageRange === a;
          return (
            <Pressable
              key={a}
              onPress={() => update({ ageRange: on ? null : a })}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              className={`min-h-[42px] justify-center rounded-full border px-4 active:opacity-75 ${
                on ? 'border-accent bg-accent' : 'border-transparent bg-surface'
              }`}>
              <Text className={`text-sm font-bold ${on ? 'text-brand' : 'text-ink'}`}>{a}</Text>
            </Pressable>
          );
        })}
      </View>

      </Band>

      <Band tone="white">
      <BandHeading tone="white" className="mb-1">ZIP code</BandHeading>
      <Text className="mt-1 text-[13px] leading-5 text-muted">
        Used only to sort places by distance once listings are available.
      </Text>
      <TextInput
        value={profile.zip ?? ''}
        onChangeText={(t) => update({ zip: t.replace(/[^0-9]/g, '').slice(0, 5) || null })}
        placeholder="80202"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        maxLength={5}
        accessibilityLabel="ZIP code"
        className="mt-3.5 h-[52px] rounded-field border border-line bg-elevated px-3.5 text-[17px] font-semibold text-ink"
      />

      <Pressable
        onPress={() => {
          update({ onboarded: true });
          router.back();
        }}
        accessibilityRole="button"
        className="mt-8 min-h-touch items-center justify-center rounded-full bg-brand active:opacity-85">
        <Text className="text-base font-extrabold text-brand-on">Save to this phone</Text>
      </Pressable>
      </Band>
    </Screen>
  );
}

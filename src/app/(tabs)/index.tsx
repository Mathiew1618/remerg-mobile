import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Call211 } from '@/components/call-211';
import { CrisisBar } from '@/components/crisis-bar';
import { HeaderLogo } from '@/components/header-logo';
import { TopicTile } from '@/components/topic-tile';
import { Band, BandHeading } from '@/components/ui/band';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { TOPICS } from '@/data/topics';
import { useProfile } from '@/lib/profile-context';

/**
 * Home: the same front door as remerg.com, in the app's three bands.
 *
 *   green — logo, crisis line, headline and a big photo
 *   blue  — Remerg's twenty topics: ten up front, ten behind "Show more
 *           resources", exactly as the website does it
 *   white — personalize, and 211 for anything not listed
 */
export default function HomeScreen() {
  const { profile } = useProfile();
  const [showAll, setShowAll] = useState(false);

  // Topics the person flagged during personalization float to the top (even
  // from the "more" set); everything else keeps the website's order.
  const { picked, main, more } = useMemo(() => {
    const isPicked = (t: (typeof TOPICS)[number]) => t.needs.some((n) => profile.needs.includes(n));
    return {
      picked: TOPICS.filter(isPicked),
      main: TOPICS.filter((t) => t.main && !isPicked(t)),
      more: TOPICS.filter((t) => !t.main && !isPicked(t)),
    };
  }, [profile.needs]);

  const open = (slug: string) => router.push(`/topic/${slug}`);
  const hasPicks = picked.length > 0;

  return (
    <Screen bands>
      <Band tone="green" className="pt-5">
        <View className="mb-4 flex-row items-center">
          {/* White badge: the logo's mint tagline would vanish on the mint band. */}
          <View className="rounded-field bg-surface px-3 py-2">
            <HeaderLogo />
          </View>
          <View className="flex-1" />
          <Pressable
            onPress={() => router.push('/about')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="About Remerg"
            className="h-11 w-11 items-center justify-center rounded-full bg-brand active:opacity-70">
            <Icon name="mci:information-variant" size={24} className="text-brand-on" />
          </Pressable>
        </View>

        <CrisisBar />

        <Text className="mt-5 text-[30px] font-extrabold leading-9 tracking-tight text-brand">
          Re-entry resources for Colorado.
        </Text>
        <Text className="mt-2 text-[15px] font-semibold leading-6 text-brand">
          Remerg&apos;s {TOPICS.length} topics in your pocket. Nothing here needs an account.
        </Text>

        <Image
          source={require('../../../assets/images/photos/community-park.jpg')}
          style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 20, marginTop: 18 }}
          contentFit="cover"
          accessibilityLabel="Friends together in a park"
        />
      </Band>

      <Band tone="blue">
        {hasPicks ? (
          <>
            <BandHeading tone="blue">Your topics</BandHeading>
            <View className="mb-6 flex-row flex-wrap gap-2.5">
              {picked.map((t) => (
                <TopicTile key={t.slug} topic={t} picked onPress={() => open(t.slug)} />
              ))}
            </View>
          </>
        ) : null}

        <BandHeading tone="blue">{hasPicks ? 'All topics' : 'Search by topic'}</BandHeading>
        <View className="flex-row flex-wrap gap-2.5">
          {main.map((t) => (
            <TopicTile key={t.slug} topic={t} onPress={() => open(t.slug)} />
          ))}
          {showAll ? more.map((t) => <TopicTile key={t.slug} topic={t} onPress={() => open(t.slug)} />) : null}
        </View>

        {more.length > 0 ? (
          <Pressable
            onPress={() => setShowAll((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showAll ? 'Show fewer resources' : 'Show more resources'}
            className="mt-4 min-h-touch flex-row items-center justify-center gap-1.5 rounded-full bg-accent active:opacity-85">
            <Text className="text-sm font-extrabold uppercase tracking-wide text-brand">
              {showAll ? 'Show fewer resources' : `Show ${more.length} more resources`}
            </Text>
            <Icon name={showAll ? 'ion:chevron-up' : 'ion:chevron-down'} size={16} className="text-brand" />
          </Pressable>
        ) : null}
      </Band>

      <Band tone="white">
        <Pressable
          onPress={() => router.push('/personalize')}
          accessibilityRole="button"
          className="flex-row items-center gap-3 rounded-card border-2 border-accent bg-surface p-4 active:opacity-80">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-accent">
            <Icon name="mci:tune-variant" size={22} className="text-brand" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-extrabold text-brand">
              {hasPicks ? 'Update what you need' : 'Personalize this app'}
            </Text>
            <Text className="mt-0.5 text-xs text-muted">Optional · stays on this phone · never sent anywhere</Text>
          </View>
          <Icon name="ion:chevron-forward" size={18} className="text-brand" />
        </Pressable>

        <Call211 className="mt-3" />
      </Band>
    </Screen>
  );
}

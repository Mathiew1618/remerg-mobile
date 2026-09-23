import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { CrisisBar } from '@/components/crisis-bar';
import { Icon } from '@/components/ui/icon';
import { Call211 } from '@/components/call-211';
import { Band, BandHeading } from '@/components/ui/band';
import { Screen } from '@/components/ui/screen';
import { MAP_CATEGORIES, type MapCategory } from '@/data/taxonomy';
import { useTheme } from '@/hooks/use-theme';
import { fetchMapCategories } from '@/lib/remerg';

export default function DirectoryScreen() {
  const colors = useTheme();
  const [categories, setCategories] = useState<MapCategory[]>(MAP_CATEGORIES);
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetchMapCategories().then((res) => {
      if (!alive) return;
      setCategories(res.data);
      setLive(res.live);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Screen bands>
      <Band tone="green">
        <Text className="text-[30px] font-extrabold tracking-tight text-brand">Find a place</Text>
        <Text className="mb-4 mt-1 text-[15px] font-semibold leading-6 text-brand">
          The six categories on Remerg&apos;s resource map.
        </Text>

        <CrisisBar />

        <View className="mt-3.5 min-h-[20px] flex-row items-center gap-2">
          {live === null ? (
            <ActivityIndicator size="small" color={colors.tint} />
          ) : (
            <Icon
              name={live ? 'mci:cloud-check-outline' : 'mci:cloud-off-outline'}
              size={15}
              className="text-brand"
            />
          )}
          <Text className="text-xs font-bold text-brand/80">
            {live === null
              ? 'Checking remerg.com…'
              : live
                ? 'Categories synced with remerg.com'
                : 'Offline — showing the built-in list'}
          </Text>
        </View>
      </Band>

      <Band tone="blue">
        <BandHeading tone="blue">On the map</BandHeading>
        {categories.map((cat) => (
          <Pressable
            key={cat.slug}
            onPress={() => router.push(`/category/${cat.slug}`)}
            accessibilityRole="button"
            accessibilityLabel={cat.name}
            className="mb-2.5 flex-row items-center gap-3.5 rounded-card bg-surface p-4 active:opacity-85">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-accent">
              <Icon name={cat.icon} size={24} className="text-brand" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-extrabold text-brand">{cat.name}</Text>
              <Text className="mt-0.5 text-[13px] leading-5 text-muted">{cat.blurb}</Text>
            </View>
            <Icon name="ion:chevron-forward" size={18} className="text-brand" />
          </Pressable>
        ))}
      </Band>

      <Band tone="white">
        <Call211 />
      </Band>
    </Screen>
  );
}

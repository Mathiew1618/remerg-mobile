import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { CrisisBar } from '@/components/crisis-bar';
import { Icon } from '@/components/ui/icon';
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
    <Screen>
      <Text className="text-[28px] font-extrabold tracking-tight text-ink">Find a place</Text>
      <Text className="mb-3.5 mt-1 text-sm leading-5 text-muted">
        The six categories on Remerg&apos;s resource map.
      </Text>

      <CrisisBar />

      <View className="mb-2 mt-3.5 min-h-[20px] flex-row items-center gap-2">
        {live === null ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <Icon
            name={live ? 'mci:cloud-check-outline' : 'mci:cloud-off-outline'}
            size={15}
            className="text-muted"
          />
        )}
        <Text className="text-xs font-semibold text-muted">
          {live === null
            ? 'Checking remerg.com…'
            : live
              ? 'Categories synced with remerg.com'
              : 'Offline — showing the built-in list'}
        </Text>
      </View>

      {categories.map((cat) => (
        <Pressable
          key={cat.slug}
          onPress={() => router.push(`/category/${cat.slug}`)}
          accessibilityRole="button"
          accessibilityLabel={cat.name}
          className="mt-2.5 flex-row items-center gap-3.5 rounded-card border border-line bg-surface p-3.5 active:opacity-75">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft">
            <Icon name={cat.icon} size={24} className="text-brand" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-ink">{cat.name}</Text>
            <Text className="mt-0.5 text-[13px] leading-5 text-muted">{cat.blurb}</Text>
          </View>
          <Icon name="ion:chevron-forward" size={18} className="text-muted" />
        </Pressable>
      ))}
    </Screen>
  );
}

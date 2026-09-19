import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

/**
 * Tab bar.
 *
 * `screenOptions` is one of the few places that still needs resolved color
 * values rather than classes — React Navigation takes colors, not classNames.
 */
const TABS: { name: string; title: string; icon: IconName; active: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'mci:home-variant-outline', active: 'mci:home-variant' },
  { name: 'directory', title: 'Find', icon: 'mci:map-search-outline', active: 'mci:map-search' },
  { name: 'crisis', title: 'Crisis', icon: 'mci:phone-in-talk-outline', active: 'mci:phone-in-talk' },
  { name: 'saved', title: 'Saved', icon: 'mci:bookmark-outline', active: 'mci:bookmark' },
];

export default function TabsLayout() {
  const colors = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.select({ ios: 88, default: 68 }),
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarItemStyle: { paddingTop: 2 },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, focused, size }) => (
              <Icon name={focused ? t.active : t.icon} size={size ?? 24} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

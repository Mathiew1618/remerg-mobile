import { DefaultTheme, Stack, ThemeProvider, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import { ProfileProvider } from '@/lib/profile-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navigation = useNavigationContainerRef();

  // Web only. When a screen opens, the navigator marks the screen underneath
  // aria-hidden. The button that was just pressed is still focused inside it,
  // and WAI-ARIA forbids aria-hidden on a focused element's ancestor (a
  // keyboard or screen-reader user would be left focused on something they
  // cannot perceive), so the browser blocks it and logs "Blocked aria-hidden".
  // Moving focus off before the screens change fixes it at the source.
  // __unsafe_action__ fires as each action is dispatched, before the new state
  // renders, which is the moment that matters. It is documented as a
  // debugging hook, so if a future version drops it, this simply stops
  // running and the old warning returns; nothing breaks.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    return navigation.addListener('__unsafe_action__', () => {
      const el = document.activeElement;
      if (el instanceof HTMLElement && el !== document.body) el.blur();
    });
  }, [navigation]);

  // The stock template hid the splash from its animated overlay component, which
  // this app no longer renders. Without this the splash never dismisses.
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  // Light-only by design: the green / blue / white page bands are fixed
  // colors and must not flip with the phone's dark-mode setting.
  const colors = Colors.light;

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.tint,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <ProfileProvider>
      <ThemeProvider value={navTheme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="topic/[slug]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="category/[slug]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen
            name="personalize"
            options={{ headerShown: true, presentation: 'modal', title: 'Personalize' }}
          />
          <Stack.Screen name="about" options={{ headerShown: true, title: 'About Remerg' }} />
          <Stack.Screen name="place" options={{ headerShown: true, title: 'Directions' }} />
        </Stack>
      </ThemeProvider>
    </ProfileProvider>
  );
}

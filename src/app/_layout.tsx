import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { ProfileProvider } from '@/lib/profile-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // The stock template hid the splash from its animated overlay component, which
  // this app no longer renders. Without this the splash never dismisses.
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme : DefaultTheme).colors,
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
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="need/[id]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="category/[slug]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen
            name="personalize"
            options={{ headerShown: true, presentation: 'modal', title: 'Personalize' }}
          />
          <Stack.Screen name="about" options={{ headerShown: true, title: 'About Remerg' }} />
        </Stack>
      </ThemeProvider>
    </ProfileProvider>
  );
}

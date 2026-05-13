import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const highContrastTheme: Theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: isDark ? '#FFD100' : '#000000', // MTN yellow for dark, black for light
      background: isDark ? '#000000' : '#FFD100', // Black for dark, MTN yellow for light
      card: isDark ? '#222' : '#fff',
      text: isDark ? '#FFD100' : '#000000', // MTN yellow for dark, black for light
      border: isDark ? '#FFD100' : '#000000',
      notification: isDark ? '#FFD100' : '#0057B8', // Yellow or blue accent
    },
  };

  return (
    <ThemeProvider value={highContrastTheme}>

      <Stack initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="player" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

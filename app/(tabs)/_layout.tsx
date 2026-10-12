import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].text,
        tabBarStyle: {
          height: 62 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].tint,
          borderTopWidth: 2,
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '900', marginTop: 0 },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={22}
              name="house.fill"
              color={String(color ?? '#000000')}
            />
          ),
        }}
      />
    </Tabs>
  );
}

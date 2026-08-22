import { Tabs } from 'expo-router';
import { colors } from '../../src/components';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ headerTintColor: colors.text, tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Users' }} />
      <Tabs.Screen name="spots" options={{ title: 'Spots' }} />
      <Tabs.Screen name="commission" options={{ title: 'Commission' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="spot/[id]" options={{ href: null, title: 'Spot' }} />
      <Tabs.Screen name="restaurant/[id]" options={{ href: null, title: 'Restaurant' }} />
    </Tabs>
  );
}

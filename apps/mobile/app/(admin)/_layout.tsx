import { Tabs } from 'expo-router';
import { colors } from '../../src/components';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ headerTintColor: colors.text, tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="users" options={{ title: 'Users' }} />
      <Tabs.Screen name="spots" options={{ title: 'Spots' }} />
      <Tabs.Screen name="commission" options={{ title: 'Commission' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

      {/* Hide detail routes - accessible via programmatic navigation only */}
      <Tabs.Screen name="guide-verifications" options={{ href: null, title: 'Guide Verification' }} />
      <Tabs.Screen name="spot/[id]" options={{ href: null, title: 'Spot' }} />
      <Tabs.Screen name="restaurant/[id]" options={{ href: null, title: 'Restaurant' }} />
    </Tabs>
  );
}

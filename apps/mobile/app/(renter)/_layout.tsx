import { Tabs } from 'expo-router';
import { colors } from '../../src/components';

export default function RenterLayout() {
  return (
    <Tabs screenOptions={{ headerTintColor: colors.text, tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Listings' }} />
      <Tabs.Screen name="bookings/index" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="chat/index" options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

      <Tabs.Screen name="rentals/new" options={{ href: null, title: 'New Listing' }} />
      <Tabs.Screen name="rentals/[id]" options={{ href: null, title: 'Edit Listing' }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null, title: 'Conversation' }} />
    </Tabs>
  );
}

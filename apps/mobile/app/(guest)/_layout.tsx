import { Tabs } from 'expo-router';
import { colors } from '../../src/components';

export default function GuestLayout() {
  return (
    <Tabs screenOptions={{ headerTintColor: colors.text, tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Explore' }} />
      <Tabs.Screen name="bookings/index" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="chat/index" options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

      <Tabs.Screen name="guide/[id]" options={{ href: null, title: 'Guide' }} />
      <Tabs.Screen name="rental/[id]" options={{ href: null, title: 'Rental' }} />
      <Tabs.Screen name="bookings/[id]" options={{ href: null, title: 'Booking' }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null, title: 'Conversation' }} />
    </Tabs>
  );
}

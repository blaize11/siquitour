import { Tabs } from 'expo-router';
import { colors } from '../../src/components';

export default function GuideLayout() {
  return (
    <Tabs screenOptions={{ headerTintColor: colors.text, tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="availability" options={{ title: 'Availability' }} />
      <Tabs.Screen name="chat/index" options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

      <Tabs.Screen name="chat/[id]" options={{ href: null, title: 'Conversation' }} />
    </Tabs>
  );
}

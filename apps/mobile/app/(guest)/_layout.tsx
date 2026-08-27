import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, NotificationBell, ChatBadgeIcon } from '../../src/components';

export default function GuestLayout() {
  const router = useRouter();

  return (
    <Tabs screenOptions={{
      headerTintColor: colors.text,
      tabBarActiveTintColor: colors.primary,
      headerRight: () => (
        <NotificationBell onPress={() => router.push('/(guest)/notifications')} />
      ),
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings/index"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <ChatBadgeIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />

      {/* Hide detail routes & reviews - accessible via programmatic navigation only */}
      <Tabs.Screen
        name="guide/[id]"
        options={{
          href: null,
          title: 'Guide',
        }}
      />
      <Tabs.Screen
        name="rental/[id]"
        options={{
          href: null,
          title: 'Rental',
        }}
      />
      <Tabs.Screen
        name="spot/[id]"
        options={{
          href: null,
          title: 'Spot',
        }}
      />
      <Tabs.Screen
        name="restaurant/[id]"
        options={{
          href: null,
          title: 'Restaurant',
        }}
      />
      <Tabs.Screen
        name="bookings/[id]"
        options={{
          href: null,
          title: 'Booking',
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
          title: 'Conversation',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: 'Notifications',
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          href: null,
          title: 'Reviews',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
          title: 'Search',
        }}
      />
    </Tabs>
  );
}

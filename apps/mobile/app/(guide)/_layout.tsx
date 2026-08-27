import { Tabs } from 'expo-router';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, NotificationBell, ChatBadgeIcon } from '../../src/components';

export default function GuideLayout() {
  return (
    <Tabs screenOptions={{
      headerTintColor: colors.text,
      tabBarActiveTintColor: colors.primary,
      headerRight: () => (
        <NotificationBell />
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
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          title: 'Availability',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
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

      {/* Hide detail routes - accessible via programmatic navigation only */}
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
          title: 'Conversation',
        }}
      />
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
        name="restaurant/[id]"
        options={{
          href: null,
          title: 'Restaurant',
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
        name="bookings/[id]"
        options={{
          href: null,
          title: 'Booking',
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
    </Tabs>
  );
}

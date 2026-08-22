import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, NotificationBell, ChatBadgeIcon } from '../../src/components';

export default function RenterLayout() {
  const router = useRouter();

  return (
    <Tabs screenOptions={{
      headerTintColor: colors.text,
      tabBarActiveTintColor: colors.primary,
      headerRight: () => (
        <NotificationBell onPress={() => router.push('/(renter)/notifications')} />
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
          title: 'Listings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
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
        name="reviews"
        options={{
          title: 'Reviews',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
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

      <Tabs.Screen name="rentals/new" options={{ href: null, title: 'New Listing' }} />
      <Tabs.Screen name="rentals/[id]" options={{ href: null, title: 'Edit Listing' }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null, title: 'Conversation' }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: 'Notifications' }} />
      <Tabs.Screen name="spot/[id]" options={{ href: null, title: 'Spot' }} />
      <Tabs.Screen name="restaurant/[id]" options={{ href: null, title: 'Restaurant' }} />
    </Tabs>
  );
}

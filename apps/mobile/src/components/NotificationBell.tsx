import { Pressable, Text, View } from 'react-native';
import { useNotifications } from '../api/queries/notifications';
import { colors } from './theme';

interface NotificationBellProps {
  onPress: () => void;
}

export function NotificationBell({ onPress }: NotificationBellProps) {
  const { data } = useNotifications();
  const unreadCount = data?.unread_count || 0;

  return (
    <Pressable onPress={onPress} style={{ position: 'relative', padding: 8 }}>
      <Text style={{ fontSize: 24 }}>🔔</Text>
      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: '#d32f2f',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#fff',
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 10,
              fontWeight: '700',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

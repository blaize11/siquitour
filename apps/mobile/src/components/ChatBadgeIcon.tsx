import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConversations } from '../api/queries/chat';

interface ChatBadgeIconProps {
  color: string;
  size: number;
}

export function ChatBadgeIcon({ color, size }: ChatBadgeIconProps) {
  const { data } = useConversations();

  // Calculate total unread messages
  const totalUnread = (data?.data || []).reduce(
    (sum, conversation) => sum + (conversation.unread_messages_count || 0),
    0
  );

  console.log('ChatBadgeIcon - Total unread:', totalUnread, 'Conversations:', data?.data);

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="chatbubble-ellipses" size={size} color={color} />
      {totalUnread > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -8,
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
            {totalUnread > 99 ? '99+' : totalUnread}
          </Text>
        </View>
      )}
    </View>
  );
}

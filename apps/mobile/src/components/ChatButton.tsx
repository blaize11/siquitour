import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { colors, spacing, radius } from './theme';
import { apiFetch } from '../api/client';

type Props = {
  userId: number;
  userName?: string;
  style?: any;
};

export function ChatButton({ userId, userName = 'User', style }: Props) {
  const router = useRouter();

  const startConversationMutation = useMutation({
    mutationFn: async () => {
      return await apiFetch<any>('/conversations', {
        method: 'POST',
        body: { user_id: userId },
      });
    },
    onSuccess: (data) => {
      const conversationId = data?.id;
      if (conversationId) {
        router.push(`/chat/${conversationId}`);
      }
    },
  });

  const handleChat = () => {
    startConversationMutation.mutate();
  };

  return (
    <Pressable
      onPress={handleChat}
      disabled={startConversationMutation.isPending}
      style={{
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        opacity: startConversationMutation.isPending ? 0.7 : 1,
        ...style,
      }}
    >
      {startConversationMutation.isPending ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Text style={{ fontSize: 18 }}>💬</Text>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Message</Text>
        </>
      )}
    </Pressable>
  );
}

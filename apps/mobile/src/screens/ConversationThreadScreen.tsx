import { useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConversations, useMessages, useSendMessage } from '../api/queries/chat';
import { useSession } from '../auth/SessionContext';
import { ErrorView, LoadingView, colors, radius, spacing, typography } from '../components';
import { extractErrorMessage } from '../components/ErrorView';

export function ConversationThreadScreen({ conversationId }: { conversationId: number }) {
  const { user } = useSession();
  const { data: conversationsData } = useConversations();
  const { data: messagesData, isLoading, isError, error, refetch } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const [body, setBody] = useState('');

  // Find the conversation to get the other user
  const conversation = conversationsData?.data?.find((c) => c.id === conversationId);
  const otherUser =
    conversation?.participant_one_id === user?.id
      ? conversation?.participant_two
      : conversation?.participant_one;

  const onSend = async () => {
    if (!body.trim()) return;
    const text = body;
    setBody('');
    try {
      await sendMessage.mutateAsync(text);
    } catch {
      setBody(text);
    }
  };

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const messages = messagesData?.data ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {otherUser?.profile_image_url ? (
            <Image source={{ uri: otherUser.profile_image_url }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
              <Text style={styles.headerAvatarText}>
                {otherUser?.name?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{otherUser?.name ?? 'Chat'}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
          <Pressable style={styles.headerAction}>
            <Text style={styles.headerActionIcon}>ℹ️</Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {/* Messages List */}
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💬</Text>
            <Text style={styles.emptyStateText}>No messages yet</Text>
            <Text style={styles.emptyStateSubtext}>Start the conversation!</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => String(item.id)}
            inverted
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => {
              const mine = item.sender_id === user?.id;
              return (
                <View style={[styles.messageRow, mine && styles.messageRowMine]}>
                  {!mine && <View style={styles.messageSpacer} />}
                  <View style={[styles.messageBubble, mine ? styles.messageBubbleMine : styles.messageBubbleTheirs]}>
                    <Text style={[styles.messageText, mine && styles.messageTextMine]}>
                      {item.body}
                    </Text>
                    <Text style={[styles.messageTime, mine && styles.messageTimeMine]}>
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  {mine && <View style={styles.messageSpacer} />}
                </View>
              );
            }}
          />
        )}

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={body}
              onChangeText={setBody}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={onSend}
              disabled={!body.trim() || sendMessage.isPending}
              style={[styles.sendButton, (!body.trim() || sendMessage.isPending) && styles.sendButtonDisabled]}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    resizeMode: 'cover',
  },
  headerAvatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  headerStatus: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  headerAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionIcon: {
    fontSize: 18,
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageSpacer: {
    width: '15%',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  messageBubbleMine: {
    backgroundColor: colors.primary,
  },
  messageBubbleTheirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMine: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  messageTimeMine: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyStateIcon: {
    fontSize: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  inputArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
    color: '#fff',
  },
});

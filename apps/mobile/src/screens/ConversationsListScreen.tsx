import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, type Href } from 'expo-router';
import { useConversations } from '../api/queries/chat';
import { useSession } from '../auth/SessionContext';
import { EmptyState, ErrorView, LoadingView, ScreenContainer, colors, spacing, typography } from '../components';
import { extractErrorMessage } from '../components/ErrorView';

export function ConversationsListScreen({ basePath }: { basePath: string }) {
  const { user } = useSession();
  const { data, isLoading, isError, error, refetch } = useConversations();

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Stay connected with your bookings</Text>
      </View>

      {isLoading && <LoadingView />}
      {isError && <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />}
      {!isLoading && !isError && !data?.data.length && (
        <View style={styles.container}>
          <EmptyState message="No conversations yet." />
        </View>
      )}

      {!!data?.data.length && (
        <FlatList
          data={data.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const other = item.participant_one_id === user?.id ? item.participant_two : item.participant_one;
            const lastMessage = item.latest_message?.content ?? 'No messages yet';
            const timestamp = item.latest_message?.created_at
              ? new Date(item.latest_message.created_at).toLocaleDateString()
              : '';

            return (
              <Link href={`${basePath}/chat/${item.id}` as Href} asChild>
                <Pressable style={styles.conversationCard}>
                  {/* Avatar */}
                  {other?.avatar_url ? (
                    <Image
                      source={{ uri: other.avatar_url }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>
                        {other?.name?.charAt(0).toUpperCase() ?? '?'}
                      </Text>
                    </View>
                  )}

                  {/* Content */}
                  <View style={styles.content}>
                    <View style={styles.header}>
                      <Text style={styles.name} numberOfLines={1}>
                        {other?.name ?? 'Conversation'}
                      </Text>
                      <Text style={styles.timestamp}>{timestamp}</Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {lastMessage}
                    </Text>
                  </View>

                  {/* Unread Badge (if needed) */}
                  <View style={styles.unreadBadge} />
                </Pressable>
              </Link>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
  },
  lastMessage: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});

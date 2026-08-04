import { FlatList, Pressable, Text } from 'react-native';
import { Link, type Href } from 'expo-router';
import { useConversations } from '../api/queries/chat';
import { useSession } from '../auth/SessionContext';
import { Card, EmptyState, ErrorView, LoadingView, ScreenContainer, spacing, typography } from '../components';
import { extractErrorMessage } from '../components/ErrorView';

export function ConversationsListScreen({ basePath }: { basePath: string }) {
  const { user } = useSession();
  const { data, isLoading, isError, error, refetch } = useConversations();

  return (
    <ScreenContainer scroll={false}>
      <Text style={typography.title}>Chat</Text>

      {isLoading && <LoadingView />}
      {isError && <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />}
      {!isLoading && !isError && !data?.data.length && <EmptyState message="No conversations yet." />}

      {!!data?.data.length && (
        <FlatList
          data={data.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => {
            const other = item.participant_one_id === user?.id ? item.participant_two : item.participant_one;
            return (
              <Link href={`${basePath}/chat/${item.id}` as Href} asChild>
                <Pressable>
                  <Card>
                    <Text style={typography.subtitle}>{other?.name ?? 'Conversation'}</Text>
                    <Text style={typography.caption}>{item.messages_count ?? 0} messages</Text>
                  </Card>
                </Pressable>
              </Link>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

import { FlatList, Pressable, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { useMyRentals } from '../../src/api/queries/renter';
import { Button, Card, EmptyState, ErrorView, LoadingView, ScreenContainer, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function RenterListingsScreen() {
  const { data, isLoading, isError, error, refetch } = useMyRentals();

  return (
    <ScreenContainer scroll={false}>
      <Text style={typography.title}>My Listings</Text>

      <Button
        title="+ Add listing"
        variant="secondary"
        onPress={() => router.push('/(renter)/rentals/new')}
      />

      {isLoading && <LoadingView />}
      {isError && <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />}
      {!isLoading && !isError && !data?.data.length && <EmptyState message="You haven't listed anything yet." />}

      {!!data?.data.length && (
        <FlatList
          data={data.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Link href={`/(renter)/rentals/${item.id}`} asChild>
              <Pressable>
                <Card>
                  <Text style={typography.subtitle}>{item.title}</Text>
                  <Text style={typography.caption}>
                    {item.type} · {item.status}
                  </Text>
                  <Text style={typography.body}>₱{item.price_per_day} / day</Text>
                </Card>
              </Pressable>
            </Link>
          )}
        />
      )}
    </ScreenContainer>
  );
}

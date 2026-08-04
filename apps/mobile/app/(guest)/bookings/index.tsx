import { FlatList, Pressable, Text } from 'react-native';
import { Link } from 'expo-router';
import { useBookings } from '../../../src/api/queries/bookings';
import { Card, EmptyState, ErrorView, LoadingView, ScreenContainer, spacing, typography } from '../../../src/components';
import { StatusBadge } from '../../../src/components/RoleBadge';
import { extractErrorMessage } from '../../../src/components/ErrorView';
import type { Booking, Rental, User } from '../../../src/types/api';

function bookingTitle(booking: Booking): string {
  if (booking.bookable_type === 'App\\Models\\User') {
    return (booking.bookable as User | undefined)?.name ?? 'Tour guide';
  }
  return (booking.bookable as Rental | undefined)?.title ?? 'Rental';
}

export default function GuestBookingsScreen() {
  const { data, isLoading, isError, error, refetch } = useBookings();

  return (
    <ScreenContainer scroll={false}>
      <Text style={typography.title}>My Bookings</Text>

      {isLoading && <LoadingView />}
      {isError && <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />}
      {!isLoading && !isError && !data?.data.length && <EmptyState message="You haven't booked anything yet." />}

      {!!data?.data.length && (
        <FlatList
          data={data.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Link href={`/(guest)/bookings/${item.id}`} asChild>
              <Pressable>
                <Card style={{ gap: spacing.xs }}>
                  <Text style={typography.subtitle}>{bookingTitle(item)}</Text>
                  <Text style={typography.caption}>
                    {item.start_date.slice(0, 10)}
                    {item.end_date ? ` → ${item.end_date.slice(0, 10)}` : ''}
                  </Text>
                  <Text style={typography.body}>₱{item.total_price}</Text>
                  <StatusBadge status={item.status} />
                </Card>
              </Pressable>
            </Link>
          )}
        />
      )}
    </ScreenContainer>
  );
}

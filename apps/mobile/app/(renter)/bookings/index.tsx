import { FlatList, Text, View } from 'react-native';
import {
  useAcceptBooking,
  useBookings,
  useCompleteBooking,
  useDeclineBooking,
} from '../../../src/api/queries/bookings';
import {
  Button,
  Card,
  EmptyState,
  ErrorView,
  LoadingView,
  ScreenContainer,
  spacing,
  typography,
} from '../../../src/components';
import { StatusBadge } from '../../../src/components/RoleBadge';
import { extractErrorMessage } from '../../../src/components/ErrorView';
import type { Booking, Rental } from '../../../src/types/api';

export default function RenterBookingsScreen() {
  const { data, isLoading, isError, error, refetch } = useBookings();
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();
  const completeBooking = useCompleteBooking();
  const busy = acceptBooking.isPending || declineBooking.isPending || completeBooking.isPending;

  return (
    <ScreenContainer scroll={false}>
      <Text style={typography.title}>Rental Bookings</Text>

      {isLoading && <LoadingView />}
      {isError && <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />}
      {!isLoading && !isError && !data?.data.length && <EmptyState message="No bookings yet." />}

      {!!data?.data.length && (
        <FlatList
          data={data.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <BookingRow
              booking={item}
              busy={busy}
              onAccept={() => acceptBooking.mutate(item.id)}
              onDecline={() => declineBooking.mutate(item.id)}
              onComplete={() => completeBooking.mutate(item.id)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

function BookingRow({
  booking,
  onAccept,
  onDecline,
  onComplete,
  busy,
}: {
  booking: Booking;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
  busy: boolean;
}) {
  const rental = booking.bookable as Rental | undefined;

  return (
    <Card style={{ gap: spacing.xs }}>
      <Text style={typography.subtitle}>{rental?.title ?? 'Rental'}</Text>
      <Text style={typography.caption}>
        {booking.guest?.name} · {booking.start_date.slice(0, 10)}
        {booking.end_date ? ` → ${booking.end_date.slice(0, 10)}` : ''}
      </Text>
      <Text style={typography.body}>₱{booking.total_price}</Text>
      <StatusBadge status={booking.status} />

      {booking.status === 'pending' && (
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
          <View style={{ flex: 1 }}>
            <Button title="Accept" onPress={onAccept} disabled={busy} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Decline" variant="danger" onPress={onDecline} disabled={busy} />
          </View>
        </View>
      )}

      {booking.status === 'accepted' && (
        <View style={{ marginTop: spacing.xs }}>
          <Button title="Mark completed" onPress={onComplete} disabled={busy} />
        </View>
      )}
    </Card>
  );
}

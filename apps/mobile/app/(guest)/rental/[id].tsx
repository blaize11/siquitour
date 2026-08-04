import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRental } from '../../../src/api/queries/rentals';
import { useCreateBooking } from '../../../src/api/queries/bookings';
import { useStartConversation } from '../../../src/api/queries/chat';
import {
  Button,
  Card,
  DateField,
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  spacing,
  typography,
} from '../../../src/components';
import { extractErrorMessage } from '../../../src/components/ErrorView';

export default function RentalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rentalId = Number(id);
  const { data: rental, isLoading, isError, error, refetch } = useRental(rentalId);

  const startConversation = useStartConversation();
  const createBooking = useCreateBooking();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (isLoading) return <LoadingView />;
  if (isError || !rental) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const onBook = async () => {
    setBookingError(null);
    setBookingSuccess(false);
    if (!startDate) {
      setBookingError('Choose a start date.');
      return;
    }
    try {
      await createBooking.mutateAsync({
        bookable_type: 'rental',
        bookable_id: rentalId,
        start_date: startDate,
        end_date: endDate || undefined,
      });
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(extractErrorMessage(err, 'Unable to create the booking.'));
    }
  };

  const onMessage = async () => {
    if (!rental.renter) return;
    const conversation = await startConversation.mutateAsync(rental.renter.id);
    router.push(`/(guest)/chat/${conversation.id}`);
  };

  return (
    <ScreenContainer>
      <Text style={typography.title}>{rental.title}</Text>
      <Text style={typography.caption}>{rental.type} · listed by {rental.renter?.name}</Text>

      <Card>
        <Text style={typography.body}>{rental.description ?? 'No description provided.'}</Text>
        <Text style={[typography.subtitle, { marginTop: spacing.sm }]}>₱{rental.price_per_day} / day</Text>
        {rental.address && <Text style={typography.caption}>{rental.address}</Text>}
      </Card>

      <Button title="Message the renter" variant="secondary" loading={startConversation.isPending} onPress={onMessage} />

      <Card style={{ gap: spacing.sm }}>
        <Text style={typography.subtitle}>Book this rental</Text>
        <DateField label="Start date" value={startDate} onChange={setStartDate} minimumDate={new Date()} />
        <DateField
          label="End date (optional)"
          value={endDate}
          onChange={setEndDate}
          minimumDate={startDate ? new Date(`${startDate}T00:00:00`) : new Date()}
        />
        {bookingError && <Text style={{ color: colors.danger }}>{bookingError}</Text>}
        {bookingSuccess && (
          <Text style={{ color: colors.success }}>Booking request sent! Check "Bookings" for updates.</Text>
        )}
        <Button title="Request booking" onPress={onBook} loading={createBooking.isPending} />
      </Card>
    </ScreenContainer>
  );
}

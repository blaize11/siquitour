import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGuide, useGuideBookedDates } from '../../../src/api/queries/guides';
import { useCreateBooking } from '../../../src/api/queries/bookings';
import { useFollowUser, useUnfollowUser } from '../../../src/api/queries/social';
import { useStartConversation } from '../../../src/api/queries/chat';
import {
  Button,
  Calendar,
  Card,
  ErrorView,
  LoadingView,
  RatingStars,
  ScreenContainer,
  TextField,
  colors,
  spacing,
  typography,
} from '../../../src/components';
import { extractErrorMessage } from '../../../src/components/ErrorView';

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const guideId = Number(id);
  const { data: guide, isLoading, isError, error, refetch } = useGuide(guideId);
  const { data: bookedDatesData } = useGuideBookedDates(guideId);

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const startConversation = useStartConversation();
  const createBooking = useCreateBooking();

  const [paxCount, setPaxCount] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState<string | undefined>();
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (isLoading) return <LoadingView />;
  if (isError || !guide) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const profile = guide.tour_guide_profile;
  const reviews = guide.reviews_received ?? [];
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const onBook = async () => {
    setBookingError(null);
    setBookingSuccess(false);
    const pax = Number(paxCount);
    if (!pax || pax < 1) {
      setBookingError('Enter how many pax will join.');
      return;
    }
    if (!startDate) {
      setBookingError('Please select a tour date.');
      return;
    }
    try {
      await createBooking.mutateAsync({
        bookable_type: 'guide',
        bookable_id: guideId,
        pax_count: pax,
        start_date: startDate,
        end_date: endDate,
      });
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(extractErrorMessage(err, 'Unable to create the booking.'));
    }
  };

  const onMessage = async () => {
    const conversation = await startConversation.mutateAsync(guideId);
    router.push(`/(guest)/chat/${conversation.id}`);
  };

  return (
    <ScreenContainer>
      <View>
        <Text style={typography.title}>{guide.name}</Text>
        {averageRating > 0 && <RatingStars rating={Math.round(averageRating)} />}
      </View>

      <Card>
        <Text style={typography.body}>{profile?.bio ?? 'This guide has not added a bio yet.'}</Text>
        <Text style={[typography.caption, { marginTop: spacing.sm }]}>
          {profile?.years_experience ?? 0} years experience · ₱{profile?.rate_per_pax ?? '0.00'} per pax
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            title="Follow"
            variant="secondary"
            loading={followMutation.isPending}
            onPress={() => followMutation.mutate(guideId)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Message" variant="secondary" loading={startConversation.isPending} onPress={onMessage} />
        </View>
      </View>

      <Card style={{ gap: spacing.sm }}>
        <Text style={typography.subtitle}>Book this guide</Text>
        <TextField label="Number of pax" value={paxCount} onChangeText={setPaxCount} keyboardType="number-pad" />

        <View>
          <Text style={[typography.caption, { marginBottom: spacing.xs }]}>Tour dates</Text>
          <Calendar
            startDate={startDate}
            endDate={endDate}
            onSelectDateRange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            bookedDates={bookedDatesData?.booked_dates ?? []}
            minimumDate={new Date()}
          />
        </View>

        {bookingError && <Text style={{ color: colors.danger }}>{bookingError}</Text>}
        {bookingSuccess && (
          <Text style={{ color: colors.success }}>Booking request sent! Check "Bookings" for updates.</Text>
        )}
        <Button title="Request booking" onPress={onBook} loading={createBooking.isPending} />
      </Card>
    </ScreenContainer>
  );
}

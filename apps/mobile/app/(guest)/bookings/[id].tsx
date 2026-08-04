import { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useBooking, useCancelBooking, useCreateReview, usePayBooking } from '../../../src/api/queries/bookings';
import {
  Button,
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
import { StatusBadge } from '../../../src/components/RoleBadge';
import { extractErrorMessage } from '../../../src/components/ErrorView';
import type { Rental, User } from '../../../src/types/api';

export default function GuestBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);
  const { data: booking, isLoading, isError, error, refetch } = useBooking(bookingId);

  const cancelBooking = useCancelBooking();
  const createReview = useCreateReview();
  const payBooking = usePayBooking();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  if (isLoading) return <LoadingView />;
  if (isError || !booking) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const isGuideBooking = booking.bookable_type === 'App\\Models\\User';
  const title = isGuideBooking
    ? (booking.bookable as User | undefined)?.name ?? 'Tour guide'
    : (booking.bookable as Rental | undefined)?.title ?? 'Rental';

  const canCancel = booking.status === 'pending' || booking.status === 'accepted';
  const canReview = isGuideBooking && booking.status === 'completed' && !booking.review;
  const isPaid = booking.payment?.status === 'paid';
  const canPay = !isPaid && !['cancelled', 'declined'].includes(booking.status);

  const onCancel = async () => {
    setActionError(null);
    try {
      await cancelBooking.mutateAsync(booking.id);
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Unable to cancel this booking.'));
    }
  };

  const onPay = async () => {
    setActionError(null);
    setPaymentNotice(null);
    try {
      const { checkout_url } = await payBooking.mutateAsync(booking.id);
      const result = await WebBrowser.openAuthSessionAsync(checkout_url, 'siquitour://payment-return');
      if (result.type === 'success') {
        setPaymentNotice('Thanks! Confirming your payment can take a moment — pull to refresh if the status below doesn\'t update.');
      }
      await refetch();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Unable to start payment. Please try again later.'));
    }
  };

  const onReview = async () => {
    setActionError(null);
    try {
      await createReview.mutateAsync({ bookingId: booking.id, rating, comment: comment || undefined });
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Unable to submit your review.'));
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.title}>{title}</Text>
      <StatusBadge status={booking.status} />

      <Card style={{ gap: spacing.xs }}>
        {booking.pax_count != null && <Text style={typography.body}>Pax: {booking.pax_count}</Text>}
        <Text style={typography.body}>
          {booking.start_date.slice(0, 10)}
          {booking.end_date ? ` → ${booking.end_date.slice(0, 10)}` : ''}
        </Text>
        <Text style={typography.subtitle}>Total: ₱{booking.total_price}</Text>
        <Text style={typography.caption}>Platform commission: ₱{booking.commission_amount}</Text>
        <Text style={typography.caption}>
          Payment: {booking.payment ? booking.payment.status : 'not yet paid'}
        </Text>
      </Card>

      {actionError && <Text style={{ color: colors.danger }}>{actionError}</Text>}
      {paymentNotice && <Text style={typography.caption}>{paymentNotice}</Text>}

      {canPay && (
        <Button title="Pay now" onPress={onPay} loading={payBooking.isPending} />
      )}

      {canCancel && (
        <Button title="Cancel booking" variant="danger" loading={cancelBooking.isPending} onPress={onCancel} />
      )}

      {canReview && (
        <Card style={{ gap: spacing.sm }}>
          <Text style={typography.subtitle}>Rate your guide</Text>
          <RatingStars rating={rating} onChange={setRating} size={26} />
          <TextField label="Comment (optional)" value={comment} onChangeText={setComment} multiline />
          <Button title="Submit review" loading={createReview.isPending} onPress={onReview} />
        </Card>
      )}

      {booking.review && (
        <Card style={{ gap: spacing.xs }}>
          <Text style={typography.subtitle}>Your review</Text>
          <RatingStars rating={booking.review.rating} />
          {booking.review.comment && <Text style={typography.body}>{booking.review.comment}</Text>}
        </Card>
      )}
    </ScreenContainer>
  );
}

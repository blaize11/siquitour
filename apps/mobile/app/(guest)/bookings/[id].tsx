import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  const router = useRouter();
  const bookingId = id ? Number(id) : null;
  const { data: booking, isLoading, isError, error, refetch } = useBooking(bookingId || 0);

  const cancelBooking = useCancelBooking();
  const createReview = useCreateReview();
  const payBooking = usePayBooking();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'gcash' | 'cash' | 'maya' | null>(null);

  if (!bookingId) {
    return (
      <ErrorView
        message="Booking not found"
        onRetry={() => router.push('/(guest)/bookings')}
      />
    );
  }

  if (isLoading) return <LoadingView />;
  if (isError || !booking) {
    return (
      <ErrorView
        message={extractErrorMessage(error)}
        onRetry={() => {
          if (!booking) {
            router.push('/(guest)/bookings');
          } else {
            refetch();
          }
        }}
      />
    );
  }

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

  const onPayFullClick = () => {
    setShowPaymentMethodModal(true);
  };

  const onPayWithMethod = async (method: 'gcash' | 'cash' | 'maya') => {
    setActionError(null);
    setPaymentNotice(null);
    setShowPaymentMethodModal(false);
    setSelectedPaymentMethod(method);
    try {
      const { checkout_url } = await payBooking.mutateAsync(booking.id, { payment_type: 'full', payment_method: method });
      const result = await WebBrowser.openAuthSessionAsync(checkout_url, 'siquitour://payment-return');
      if (result.type === 'success') {
        setPaymentNotice('Thanks! Confirming your payment can take a moment — pull to refresh if the status below doesn\'t update.');
      }
      await refetch();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Unable to start payment. Please try again later.'));
    } finally {
      setSelectedPaymentMethod(null);
    }
  };

  const onPay = async (paymentType: 'advance') => {
    setActionError(null);
    setPaymentNotice(null);
    try {
      const { checkout_url } = await payBooking.mutateAsync(booking.id, { payment_type: paymentType });
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
        <View style={{ gap: spacing.md }}>
          <Button title="Pay full" onPress={onPayFullClick} loading={payBooking.isPending} />
          <Button title="Pay advance booking" onPress={() => onPay('advance')} loading={payBooking.isPending} variant="secondary" />
        </View>
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

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentMethodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[typography.title, { marginBottom: spacing.lg }]}>Select Payment Method</Text>

            <Pressable
              style={styles.paymentMethodButton}
              onPress={() => onPayWithMethod('gcash')}
              disabled={payBooking.isPending}
            >
              <Text style={styles.paymentMethodIcon}>💳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentMethodTitle}>GCash</Text>
                <Text style={styles.paymentMethodSubtitle}>Pay with GCash</Text>
              </View>
              {selectedPaymentMethod === 'gcash' && payBooking.isPending && (
                <Text style={styles.loadingText}>Loading...</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.paymentMethodButton}
              onPress={() => onPayWithMethod('maya')}
              disabled={payBooking.isPending}
            >
              <Text style={styles.paymentMethodIcon}>💰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentMethodTitle}>Maya</Text>
                <Text style={styles.paymentMethodSubtitle}>Pay with Maya</Text>
              </View>
              {selectedPaymentMethod === 'maya' && payBooking.isPending && (
                <Text style={styles.loadingText}>Loading...</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.paymentMethodButton}
              onPress={() => onPayWithMethod('cash')}
              disabled={payBooking.isPending}
            >
              <Text style={styles.paymentMethodIcon}>💵</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentMethodTitle}>Cash</Text>
                <Text style={styles.paymentMethodSubtitle}>Pay with Cash on Delivery</Text>
              </View>
              {selectedPaymentMethod === 'cash' && payBooking.isPending && (
                <Text style={styles.loadingText}>Loading...</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.paymentMethodButton, styles.closeButton]}
              onPress={() => setShowPaymentMethodModal(false)}
              disabled={payBooking.isPending}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentMethodIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  loadingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  closeButtonText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

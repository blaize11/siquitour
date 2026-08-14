import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useBooking, useReplyToReview } from '../../../src/api/queries/bookings';
import {
  Button,
  Card,
  ErrorView,
  LoadingView,
  RatingStars,
  ScreenContainer,
  colors,
  spacing,
  typography,
} from '../../../src/components';
import { StatusBadge } from '../../../src/components/RoleBadge';
import { extractErrorMessage } from '../../../src/components/ErrorView';
import type { User } from '../../../src/types/api';

export default function GuideBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);
  const { data: booking, isLoading, isError, error, refetch } = useBooking(bookingId);
  const replyToReview = useReplyToReview();

  const [replyingToReviewId, setReplyingToReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  if (isLoading) return <LoadingView />;
  if (isError || !booking) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const isGuideBooking = booking.bookable_type === 'App\\Models\\User';
  const guest = booking.guest as User | undefined;
  const reviews = booking.review ? [booking.review] : [];

  // Calculate average rating (in this case just the single review's rating)
  const averageRating = reviews.length > 0 ? reviews[0].rating : 0;

  const onReply = async (reviewId: number) => {
    setReplyError(null);
    if (!replyText.trim()) {
      setReplyError('Please enter a reply');
      return;
    }
    try {
      await replyToReview.mutateAsync({
        reviewId,
        reply: replyText,
      });
      setReplyText('');
      setReplyingToReviewId(null);
      await refetch();
    } catch (err) {
      setReplyError(extractErrorMessage(err, 'Unable to submit reply.'));
    }
  };

  return (
    <ScreenContainer scroll={true}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Tour Details</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Guest Info */}
      {guest && (
        <Card style={{ gap: spacing.md }}>
          <View style={styles.guestHeader}>
            <View>
              <Text style={typography.subtitle}>{guest.name}</Text>
              <Text style={typography.caption}>{guest.email}</Text>
            </View>
          </View>
          <StatusBadge status={booking.status} />
        </Card>
      )}

      {/* Booking Details */}
      <Card style={{ gap: spacing.xs }}>
        <Text style={typography.body}>
          📅 {booking.start_date.slice(0, 10)}
          {booking.end_date ? ` → ${booking.end_date.slice(0, 10)}` : ''}
        </Text>
        {booking.pax_count && (
          <Text style={typography.body}>👥 {booking.pax_count} Guests</Text>
        )}
        <Text style={typography.subtitle}>Total: ₱{booking.total_price}</Text>
      </Card>

      {/* Reviews Section */}
      {reviews.length > 0 ? (
        <View>
          <Text style={[typography.title, { marginBottom: spacing.md }]}>Guest Review</Text>

          {reviews.map((review) => (
            <Card key={review.id} style={{ gap: spacing.md }}>
              {/* Rating with Stars */}
              <View style={styles.ratingContainer}>
                <View>
                  <Text style={typography.subtitle}>Rating</Text>
                  <View style={styles.starsContainer}>
                    <RatingStars rating={averageRating} size={24} />
                    <Text style={styles.ratingText}>{averageRating}.0 / 5.0</Text>
                  </View>
                </View>
              </View>

              {/* Review Content */}
              <View style={styles.reviewContent}>
                <Text style={typography.body}>{review.comment}</Text>
                <Text style={typography.caption}>
                  {new Date(review.created_at).toLocaleDateString()}
                </Text>
              </View>

              {/* Reply Section */}
              {review.reply ? (
                <View style={styles.replyContainer}>
                  <Text style={[typography.subtitle, { marginBottom: spacing.sm }]}>Your Reply</Text>
                  <View style={styles.replyBox}>
                    <Text style={typography.body}>{review.reply}</Text>
                  </View>
                </View>
              ) : replyingToReviewId === review.id ? (
                <View style={styles.replyInputContainer}>
                  {replyError && (
                    <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.sm }]}>
                      {replyError}
                    </Text>
                  )}
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write your reply..."
                    placeholderTextColor={colors.textMuted}
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={styles.replyActions}>
                    <Pressable
                      style={[styles.button, styles.sendButton]}
                      onPress={() => onReply(review.id)}
                      disabled={replyToReview.isPending}
                    >
                      <Text style={styles.sendButtonText}>
                        {replyToReview.isPending ? 'Sending...' : 'Send Reply'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        setReplyingToReviewId(null);
                        setReplyText('');
                        setReplyError(null);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={[styles.button, styles.replyButton]}
                  onPress={() => setReplyingToReviewId(review.id)}
                >
                  <Text style={styles.replyButtonText}>💬 Reply to Review</Text>
                </Pressable>
              )}
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.noReviewsContainer}>
          <Text style={styles.noReviewsIcon}>📝</Text>
          <Text style={[typography.body, { textAlign: 'center' }]}>
            No review from guest yet
          </Text>
        </View>
      )}

      <View style={{ height: spacing.lg }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  reviewContent: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
  },
  replyContainer: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: spacing.md,
  },
  replyBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  replyInputContainer: {
    gap: spacing.md,
  },
  replyInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
  },
  replyActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyButton: {
    backgroundColor: colors.primary,
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: colors.primary,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  noReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  noReviewsIcon: {
    fontSize: 48,
  },
});

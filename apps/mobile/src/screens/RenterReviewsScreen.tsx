import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRenterReviews, useReplyToRentalReview } from '../api/queries/reviews';
import {
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  spacing,
} from '../components';
import { extractErrorMessage } from '../components/ErrorView';

export default function RenterReviewsScreen() {
  const { data, isLoading, isError, error: errorMsg, refetch } = useRenterReviews();
  const replyMutation = useReplyToRentalReview();
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<Record<number, string>>({});

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} onRetry={refetch} />;

  const reviews = data?.data || [];
  const averageRating = data?.average_rating || 0;

  const handleReply = (reviewId: number) => {
    const reply = replyText[reviewId]?.trim();
    if (!reply) return;

    replyMutation.mutate(
      { reviewId, reply },
      {
        onSuccess: () => {
          setReplyText({ ...replyText, [reviewId]: '' });
          setExpandedReviewId(null);
          refetch();
        },
      }
    );
  };

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rental Reviews</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average Rating</Text>
            <Text style={styles.statValue}>
              ⭐ {averageRating.toFixed(1)} ({reviews.length})
            </Text>
          </View>
        </View>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubtext}>Reviews from guests will appear here</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              {/* Review Header */}
              <View style={styles.reviewHeader}>
                <View style={styles.guestInfo}>
                  <Text style={styles.guestName}>{review.guest?.name || 'Guest'}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.rating}>
                  {'⭐'.repeat(review.rating)}
                  {' '.repeat(5 - review.rating)}
                </Text>
              </View>

              {/* Guest Comment */}
              {review.comment && (
                <View style={styles.commentSection}>
                  <Text style={styles.commentLabel}>Guest's Review:</Text>
                  <Text style={styles.commentText}>{review.comment}</Text>
                </View>
              )}

              {/* Renter Reply */}
              {review.renter_reply ? (
                <View style={styles.replySection}>
                  <Text style={styles.replyLabel}>Your Reply:</Text>
                  <Text style={styles.replyText}>{review.renter_reply}</Text>
                  <Text style={styles.replyDate}>
                    Replied on{' '}
                    {new Date(review.renter_replied_at!).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={() =>
                      setExpandedReviewId(expandedReviewId === review.id ? null : review.id)
                    }
                    style={styles.replyButton}
                  >
                    <Text style={styles.replyButtonText}>
                      {expandedReviewId === review.id ? '✕ Cancel' : '✏️ Reply'}
                    </Text>
                  </Pressable>

                  {expandedReviewId === review.id && (
                    <View style={styles.replyForm}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder="Write your reply..."
                        multiline
                        numberOfLines={3}
                        maxLength={2000}
                        value={replyText[review.id] || ''}
                        onChangeText={(text) =>
                          setReplyText({ ...replyText, [review.id]: text })
                        }
                      />
                      <View style={styles.formActions}>
                        <Text style={styles.charCount}>
                          {(replyText[review.id] || '').length}/2000
                        </Text>
                        <Pressable
                          style={[
                            styles.submitButton,
                            replyMutation.isPending && styles.submitButtonDisabled,
                          ]}
                          onPress={() => handleReply(review.id)}
                          disabled={replyMutation.isPending || !replyText[review.id]?.trim()}
                        >
                          <Text style={styles.submitButtonText}>
                            {replyMutation.isPending ? '⏳ Sending...' : 'Send Reply'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          ))}
          <View style={{ height: spacing.lg }} />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    margin: spacing.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentSection: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  replySection: {
    gap: spacing.sm,
    backgroundColor: 'rgba(14, 124, 123, 0.05)',
    padding: spacing.md,
    borderRadius: 8,
  },
  replyLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  replyText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  replyDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  replyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  replyForm: {
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(14, 124, 123, 0.05)',
    borderRadius: 8,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

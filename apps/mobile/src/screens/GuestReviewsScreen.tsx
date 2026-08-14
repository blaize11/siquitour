import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGuestReviews } from '../api/queries/reviews';
import {
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  spacing,
} from '../components';
import { extractErrorMessage } from '../components/ErrorView';

export default function GuestReviewsScreen() {
  const { data, isLoading, isError, error: errorMsg, refetch } = useGuestReviews();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} onRetry={refetch} />;

  const reviews = data?.data || [];

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <Text style={styles.headerSubtitle}>Reviews you've posted on tours and rentals</Text>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubtext}>Your reviews will appear here</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              {/* Review Header */}
              <View style={styles.reviewHeader}>
                <View style={styles.guideInfo}>
                  <Text style={styles.guideName}>
                    {review.tour_guide?.name || review.renter?.name || 'Provider'}
                  </Text>
                  <Text style={styles.reviewType}>
                    {review.tour_guide_id ? '🏔️ Tour Guide' : '🏠 Rental'}
                  </Text>
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

              {/* Your Comment */}
              {review.comment && (
                <View style={styles.commentSection}>
                  <Text style={styles.commentLabel}>Your Review:</Text>
                  <Text style={styles.commentText}>{review.comment}</Text>
                </View>
              )}

              {/* Tour Guide Reply */}
              {review.guide_reply && (
                <View style={styles.replySection}>
                  <Text style={styles.replyLabel}>💬 Tour Guide's Reply:</Text>
                  <Text style={styles.replyText}>{review.guide_reply}</Text>
                  <Text style={styles.replyDate}>
                    Replied on{' '}
                    {new Date(review.replied_at!).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              )}

              {/* Renter Reply */}
              {review.renter_reply && (
                <View style={styles.replySection}>
                  <Text style={styles.replyLabel}>💬 Renter's Reply:</Text>
                  <Text style={styles.replyText}>{review.renter_reply}</Text>
                  <Text style={styles.replyDate}>
                    Replied on{' '}
                    {new Date(review.renter_replied_at!).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              )}

              {/* No Reply Yet */}
              {!review.guide_reply && !review.renter_reply && (
                <View style={styles.noReplySection}>
                  <Text style={styles.noReplyText}>Waiting for a reply...</Text>
                </View>
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
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  reviewType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
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
  noReplySection: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(100, 100, 100, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  noReplyText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});

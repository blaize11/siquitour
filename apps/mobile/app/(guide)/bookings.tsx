import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  useAcceptBooking,
  useBookings,
  useCompleteBooking,
  useDeclineBooking,
  useReplyToReview,
} from '../../src/api/queries/bookings';
import {
  ErrorView,
  LoadingView,
  RatingStars,
  ScreenContainer,
  colors,
  spacing,
  typography,
} from '../../src/components';
import { StatusBadge } from '../../src/components/RoleBadge';
import { extractErrorMessage } from '../../src/components/ErrorView';

type BookingStatus = 'all' | 'pending' | 'accepted' | 'completed' | 'declined';

export default function GuideBookingsScreen() {
  const [activeStatus, setActiveStatus] = useState<BookingStatus>('all');
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const [replyingToReviewId, setReplyingToReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  const { data: bookingData, isLoading, isError, error: errorMsg, refetch } = useBookings();
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();
  const completeBooking = useCompleteBooking();
  const replyToReview = useReplyToReview();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} onRetry={refetch} />;

  const bookings = bookingData?.data || [];

  // Separate bookings and requests
  const myBookings = bookings.filter((b: any) => b.status !== 'pending');
  const bookingRequests = bookings.filter((b: any) => b.status === 'pending');

  // Group bookings by date
  const groupedBookings = filteredBookings.reduce((acc: any, booking: any) => {
    const date = new Date(booking.start_date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

  const bookingStatuses = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'pending', label: 'Pending', count: bookings.filter((b: any) => b.status === 'pending').length },
    { key: 'accepted', label: 'Accepted', count: bookings.filter((b: any) => b.status === 'accepted').length },
    { key: 'completed', label: 'Completed', count: bookings.filter((b: any) => b.status === 'completed').length },
    { key: 'declined', label: 'Declined', count: bookings.filter((b: any) => b.status === 'declined').length },
  ];

  const handleAccept = (bookingId: string) => {
    acceptBooking.mutate(bookingId);
  };

  const handleDecline = (bookingId: string) => {
    declineBooking.mutate(bookingId);
  };

  const handleComplete = (bookingId: string) => {
    completeBooking.mutate(bookingId);
  };

  const handleReply = async (reviewId: number) => {
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

  const busy = acceptBooking.isPending || declineBooking.isPending || completeBooking.isPending;
  const isExpanded = (bookingId: number) => expandedBookingId === bookingId;
  const toggleExpand = (bookingId: number) => {
    setExpandedBookingId(isExpanded(bookingId) ? null : bookingId);
  };

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Bookings</Text>
        <Text style={styles.headerSubtitle}>Manage tours and requests</Text>
      </View>

      {/* Bookings List - Scrollable with Both Sections */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.bookingsList}>
        {/* BOOKING REQUESTS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📩 Booking Requests ({bookingRequests.length})</Text>
          </View>
          {bookingRequests.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No pending requests</Text>
            </View>
          ) : (
            bookingRequests.map((booking: any) => (
              <BookingDetailCard
                key={booking.id}
                booking={booking}
                isExpanded={isExpanded(booking.id)}
                onToggleExpand={() => toggleExpand(booking.id)}
                onAccept={() => handleAccept(String(booking.id))}
                onDecline={() => handleDecline(String(booking.id))}
                onComplete={() => handleComplete(String(booking.id))}
                onReply={() => handleReply(booking.review?.id)}
                onReplyingChange={(replyingId) => setReplyingToReviewId(replyingId)}
                replyingToReviewId={replyingToReviewId}
                replyText={replyText}
                onReplyTextChange={setReplyText}
                replyError={replyError}
                busy={busy}
                replyLoading={replyToReview.isPending}
              />
            ))
          )}
        </View>

        {/* MY BOOKINGS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 My Bookings ({myBookings.length})</Text>
          </View>
          {myBookings.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No confirmed bookings</Text>
            </View>
          ) : (
            myBookings.map((booking: any) => (
              <BookingDetailCard
                key={booking.id}
                booking={booking}
                isExpanded={isExpanded(booking.id)}
                onToggleExpand={() => toggleExpand(booking.id)}
                onAccept={() => handleAccept(String(booking.id))}
                onDecline={() => handleDecline(String(booking.id))}
                onComplete={() => handleComplete(String(booking.id))}
                onReply={() => handleReply(booking.review?.id)}
                onReplyingChange={(replyingId) => setReplyingToReviewId(replyingId)}
                replyingToReviewId={replyingToReviewId}
                replyText={replyText}
                onReplyTextChange={setReplyText}
                replyError={replyError}
                busy={busy}
                replyLoading={replyToReview.isPending}
              />
            ))
          )}
        </View>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
  );
}

interface BookingDetailCardProps {
  booking: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
  onReply: () => void;
  onReplyingChange: (id: number | null) => void;
  replyingToReviewId: number | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  replyError: string | null;
  busy: boolean;
  replyLoading: boolean;
}

function BookingDetailCard({
  booking,
  isExpanded,
  onToggleExpand,
  onAccept,
  onDecline,
  onComplete,
  onReply,
  onReplyingChange,
  replyingToReviewId,
  replyText,
  onReplyTextChange,
  replyError,
  busy,
  replyLoading,
}: BookingDetailCardProps) {
  const startTime = new Date(booking.start_date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const endTime = booking.end_date
    ? new Date(booking.end_date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const guest = booking.guest;
  const review = booking.review;

  return (
    <Pressable onPress={onToggleExpand} style={styles.bookingCard}>
      {/* Collapsed View - Always Visible */}
      <View style={styles.bookingTop}>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{guest?.name || 'Guest'}</Text>
          <Text style={styles.guestEmail}>{guest?.email}</Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      {/* Quick Tour Details */}
      <View style={styles.tourDetails}>
        <DetailRow icon="🗺️" label="Tour" value={booking.tour_name || 'Tour'} />
        <DetailRow icon="⏰" label="Time" value={`${startTime}${endTime ? ` - ${endTime}` : ''}`} />
        <DetailRow icon="👥" label="Guests" value={`${booking.pax_count} Pax`} />
      </View>

      {/* Expand/Collapse Indicator */}
      <Text style={styles.expandIndicator}>
        {isExpanded ? '▲ Collapse' : '▼ Tap to expand'}
      </Text>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          {/* Additional Details */}
          {booking.notes && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionLabel}>💬 Guest Notes</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}

          {/* Guest Information */}
          {guest && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionLabel}>👤 Guest Information</Text>
              <DetailRow icon="📧" label="Email" value={guest.email} />
              {guest.phone && <DetailRow icon="📞" label="Phone" value={guest.phone} />}
              <DetailRow icon="👤" label="Role" value={guest.role || 'Tourist'} />
            </View>
          )}

          {/* Booking Summary */}
          <View style={styles.expandedSection}>
            <Text style={styles.sectionLabel}>💰 Booking Summary</Text>
            <DetailRow
              icon="📅"
              label="Date"
              value={new Date(booking.start_date).toLocaleDateString()}
            />
            {booking.end_date && (
              <DetailRow
                icon="🏁"
                label="End Date"
                value={new Date(booking.end_date).toLocaleDateString()}
              />
            )}
            <DetailRow icon="👥" label="Pax" value={String(booking.pax_count)} />
            {booking.total_price && (
              <DetailRow
                icon="💵"
                label="Total Price"
                value={`₱${parseFloat(booking.total_price).toLocaleString()}`}
              />
            )}
          </View>

          {/* Reviews Section */}
          {review ? (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionLabel}>⭐ Guest Review</Text>

              {/* Rating */}
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  <RatingStars rating={review.rating} size={20} />
                  <Text style={styles.ratingText}>{review.rating}.0 / 5.0</Text>
                </View>
              </View>

              {/* Review Comment */}
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.created_at).toLocaleDateString()}
              </Text>

              {/* Reply Section */}
              {review.reply ? (
                <View style={styles.replyBox}>
                  <Text style={styles.replyLabel}>Your Reply</Text>
                  <Text style={styles.replyText}>{review.reply}</Text>
                </View>
              ) : replyingToReviewId === review.id ? (
                <View style={styles.replyInputContainer}>
                  {replyError && (
                    <Text style={styles.replyErrorText}>{replyError}</Text>
                  )}
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write your reply..."
                    placeholderTextColor={colors.textMuted}
                    value={replyText}
                    onChangeText={onReplyTextChange}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={styles.replyActions}>
                    <Pressable
                      style={[styles.button, styles.sendButton]}
                      onPress={onReply}
                      disabled={replyLoading}
                    >
                      <Text style={styles.sendButtonText}>
                        {replyLoading ? 'Sending...' : 'Send Reply'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        onReplyingChange(null);
                        onReplyTextChange('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={[styles.button, styles.replyButton]}
                  onPress={() => onReplyingChange(review.id)}
                >
                  <Text style={styles.replyButtonText}>💬 Reply to Review</Text>
                </Pressable>
              )}
            </View>
          ) : booking.status === 'completed' ? (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionLabel}>⭐ Review</Text>
              <Text style={styles.noReviewText}>Waiting for guest review...</Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {booking.status === 'pending' && (
              <>
                <Pressable
                  style={[styles.actionButton, styles.acceptActionButton]}
                  onPress={onAccept}
                  disabled={busy}
                >
                  <Text style={styles.acceptActionText}>✓ Accept</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.declineActionButton]}
                  onPress={onDecline}
                  disabled={busy}
                >
                  <Text style={styles.declineActionText}>✕ Decline</Text>
                </Pressable>
              </>
            )}

            {booking.status === 'accepted' && (
              <Pressable
                style={[styles.actionButton, styles.completeActionButton]}
                onPress={onComplete}
                disabled={busy}
              >
                <Text style={styles.completeActionText}>✓ Mark Complete</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  bookingsList: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionHeader: {
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  emptySection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },

  emptySectionText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },

  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },

  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
  guestEmail: {
    fontSize: 12,
    color: colors.textMuted,
  },

  tourDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  expandIndicator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },

  expandedSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },

  notesText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  detailIcon: {
    fontSize: 16,
    marginTop: 2,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },

  ratingContainer: {
    marginBottom: spacing.md,
  },

  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  reviewComment: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },

  reviewDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  replyBox: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },

  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },

  replyText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },

  replyInputContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },

  replyInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
  },

  replyErrorText: {
    fontSize: 12,
    color: colors.danger,
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

  replyButton: {
    backgroundColor: colors.primary,
  },

  replyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  noReviewText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  actionButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptActionButton: {
    backgroundColor: colors.success,
  },

  acceptActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  declineActionButton: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: colors.danger,
  },

  declineActionText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13,
  },

  completeActionButton: {
    backgroundColor: colors.primary,
  },

  completeActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

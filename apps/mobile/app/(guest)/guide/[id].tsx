import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGuide, useGuideBookedDates } from '../../../src/api/queries/guides';
import { useCreateBooking } from '../../../src/api/queries/bookings';
import { useFollowUser, useUnfollowUser } from '../../../src/api/queries/social';
import { useStartConversation } from '../../../src/api/queries/chat';
import {
  Button,
  Calendar,
  ErrorView,
  LoadingView,
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
  const [isFavorite, setIsFavorite] = useState(false);

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
    <View style={styles.container}>
      {/* Header with Back Button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {guide.avatar_url ? (
            <Image source={{ uri: guide.avatar_url }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.placeholderText}>👤</Text>
            </View>
          )}

          {/* Favorite Button */}
          <Pressable
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.favoriteButton}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </Pressable>

          {/* Verified Badge */}
          {profile?.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{guide.name}</Text>
              {profile?.municipality && (
                <Text style={styles.location}>📍 {profile.municipality}</Text>
              )}
            </View>
          </View>

          {/* Rating */}
          {averageRating > 0 && (
            <View style={styles.ratingContainer}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.rating}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
            </View>
          )}

          {/* Quick Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={[styles.actionButton, styles.chatButton]} onPress={onMessage}>
              <Text style={styles.actionButtonIcon}>💬</Text>
              <Text style={styles.actionButtonText}>Chat</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.followButton]}
              onPress={() => followMutation.mutate(guideId)}
            >
              <Text style={styles.actionButtonIcon}>👤</Text>
              <Text style={styles.actionButtonText}>Follow</Text>
            </Pressable>
          </View>
        </View>

        {/* About Section */}
        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionContent}>{profile.bio}</Text>
          </View>
        )}

        {/* Details */}
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Experience</Text>
            <Text style={styles.detailValue}>{profile?.years_experience || 0} years</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowBorder]}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>₱{profile?.rate_per_pax || '0'} / pax</Text>
          </View>
          {profile?.languages && profile.languages.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Languages</Text>
              <Text style={styles.detailValue}>{profile.languages.join(', ')}</Text>
            </View>
          )}
        </View>

        {/* Booking Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book a Tour</Text>

          {bookingError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{bookingError}</Text>
            </View>
          )}

          {bookingSuccess && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ Booking created successfully!</Text>
            </View>
          )}

          <View style={styles.bookingForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Number of Pax</Text>
              <TextField
                value={paxCount}
                onChangeText={setPaxCount}
                placeholder="Enter number of people"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tour Date</Text>
              <Calendar
                selectedDate={startDate}
                onSelectDate={setStartDate}
                unavailableDates={bookedDatesData?.booked_dates || []}
              />
            </View>

            <Pressable
              style={styles.bookButton}
              onPress={onBook}
              disabled={createBooking.isPending}
            >
              <Text style={styles.bookButtonText}>
                {createBooking.isPending ? 'Booking...' : 'Book Now'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={styles.reviewCount}>({reviews.length})</Text>
            </View>

            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewerName}>{review.reviewer?.name || 'Anonymous'}</Text>
                    <View style={styles.reviewRating}>
                      <Text style={styles.reviewStars}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    zIndex: 10,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
    backgroundColor: colors.surface,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    fontSize: 80,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  location: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  starIcon: {
    fontSize: 18,
    color: '#FFB800',
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  chatButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  followButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  sectionContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  bookingForm: {
    gap: spacing.md,
  },
  formGroup: {
    gap: spacing.sm,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  errorBox: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  successBox: {
    backgroundColor: '#E5F5E5',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  reviewStars: {
    fontSize: 14,
    color: '#FFB800',
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  success: {
    color: colors.success,
  },
});

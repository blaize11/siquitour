import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRental, useRentalBookedDates } from '../../../src/api/queries/rentals';
import { useCreateBooking } from '../../../src/api/queries/bookings';
import { useStartConversation } from '../../../src/api/queries/chat';
import {
  Calendar,
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
  const { data: bookedDatesData } = useRentalBookedDates(rentalId);

  const startConversation = useStartConversation();
  const createBooking = useCreateBooking();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState<string | undefined>();
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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

  const reviews = rental.reviews_received ?? [];
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rental Image */}
        <View style={styles.imageContainer}>
          {rental.image_url ? (
            <Image source={{ uri: rental.image_url }} style={styles.rentalImage} />
          ) : (
            <View style={[styles.rentalImage, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>🏍️</Text>
            </View>
          )}

          {/* Favorite Button */}
          <Pressable
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.favoriteButton}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </Pressable>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View>
            <Text style={styles.title}>{rental.title}</Text>
            <Text style={styles.type}>{rental.type}</Text>
          </View>

          {/* Rating */}
          {averageRating > 0 && (
            <View style={styles.ratingContainer}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.rating}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({reviews.length})</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₱{rental.price_per_day.toLocaleString()}</Text>
            <Text style={styles.priceLabel}>/ day</Text>
          </View>
        </View>

        {/* Owner Info */}
        {rental.renter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rental Provider</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                {rental.renter.profile_image_url ? (
                  <Image
                    source={{ uri: rental.renter.profile_image_url }}
                    style={styles.ownerAvatar}
                  />
                ) : (
                  <View style={[styles.ownerAvatar, styles.ownerAvatarPlaceholder]}>
                    <Text style={styles.ownerAvatarText}>👤</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.ownerName}>{rental.renter.name}</Text>
                  <Text style={styles.ownerDetails}>Rental Provider</Text>
                </View>
              </View>
              <Pressable
                style={styles.messageButton}
                onPress={onMessage}
                disabled={startConversation.isPending}
              >
                <Text style={styles.messageButtonText}>💬 Chat</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Description */}
        {rental.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{rental.description}</Text>
          </View>
        )}

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsList}>
            {rental.transmission && (
              <SpecRow label="Transmission" value={rental.transmission} />
            )}
            {rental.engine_size && (
              <SpecRow label="Engine Size" value={rental.engine_size} />
            )}
            {rental.address && (
              <SpecRow label="Location" value={rental.address} />
            )}
            <SpecRow label="Type" value={rental.type} />
          </View>
        </View>

        {/* Booking Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book This Rental</Text>

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

          <Calendar
            selectedDate={startDate}
            onSelectDate={setStartDate}
            unavailableDates={bookedDatesData?.booked_dates || []}
          />

          <Pressable
            style={styles.bookButton}
            onPress={onBook}
            disabled={createBooking.isPending}
          >
            <Text style={styles.bookButtonText}>
              {createBooking.isPending ? 'Booking...' : `Book for ₱${rental.price_per_day.toLocaleString()}/day`}
            </Text>
          </Pressable>
        </View>

        {/* Reviews */}
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

interface SpecRowProps {
  label: string;
  value: string;
}

function SpecRow({ label, value }: SpecRowProps) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
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
    height: 260,
    backgroundColor: colors.surface,
  },
  rentalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    fontSize: 70,
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
  infoSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  type: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textMuted,
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
  ownerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  ownerAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  ownerAvatarText: {
    fontSize: 24,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  ownerDetails: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  messageButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  specsList: {
    gap: 0,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  specValue: {
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
    marginTop: spacing.lg,
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
});

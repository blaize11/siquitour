import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRental } from '../../../src/api/queries/rentals';
import {
  ErrorView,
  LoadingView,
  colors,
  spacing,
} from '../../../src/components';
import { extractErrorMessage } from '../../../src/components/ErrorView';

export default function RentalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rentalId = Number(id);
  const { data: rental, isLoading, isError, error, refetch } = useRental(rentalId);

  if (isLoading) return <LoadingView />;
  if (isError || !rental) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const reviews = rental.reviews_received ?? [];
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <ScrollView style={styles.scrollView}>
        {/* Rental Image */}
        <View style={styles.imageContainer}>
          {rental.primary_image_url ? (
            <Image
              source={{ uri: rental.primary_image_url }}
              style={styles.image}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>🏠</Text>
            </View>
          )}
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.title}>{rental.title}</Text>
          <Text style={styles.type}>{rental.type}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>({reviews.length} reviews)</Text>
          </View>
        </View>

        {/* Price */}
        {rental.price_per_day && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price</Text>
            <Text style={styles.priceText}>
              ₱{rental.price_per_day.toLocaleString()} per day
            </Text>
          </View>
        )}

        {/* Description */}
        {rental.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{rental.description}</Text>
          </View>
        )}

        {/* Address */}
        {rental.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.addressText}>📍 {rental.address}</Text>
          </View>
        )}

        {/* Features */}
        {rental.bedrooms !== null || rental.bathrooms !== null || rental.guests !== null ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              {rental.bedrooms !== null && (
                <View style={styles.featureItem}>
                  <Text style={styles.featureLabel}>Bedrooms</Text>
                  <Text style={styles.featureValue}>{rental.bedrooms}</Text>
                </View>
              )}
              {rental.bathrooms !== null && (
                <View style={styles.featureItem}>
                  <Text style={styles.featureLabel}>Bathrooms</Text>
                  <Text style={styles.featureValue}>{rental.bathrooms}</Text>
                </View>
              )}
              {rental.guests !== null && (
                <View style={styles.featureItem}>
                  <Text style={styles.featureLabel}>Max Guests</Text>
                  <Text style={styles.featureValue}>{rental.guests}</Text>
                </View>
              )}
            </View>
          </View>
        ) : null}

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                  <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                </View>
                <Text style={styles.reviewText}>{review.review_text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Read-Only Notice */}
        <View style={[styles.section, styles.readOnlyNotice]}>
          <Text style={styles.readOnlyText}>📖 Read-only view</Text>
          <Text style={styles.readOnlySubText}>
            Only guest users can book rentals
          </Text>
        </View>

        <View style={{ height: spacing.xl }} />
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
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  type: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  reviewCountText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  featureValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reviewRating: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  reviewText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  readOnlyNotice: {
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  readOnlyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  readOnlySubText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

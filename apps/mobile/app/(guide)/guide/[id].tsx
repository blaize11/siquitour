import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGuide } from '../../../src/api/queries/guides';
import {
  ErrorView,
  LoadingView,
  colors,
  spacing,
  typography,
} from '../../../src/components';
import { extractErrorMessage } from '../../../src/components/ErrorView';

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const guideId = Number(id);
  const { data: guide, isLoading, isError, error, refetch } = useGuide(guideId);

  if (isLoading) return <LoadingView />;
  if (isError || !guide) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const profile = guide.tour_guide_profile;
  const reviews = guide.reviews_received ?? [];
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <ScrollView style={styles.scrollView}>
        {/* Guide Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: guide.profile_photo_url || 'https://via.placeholder.com/300',
            }}
            style={styles.image}
          />
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.name}>{guide.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>({reviews.length} reviews)</Text>
          </View>
        </View>

        {/* Bio */}
        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Experience */}
        {profile?.years_experience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <Text style={styles.experienceText}>
              {profile.years_experience} years of experience
            </Text>
          </View>
        )}

        {/* Rate */}
        {profile?.rate_per_pax && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rate</Text>
            <Text style={styles.rateText}>
              ₱{profile.rate_per_pax.toLocaleString()} per person
            </Text>
          </View>
        )}

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
            Only guest users can book tours
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
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
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
  bioText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  experienceText: {
    fontSize: 14,
    color: colors.text,
  },
  rateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
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

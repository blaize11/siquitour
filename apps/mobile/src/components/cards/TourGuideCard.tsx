import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface TourGuideCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  experience: string;
  pricePerPax: number;
  verified?: boolean;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  languages?: string[];
  municipality?: string;
}

export function TourGuideCard({
  id,
  name,
  imageUrl,
  rating,
  reviewCount,
  experience,
  pricePerPax,
  verified = false,
  onPress,
  onFavorite,
  isFavorite = false,
  languages = [],
  municipality,
}: TourGuideCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>👤</Text>
            </View>
          )}

          {/* Favorite Button */}
          <Pressable onPress={onFavorite} style={styles.favoriteButton}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </Pressable>

          {/* Verified Badge */}
          {verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>

          {/* Details */}
          <Text style={styles.details}>{experience}</Text>

          {/* Languages */}
          {languages.length > 0 && (
            <Text style={styles.details} numberOfLines={1}>
              {languages.join(' • ')}
            </Text>
          )}

          {/* Location */}
          {municipality && (
            <Text style={styles.details} numberOfLines={1}>
              📍 {municipality}
            </Text>
          )}

          {/* Price */}
          <Text style={styles.price}>₱{pricePerPax.toLocaleString()} / pax</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 160,
    marginRight: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    width: '100%',
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 50,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 18,
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  star: {
    fontSize: 14,
    color: '#FFB800',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  details: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
});

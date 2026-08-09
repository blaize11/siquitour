import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface RentalCardProps {
  id: string;
  title: string;
  type: string;
  imageUrl?: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  availability?: 'available' | 'unavailable';
  transmission?: string;
  engineSize?: string;
}

export function RentalCard({
  id,
  title,
  type,
  imageUrl,
  pricePerDay,
  rating,
  reviewCount,
  onPress,
  onFavorite,
  isFavorite = false,
  availability = 'available',
  transmission,
  engineSize,
}: RentalCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>🏍️</Text>
            </View>
          )}

          {/* Favorite Button */}
          <Pressable onPress={onFavorite} style={styles.favoriteButton}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </Pressable>

          {/* Status Badge */}
          {availability === 'unavailable' && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.type} numberOfLines={1}>
              {type}
            </Text>
          </View>

          {/* Specs */}
          {(transmission || engineSize) && (
            <Text style={styles.specs} numberOfLines={1}>
              {transmission && `${transmission}`}
              {transmission && engineSize && ' • '}
              {engineSize && `${engineSize}`}
            </Text>
          )}

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>

          {/* Price */}
          <Text style={styles.price}>₱{pricePerDay.toLocaleString()} / day</Text>
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
  unavailableBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  type: {
    fontSize: 12,
    color: colors.textMuted,
  },
  specs: {
    fontSize: 11,
    color: colors.textMuted,
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
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
});

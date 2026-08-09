import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface SpotCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  municipality?: string;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function SpotCard({
  id,
  name,
  imageUrl,
  category,
  rating,
  reviewCount = 0,
  distance,
  municipality,
  onPress,
  onFavorite,
  isFavorite = false,
}: SpotCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>📍</Text>
            </View>
          )}

          {/* Favorite Button */}
          {onFavorite && (
            <Pressable onPress={onFavorite} style={styles.favoriteButton}>
              <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            </Pressable>
          )}

          {/* Category Badge */}
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          {/* Location */}
          {municipality && (
            <Text style={styles.location} numberOfLines={1}>
              📍 {municipality}
            </Text>
          )}

          {/* Rating & Distance */}
          <View style={styles.footer}>
            {rating !== undefined && (
              <View style={styles.ratingRow}>
                <Text style={styles.star}>★</Text>
                <Text style={styles.rating}>{rating.toFixed(1)}</Text>
              </View>
            )}
            {distance !== undefined && (
              <Text style={styles.distance}>{distance.toFixed(1)} km</Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 180,
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
  categoryBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  location: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  distance: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

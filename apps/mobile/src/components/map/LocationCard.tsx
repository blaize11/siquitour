import { Pressable, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { MapLocation } from '../../types/api';

interface LocationCardProps {
  location: MapLocation | null;
  onClose: () => void;
  onViewDetails?: (location: MapLocation) => void;
  onBook?: (location: MapLocation) => void;
}

export function LocationCard({ location, onClose, onViewDetails, onBook }: LocationCardProps) {
  if (!location) return null;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      tour_guide: 'Tour Guide',
      rental: 'Rental',
      spot: 'Attraction',
      restaurant: 'Restaurant',
      resort: 'Resort',
      beach: 'Beach',
      waterfall: 'Waterfall',
      cave: 'Cave',
    };
    return labels[category] || category;
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      {/* Close button */}
      <Pressable
        onPress={onClose}
        style={{
          position: 'absolute',
          top: spacing.md,
          right: spacing.md,
          padding: spacing.xs,
        }}
      >
        <Text style={{ fontSize: 20 }}>✕</Text>
      </Pressable>

      {/* Location name */}
      <Text style={[typography.subtitle, { marginBottom: spacing.xs }]}>
        {location.name}
      </Text>

      {/* Category */}
      <Text style={[typography.caption, { marginBottom: spacing.sm }]}>
        {getCategoryLabel(location.category)}
      </Text>

      {/* Image */}
      {location.image && (
        <View
          style={{
            width: '100%',
            height: 120,
            backgroundColor: colors.border,
            borderRadius: radius.md,
            marginBottom: spacing.sm,
          }}
        />
      )}

      {/* Description */}
      {location.description && (
        <Text style={[typography.body, { marginBottom: spacing.sm, color: colors.textMuted }]}>
          {location.description}
        </Text>
      )}

      {/* Address */}
      {location.address && (
        <Text style={[typography.caption, { marginBottom: spacing.sm, color: colors.textMuted }]}>
          📍 {location.address}
        </Text>
      )}

      {/* Price info if available */}
      {location.price_per_day && (
        <Text style={[typography.body, { marginBottom: spacing.md, color: colors.primary, fontWeight: '600' }]}>
          ₱{location.price_per_day} / day
        </Text>
      )}
      {location.rate_per_pax && (
        <Text style={[typography.body, { marginBottom: spacing.md, color: colors.primary, fontWeight: '600' }]}>
          ₱{location.rate_per_pax} / pax
        </Text>
      )}

      {/* Action buttons */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {onViewDetails && (
          <Pressable
            onPress={() => onViewDetails(location)}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.primary,
              borderRadius: radius.sm,
              alignItems: 'center',
            }}
          >
            <Text style={[typography.body, { color: colors.primary, fontWeight: '600' }]}>
              Details
            </Text>
          </Pressable>
        )}
        {onBook && (
          <Pressable
            onPress={() => onBook(location)}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              backgroundColor: colors.primary,
              borderRadius: radius.sm,
              alignItems: 'center',
            }}
          >
            <Text style={[typography.body, { color: '#fff', fontWeight: '600' }]}>
              Book
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

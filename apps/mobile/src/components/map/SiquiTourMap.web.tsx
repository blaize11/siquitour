import { Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface SiquiTourMapProps {
  locations?: any[];
  onMarkerPress?: (location: any) => void;
  showUserLocation?: boolean;
  height?: number | string;
}

export function SiquiTourMap({
  locations,
  onMarkerPress,
  showUserLocation = true,
  height = 400,
}: SiquiTourMapProps) {
  return (
    <View
      style={{
        height,
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
      }}
    >
      <Text style={[typography.subtitle, { marginBottom: spacing.sm, textAlign: 'center' }]}>
        📱 Maps Only Work on Mobile
      </Text>
      <Text style={[typography.caption, { textAlign: 'center', color: colors.textMuted }]}>
        The interactive map is only available on iOS and Android devices.
      </Text>
      <Text style={[typography.caption, { textAlign: 'center', color: colors.textMuted, marginTop: spacing.sm }]}>
        Use the Tour Guides, Rentals, or Spots tabs to browse locations.
      </Text>
    </View>
  );
}

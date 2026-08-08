import { Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface LocationPickerProps {
  onLocationSelect?: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  height?: number | string;
}

export function LocationPicker({
  onLocationSelect,
  initialLatitude = 9.2142,
  initialLongitude = 123.515,
  height = 400,
}: LocationPickerProps) {
  return (
    <View
      style={{
        height,
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
      }}
    >
      <Text style={[typography.subtitle, { marginBottom: spacing.sm, textAlign: 'center' }]}>
        📍 Location Picker
      </Text>
      <Text style={[typography.caption, { textAlign: 'center', color: colors.textMuted }]}>
        Location picker is only available on mobile devices.
      </Text>
      <Text style={[typography.caption, { textAlign: 'center', color: colors.textMuted, marginTop: spacing.sm }]}>
        Current location: {initialLatitude?.toFixed(4)}, {initialLongitude?.toFixed(4)}
      </Text>
    </View>
  );
}

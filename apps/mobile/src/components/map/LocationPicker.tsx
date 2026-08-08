import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { colors, radius, spacing, typography } from '../theme';

interface LocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  height?: number | string;
}

const SIQUIJOR_REGION = {
  latitude: 9.2142,
  longitude: 123.515,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export function LocationPicker({
  onLocationSelect,
  initialLatitude = 9.2142,
  initialLongitude = 123.515,
  height = 400,
}: LocationPickerProps) {
  const mapRef = useRef<MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(() => (initialLatitude && initialLongitude ? { latitude: initialLatitude, longitude: initialLongitude } : null));

  const handleMapPress = (e: any) => {
    const coordinate = e.nativeEvent.coordinate;
    setSelectedLocation(coordinate);
    onLocationSelect(coordinate.latitude, coordinate.longitude);
  };

  const handleMarkerDragEnd = (e: any) => {
    const coordinate = e.nativeEvent.coordinate;
    setSelectedLocation(coordinate);
    onLocationSelect(coordinate.latitude, coordinate.longitude);
  };

  return (
    <View style={{ height, width: '100%', position: 'relative', borderRadius: radius.md, overflow: 'hidden' }}>
      <MapView
        ref={mapRef}
        initialRegion={SIQUIJOR_REGION}
        style={{ flex: 1 }}
        onPress={handleMapPress}
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            draggable
            onDragEnd={handleMarkerDragEnd}
            title="Selected Location"
            pinColor={colors.primary}
          />
        )}
      </MapView>

      {/* Coordinates display */}
      {selectedLocation && (
        <View
          style={{
            position: 'absolute',
            top: spacing.md,
            left: spacing.md,
            right: spacing.md,
            backgroundColor: colors.surface,
            padding: spacing.sm,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={[typography.caption, { marginBottom: spacing.xs }]}>
            Latitude: <Text style={{ fontWeight: '700' }}>{selectedLocation.latitude.toFixed(6)}</Text>
          </Text>
          <Text style={[typography.caption]}>
            Longitude: <Text style={{ fontWeight: '700' }}>{selectedLocation.longitude.toFixed(6)}</Text>
          </Text>
        </View>
      )}

      {/* Instructions */}
      {!selectedLocation && (
        <View
          style={{
            position: 'absolute',
            bottom: spacing.md,
            left: spacing.md,
            right: spacing.md,
            backgroundColor: colors.surface,
            padding: spacing.sm,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: colors.primary,
          }}
        >
          <Text style={[typography.caption, { color: colors.primary, textAlign: 'center' }]}>
            Click on the map or drag the marker to select a location
          </Text>
        </View>
      )}
    </View>
  );
}

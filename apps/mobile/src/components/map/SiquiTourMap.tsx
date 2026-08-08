import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing, typography } from '../theme';
import type { MapLocation } from '../../types/api';

interface SiquiTourMapProps {
  locations: MapLocation[];
  onMarkerPress?: (location: MapLocation) => void;
  showUserLocation?: boolean;
  height?: number | string;
}

const SIQUIJOR_CENTER = {
  latitude: 9.2142,
  longitude: 123.515,
};

const SIQUIJOR_REGION = {
  latitude: 9.2142,
  longitude: 123.515,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export function SiquiTourMap({
  locations,
  onMarkerPress,
  showUserLocation = true,
  height = 400,
}: SiquiTourMapProps) {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  // Request location permission and get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const hasPermission = status === 'granted';
        setLocationPermission(hasPermission);

        if (hasPermission) {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }
      } catch (error) {
        console.warn('Location permission error:', error);
        setLocationPermission(false);
      }
    })();
  }, []);

  const handleCenterOnUser = async () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const getMarkerColor = (category: string) => {
    switch (category) {
      case 'tour_guide':
        return '#FF6B6B';
      case 'rental':
        return '#4ECDC4';
      case 'spot':
        return '#FFE66D';
      case 'restaurant':
        return '#FF8C42';
      case 'resort':
        return '#95E1D3';
      default:
        return colors.primary;
    }
  };

  return (
    <View style={{ height, width: '100%', position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
      <MapView
        ref={mapRef}
        initialRegion={SIQUIJOR_REGION}
        style={{ flex: 1 }}
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* Location markers */}
        {locations.map((location) => {
          const lat = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude;
          const lng = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude;

          if (!lat || !lng) return null;

          return (
            <Marker
              key={`${location.category}-${location.id}`}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => onMarkerPress?.(location)}
              pinColor={getMarkerColor(location.category)}
              title={location.name}
              description={location.description}
            />
          );
        })}

        {/* User location marker */}
        {showUserLocation && userLocation && (
          <Marker
            coordinate={userLocation}
            pinColor="#3498DB"
            title="Your Location"
          />
        )}
      </MapView>

      {/* Center on user location button */}
      {showUserLocation && locationPermission && (
        <Pressable
          onPress={handleCenterOnUser}
          style={{
            position: 'absolute',
            bottom: spacing.md,
            right: spacing.md,
            backgroundColor: colors.primary,
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text style={{ fontSize: 20 }}>📍</Text>
        </Pressable>
      )}

      {/* No permission message */}
      {showUserLocation && locationPermission === false && (
        <View
          style={{
            position: 'absolute',
            bottom: spacing.md,
            right: spacing.md,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Enable location to see your position
          </Text>
        </View>
      )}
    </View>
  );
}

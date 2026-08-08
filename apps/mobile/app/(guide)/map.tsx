import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSpots } from '../../src/api/queries/spots';
import { SiquiTourMap, LocationCard } from '../../src/components/map';
import {
  ScreenContainer,
  LoadingView,
  ErrorView,
  colors,
  radius,
  spacing,
  typography,
} from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';
import type { MapLocation } from '../../src/types/api';

type FilterType = 'all' | 'attractions' | 'restaurants' | 'meeting_points';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'attractions', label: 'Attractions' },
  { key: 'restaurants', label: 'Restaurants' },
  { key: 'meeting_points', label: 'Meeting Points' },
];

export default function GuideMapScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const { data: spotsData, isLoading, isError, error } = useSpots();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(error)} />;

  // Convert spots to map locations
  const spotLocations: MapLocation[] = (spotsData?.data || [])
    .filter((spot) => spot.latitude && spot.longitude)
    .map((spot) => ({
      id: spot.id,
      name: spot.name,
      category: spot.category,
      latitude: spot.latitude || 0,
      longitude: spot.longitude || 0,
      description: spot.description,
    }));

  // Filter locations
  let displayLocations: MapLocation[] = [];
  if (filter === 'all') {
    displayLocations = spotLocations;
  } else if (filter === 'attractions') {
    displayLocations = spotLocations.filter((s) => s.category === 'spot');
  } else if (filter === 'restaurants') {
    displayLocations = spotLocations.filter((s) => s.category === 'restaurant');
  } else if (filter === 'meeting_points') {
    // Meeting points would be selected by the guide
    displayLocations = spotLocations;
  }

  return (
    <ScreenContainer scroll={false} style={{ gap: 0 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Text style={typography.title}>Map</Text>
      </View>

      {/* Filter buttons */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          gap: spacing.sm,
          overflow: 'hidden',
        }}
      >
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => {
              setFilter(f.key);
              setSelectedLocation(null);
            }}
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.sm,
              backgroundColor: filter === f.key ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: filter === f.key ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                color: filter === f.key ? '#fff' : colors.text,
                fontSize: 12,
                fontWeight: '500',
              }}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Map */}
      <View style={{ flex: 1, position: 'relative' }}>
        <SiquiTourMap
          locations={displayLocations}
          onMarkerPress={setSelectedLocation}
          showUserLocation={true}
          height="100%"
        />

        {/* Location card */}
        {selectedLocation && (
          <LocationCard
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

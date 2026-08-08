import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useGuides } from '../../src/api/queries/guides';
import { useRentals } from '../../src/api/queries/rentals';
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

type FilterType = 'all' | 'tour_guides' | 'tourist_spots' | 'resorts' | 'food' | 'rentals';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tour_guides', label: 'Tour Guides' },
  { key: 'tourist_spots', label: 'Tourist Spots' },
  { key: 'resorts', label: 'Resorts' },
  { key: 'food', label: 'Food' },
  { key: 'rentals', label: 'Rentals' },
];

export default function MapScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const { data: guidesData, isLoading: guidesLoading, isError: guidesError, error: guidesErrorMsg } = useGuides();
  const { data: rentalsData, isLoading: rentalsLoading, isError: rentalsError, error: rentalsErrorMsg } = useRentals();
  const { data: spotsData, isLoading: spotsLoading, isError: spotsError, error: spotsErrorMsg } = useSpots();

  const isLoading = guidesLoading || rentalsLoading || spotsLoading;
  const isError = guidesError || rentalsError || spotsError;
  const errorMsg = guidesErrorMsg || rentalsErrorMsg || spotsErrorMsg;

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} />;

  // Convert API data to MapLocation format
  const guideLocations: MapLocation[] = (guidesData?.data || [])
    .filter((guide) => guide.tour_guide_profile)
    .map((guide) => ({
      id: guide.id,
      name: guide.name,
      category: 'tour_guide',
      latitude: 9.2142,
      longitude: 123.515,
      description: guide.tour_guide_profile?.bio,
      type: 'Tour Guide',
      rate_per_pax: guide.tour_guide_profile?.rate_per_pax,
    }));

  const rentalLocations: MapLocation[] = (rentalsData?.data || [])
    .filter((rental) => rental.latitude && rental.longitude)
    .map((rental) => ({
      id: rental.id,
      name: rental.title,
      category: 'rental',
      latitude: rental.latitude || 0,
      longitude: rental.longitude || 0,
      description: rental.description,
      address: rental.address,
      type: rental.type,
      price_per_day: rental.price_per_day,
    }));

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

  // Filter locations based on selected filter
  let displayLocations: MapLocation[] = [];
  if (filter === 'all') {
    displayLocations = [...guideLocations, ...rentalLocations, ...spotLocations];
  } else if (filter === 'tour_guides') {
    displayLocations = guideLocations;
  } else if (filter === 'rentals') {
    displayLocations = rentalLocations;
  } else if (filter === 'tourist_spots') {
    displayLocations = spotLocations.filter((s) => s.category === 'spot');
  } else if (filter === 'food') {
    displayLocations = spotLocations.filter((s) => s.category === 'restaurant');
  } else if (filter === 'resorts') {
    displayLocations = [];
  }

  const handleMarkerPress = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const handleViewDetails = (location: MapLocation) => {
    if (location.category === 'tour_guide') {
      router.push(`/(guest)/guide/${location.id}`);
    } else if (location.category === 'rental') {
      router.push(`/(guest)/rental/${location.id}`);
    }
    setSelectedLocation(null);
  };

  const handleBook = (location: MapLocation) => {
    if (location.category === 'tour_guide') {
      router.push(`/(guest)/guide/${location.id}`);
    } else if (location.category === 'rental') {
      router.push(`/(guest)/rental/${location.id}`);
    }
    setSelectedLocation(null);
  };

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
          onMarkerPress={handleMarkerPress}
          showUserLocation={true}
          height="100%"
        />

        {/* Location card */}
        {selectedLocation && (
          <LocationCard
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            onViewDetails={handleViewDetails}
            onBook={handleBook}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

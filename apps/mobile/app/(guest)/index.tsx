import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useGuides } from '../../src/api/queries/guides';
import { useRentals } from '../../src/api/queries/rentals';
import { useSpots } from '../../src/api/queries/spots';
import { SiquiTourMap, LocationCard } from '../../src/components/map';
import {
  TourGuideCard,
  RentalCard,
  SpotCard,
  ImageCarousel,
  LoadingView,
  ErrorView,
  ScreenContainer,
  colors,
  spacing,
  typography,
} from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';
import type { MapLocation } from '../../src/types/api';

type FilterType = 'all' | 'tour_guides' | 'rentals' | 'spots' | 'food';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tour_guides', label: 'Tour Guides' },
  { key: 'spots', label: 'Spots' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'food', label: 'Food' },
];

export default function ExploreScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showMap, setShowMap] = useState(false);

  const { data: guidesData, isLoading: guidesLoading, isError: guidesError, error: guidesErrorMsg } = useGuides();
  const { data: rentalsData, isLoading: rentalsLoading, isError: rentalsError, error: rentalsErrorMsg } = useRentals();
  const { data: spotsData, isLoading: spotsLoading, isError: spotsError, error: spotsErrorMsg } = useSpots();

  const isLoading = guidesLoading || rentalsLoading || spotsLoading;
  const isError = guidesError || rentalsError || spotsError;
  const errorMsg = guidesErrorMsg || rentalsErrorMsg || spotsErrorMsg;

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} />;

  // Process data
  const guides = guidesData?.data || [];
  const rentals = rentalsData?.data || [];
  const spots = spotsData?.data || [];

  // Map data for rendering
  const guideLocations: MapLocation[] = guides
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

  const rentalLocations: MapLocation[] = rentals
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

  const spotLocations: MapLocation[] = spots
    .filter((spot) => spot.latitude && spot.longitude)
    .map((spot) => ({
      id: spot.id,
      name: spot.name,
      category: spot.category,
      latitude: spot.latitude || 0,
      longitude: spot.longitude || 0,
      description: spot.description,
    }));

  const handleGuidePress = (guideId: string) => {
    router.push(`/(guest)/guide/${guideId}`);
  };

  const handleRentalPress = (rentalId: string) => {
    router.push(`/(guest)/rental/${rentalId}`);
  };

  if (showMap) {
    return (
      <MapView
        guideLocations={guideLocations}
        rentalLocations={rentalLocations}
        spotLocations={spotLocations}
        selectedLocation={selectedLocation}
        onLocationSelect={setSelectedLocation}
        onBack={() => setShowMap(false)}
      />
    );
  }

  return (
    <ScreenContainer scroll={true} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Explore Siquijor</Text>
            <Text style={styles.headerSubtitle}>Find the best guides, rentals and spots for your adventure 🌴</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(guest)/search')}
            style={styles.searchButton}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </Pressable>
        </View>
      </View>

      <View>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={FILTERS}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterChip,
                  filter === item.key && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === item.key && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            )}
            keyExtractor={(item) => item.key}
            horizontal
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Tour Guides Section */}
          {(filter === 'all' || filter === 'tour_guides') && guides.length > 0 && (
            <ImageCarousel
              title="Top Tour Guides"
              seeAllText="See all"
              onSeeAll={() => setFilter('tour_guides')}
              data={guides}
              renderItem={(guide) => (
                <TourGuideCard
                  key={guide.id}
                  id={guide.id}
                  name={guide.name}
                  imageUrl={guide.avatar_url}
                  rating={guide.tour_guide_profile?.rating || 0}
                  reviewCount={guide.tour_guide_profile?.review_count || 0}
                  experience={`${guide.tour_guide_profile?.years_experience || 0} yrs experience`}
                  pricePerPax={guide.tour_guide_profile?.rate_per_pax || 0}
                  verified={guide.tour_guide_profile?.verified || false}
                  languages={guide.tour_guide_profile?.languages || []}
                  municipality={guide.tour_guide_profile?.municipality}
                  onPress={() => handleGuidePress(guide.id)}
                  onFavorite={() => {}}
                  isFavorite={false}
                />
              )}
            />
          )}

          {/* Rentals Section */}
          {(filter === 'all' || filter === 'rentals') && rentals.length > 0 && (
            <ImageCarousel
              title="Motorbike Rentals"
              seeAllText="See all"
              onSeeAll={() => setFilter('rentals')}
              data={rentals}
              renderItem={(rental) => (
                <RentalCard
                  key={rental.id}
                  id={rental.id}
                  title={rental.title}
                  type={rental.type}
                  imageUrl={rental.image_url}
                  pricePerDay={rental.price_per_day}
                  rating={rental.rating || 0}
                  reviewCount={rental.review_count || 0}
                  transmission={rental.transmission}
                  engineSize={rental.engine_size}
                  onPress={() => handleRentalPress(rental.id)}
                  onFavorite={() => {}}
                  isFavorite={false}
                />
              )}
            />
          )}

          {/* Spots Section */}
          {(filter === 'all' || filter === 'spots' || filter === 'food') && spots.length > 0 && (
            <ImageCarousel
              title="Popular Spots"
              seeAllText="See all"
              onSeeAll={() => setFilter('spots')}
              data={spots}
              renderItem={(spot) => (
                <SpotCard
                  key={spot.id}
                  id={spot.id}
                  name={spot.name}
                  imageUrl={spot.image_url}
                  category={spot.category}
                  rating={spot.rating}
                  reviewCount={spot.review_count}
                  distance={spot.distance}
                  municipality={spot.municipality}
                  onPress={() => {}}
                  onFavorite={() => {}}
                  isFavorite={false}
                />
              )}
            />
          )}

          {/* View Map Button */}
          <Pressable
            onPress={() => setShowMap(true)}
            style={styles.mapButton}
          >
            <Text style={styles.mapButtonText}>📍 View on Map</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.lg }} />
      </View>
    </ScreenContainer>
  );
}

interface MapViewProps {
  guideLocations: MapLocation[];
  rentalLocations: MapLocation[];
  spotLocations: MapLocation[];
  selectedLocation: MapLocation | null;
  onLocationSelect: (location: MapLocation | null) => void;
  onBack: () => void;
}

function MapView({
  guideLocations,
  rentalLocations,
  spotLocations,
  selectedLocation,
  onLocationSelect,
  onBack,
}: MapViewProps) {
  const displayLocations = [...guideLocations, ...rentalLocations, ...spotLocations];

  const handleNavigate = (location: MapLocation) => {
    if (location.category === 'tour_guide') {
      router.push(`/(guest)/guide/${location.id}`);
    } else if (location.category === 'rental') {
      router.push(`/(guest)/rental/${location.id}`);
    }
    onLocationSelect(null);
  };

  return (
    <ScreenContainer scroll={false} style={{ padding: 0, gap: 0 }}>
      {/* Back Button */}
      <View style={styles.mapHeader}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.mapTitle}>Map</Text>
      </View>

      <SiquiTourMap
        locations={displayLocations}
        onMarkerPress={onLocationSelect}
        showUserLocation={true}
        height="100%"
      />

      {selectedLocation && (
        <LocationCard
          location={selectedLocation}
          onClose={() => onLocationSelect(null)}
          onViewDetails={() => handleNavigate(selectedLocation)}
          onBook={() => handleNavigate(selectedLocation)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersList: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  content: {
    paddingVertical: spacing.md,
  },
  mapButton: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  mapTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});

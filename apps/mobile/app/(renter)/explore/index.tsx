import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useGuides } from '../../../src/api/queries/guides';
import { useRentals } from '../../../src/api/queries/rentals';
import { useSpots } from '../../../src/api/queries/spots';
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
} from '../../../src/components';
import { extractErrorMessage } from '../../../src/components/ErrorView';

type FilterType = 'all' | 'tour_guides' | 'rentals' | 'spots' | 'food';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tour_guides', label: 'Tour Guides' },
  { key: 'spots', label: 'Spots' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'food', label: 'Food' },
];

export default function RenterExploreScreen() {
  const [filter, setFilter] = useState<FilterType>('all');

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


  const handleGuidePress = (guideId: string) => {
    router.push(`/(renter)/guide/${guideId}`);
  };

  const handleRentalPress = (rentalId: string) => {
    router.push(`/(renter)/rental/${rentalId}`);
  };

  const handleSpotPress = (spotId: string) => {
    router.push(`/(renter)/spot/${spotId}`);
  };

  // Filter data based on selected filter
  let filteredGuides = guides;
  let filteredRentals = rentals;
  let filteredSpots = spots;

  if (filter !== 'all') {
    filteredGuides = filter === 'tour_guides' ? guides : [];
    filteredRentals = filter === 'rentals' ? rentals : [];
    filteredSpots = filter === 'spots' ? spots : [];
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Siquitour</Text>
          <Text style={styles.headerSubtitle}>Read-only view - View only available to you</Text>
        </View>

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterButton,
                filter === f.key && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.key && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Tour Guides Section */}
        {(filter === 'all' || filter === 'tour_guides') && filteredGuides.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tour Guides</Text>
            <FlatList
              data={filteredGuides}
              renderItem={({ item }) => (
                <TourGuideCard
                  id={item.id}
                  name={item.name}
                  rating={item.tour_guide_profile?.rating || 0}
                  reviewCount={item.tour_guide_profile?.review_count || 0}
                  experience={`${item.tour_guide_profile?.years_experience || 0} years`}
                  pricePerPax={item.tour_guide_profile?.rate_per_pax || 0}
                  onPress={() => handleGuidePress(item.id)}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Rentals Section */}
        {(filter === 'all' || filter === 'rentals') && filteredRentals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rentals</Text>
            <FlatList
              data={filteredRentals}
              renderItem={({ item }) => (
                <RentalCard
                  id={item.id}
                  title={item.title}
                  type={item.type}
                  pricePerDay={item.price_per_day || 0}
                  rating={item.rating || 0}
                  reviewCount={item.review_count || 0}
                  onPress={() => handleRentalPress(item.id)}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Spots Section */}
        {(filter === 'all' || filter === 'spots') && filteredSpots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spots</Text>
            <FlatList
              data={filteredSpots}
              renderItem={({ item }) => (
                <SpotCard
                  id={item.id}
                  name={item.name}
                  imageUrl={item.image_url}
                  category={item.category}
                  rating={item.rating || 0}
                  reviewCount={item.review_count || 0}
                  municipality={item.municipality}
                  onPress={() => handleSpotPress(item.id)}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Empty State */}
        {filteredGuides.length === 0 &&
          filteredRentals.length === 0 &&
          filteredSpots.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items found for this filter</Text>
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  filterContent: {
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  filterTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

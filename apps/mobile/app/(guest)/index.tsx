import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useGuides } from '../../src/api/queries/guides';
import { useRentals } from '../../src/api/queries/rentals';
import { useSpots } from '../../src/api/queries/spots';
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
    router.push(`/(guest)/guide/${guideId}`);
  };

  const handleRentalPress = (rentalId: string) => {
    router.push(`/(guest)/rental/${rentalId}`);
  };

  const handleSpotPress = (spotId: string) => {
    router.push(`/(guest)/spot/${spotId}`);
  };

  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/(guest)/restaurant/${restaurantId}`);
  };

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
                  onPress={() => handleSpotPress(spot.id)}
                  onFavorite={() => {}}
                  isFavorite={false}
                />
              )}
            />
          )}

        </View>

        <View style={{ height: spacing.lg }} />
      </View>
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
});

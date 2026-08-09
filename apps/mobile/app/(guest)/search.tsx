import { useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSearchGuides, useSearchRentals, useSearchSpots } from '../../src/api/queries/search';
import {
  TourGuideCard,
  RentalCard,
  SpotCard,
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  spacing,
  typography,
} from '../../src/components';
import type { User, Rental, Spot } from '../../src/types/api';
import { router } from 'expo-router';

type SearchTab = 'guides' | 'rentals' | 'spots';

const RENTAL_TYPES = ['motorbike', 'scooter', 'bicycle', 'atv'];
const SPOT_CATEGORIES = ['spot', 'restaurant', 'beach', 'attraction'];

export default function SearchScreen() {
  const [tab, setTab] = useState<SearchTab>('guides');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState('');

  const guidesQuery = useSearchGuides({
    search: searchQuery,
    max_price: maxPrice ? Number(maxPrice) : undefined,
  });

  const rentalsQuery = useSearchRentals({
    search: searchQuery,
    type: selectedType,
    max_price: maxPrice ? Number(maxPrice) : undefined,
  });

  const spotsQuery = useSearchSpots({
    search: searchQuery,
    category: selectedCategory,
  });

  const handleGuidePress = (guide: User) => {
    router.push(`/(guest)/guide/${guide.id}`);
  };

  const handleRentalPress = (rental: Rental) => {
    router.push(`/(guest)/rental/${rental.id}`);
  };

  const handleSpotPress = (spot: Spot) => {
    router.push(`/(guest)/spot/${spot.id}`);
  };

  const isLoading = guidesQuery.isLoading || rentalsQuery.isLoading || spotsQuery.isLoading;
  const isError = guidesQuery.isError || rentalsQuery.isError || spotsQuery.isError;

  const results =
    tab === 'guides'
      ? guidesQuery.data?.data || []
      : tab === 'rentals'
        ? rentalsQuery.data?.data || []
        : spotsQuery.data?.data || [];

  const tabs = [
    { key: 'guides', label: 'Tour Guides', icon: '👤' },
    { key: 'rentals', label: 'Rentals', icon: '🏍️' },
    { key: 'spots', label: 'Spots', icon: '📍' },
  ];

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${tab}...`}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={tabs}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setTab(item.key as SearchTab);
                setSelectedType('');
                setSelectedCategory('');
              }}
              style={[
                styles.tab,
                tab === item.key && styles.tabActive,
              ]}
            >
              <Text style={styles.tabIcon}>{item.icon}</Text>
              <Text style={[styles.tabLabel, tab === item.key && styles.tabLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          )}
          keyExtractor={(item) => item.key}
          horizontal
          scrollEnabled={false}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      {/* Filters */}
      {(tab === 'rentals' || tab === 'spots') && (
        <View style={styles.filtersContainer}>
          <FlatList
            data={tab === 'rentals' ? RENTAL_TYPES : SPOT_CATEGORIES}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  if (tab === 'rentals') {
                    setSelectedType(selectedType === item ? '' : item);
                  } else {
                    setSelectedCategory(selectedCategory === item ? '' : item);
                  }
                }}
                style={[
                  styles.filterChip,
                  (tab === 'rentals' ? selectedType === item : selectedCategory === item) &&
                    styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    (tab === 'rentals' ? selectedType === item : selectedCategory === item) &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            )}
            keyExtractor={(item) => item}
            horizontal
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>
      )}

      {/* Results */}
      {isLoading && <LoadingView />}
      {isError && <ErrorView message="Search failed" />}

      {!isLoading && !isError && results.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>
            {tab === 'guides' ? '👤' : tab === 'rentals' ? '🏍️' : '📍'}
          </Text>
          <Text style={styles.emptyStateText}>No results found</Text>
          <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
        </View>
      )}

      {!isLoading && !isError && results.length > 0 && (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.resultsList}>
          <View style={styles.resultsContent}>
            {tab === 'guides' &&
              (results as User[]).map((guide) => (
                <Pressable
                  key={guide.id}
                  onPress={() => handleGuidePress(guide)}
                  style={{ marginBottom: spacing.md }}
                >
                  <TourGuideCard
                    id={guide.id}
                    name={guide.name}
                    imageUrl={guide.profile_image_url}
                    rating={guide.tour_guide_profile?.rating || 0}
                    reviewCount={guide.tour_guide_profile?.review_count || 0}
                    experience={`${guide.tour_guide_profile?.years_experience || 0} yrs`}
                    pricePerPax={guide.tour_guide_profile?.rate_per_pax || 0}
                    verified={guide.tour_guide_profile?.verified || false}
                    onPress={() => handleGuidePress(guide)}
                  />
                </Pressable>
              ))}

            {tab === 'rentals' &&
              (results as Rental[]).map((rental) => (
                <Pressable
                  key={rental.id}
                  onPress={() => handleRentalPress(rental)}
                  style={{ marginBottom: spacing.md }}
                >
                  <RentalCard
                    id={rental.id}
                    title={rental.title}
                    type={rental.type}
                    imageUrl={rental.image_url}
                    pricePerDay={rental.price_per_day}
                    rating={rental.rating || 0}
                    reviewCount={rental.review_count || 0}
                    transmission={rental.transmission}
                    engineSize={rental.engine_size}
                    onPress={() => handleRentalPress(rental)}
                  />
                </Pressable>
              ))}

            {tab === 'spots' &&
              (results as Spot[]).map((spot) => (
                <Pressable
                  key={spot.id}
                  onPress={() => handleSpotPress(spot)}
                  style={{ marginBottom: spacing.md }}
                >
                  <SpotCard
                    id={spot.id}
                    name={spot.name}
                    imageUrl={spot.image_url}
                    category={spot.category}
                    rating={spot.rating}
                    reviewCount={spot.review_count}
                    distance={spot.distance}
                    municipality={spot.municipality}
                    onPress={() => handleSpotPress(spot)}
                  />
                </Pressable>
              ))}
          </View>

          <View style={{ height: spacing.lg }} />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: colors.text,
  },
  clearIcon: {
    fontSize: 18,
    color: colors.textMuted,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
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
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyStateIcon: {
    fontSize: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

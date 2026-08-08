import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useSearchGuides, useSearchRentals, useSearchSpots } from '../../src/api/queries/search';
import {
  Button,
  Card,
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  radius,
  spacing,
  typography,
} from '../../src/components';
import type { User, Rental, Spot } from '../../src/types/api';
import { router } from 'expo-router';

type SearchTab = 'guides' | 'rentals' | 'spots';

const RENTAL_TYPES = ['motorbike', 'car', 'tuktuk', 'van', 'bicycle', 'room', 'camera', 'other'];
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

  const GuideItem = ({ item }: { item: User }) => (
    <Pressable onPress={() => handleGuidePress(item)}>
      <Card style={{ gap: spacing.xs }}>
        <Text style={typography.subtitle}>{item.name}</Text>
        <Text style={typography.body}>{item.tour_guide_profile?.bio}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Text style={typography.caption}>⭐ {item.tour_guide_profile?.years_experience} yrs exp</Text>
          <Text style={typography.caption}>₱{item.tour_guide_profile?.rate_per_pax}/pax</Text>
        </View>
      </Card>
    </Pressable>
  );

  const RentalItem = ({ item }: { item: Rental }) => (
    <Pressable onPress={() => handleRentalPress(item)}>
      <Card style={{ gap: spacing.xs }}>
        <Text style={typography.subtitle}>{item.title}</Text>
        <Text style={[typography.body, { textTransform: 'capitalize' }]}>{item.type}</Text>
        <Text style={typography.caption}>{item.description}</Text>
        <Text style={typography.subtitle}>₱{item.price_per_day}/day</Text>
      </Card>
    </Pressable>
  );

  const SpotItem = ({ item }: { item: Spot }) => (
    <Pressable onPress={() => handleSpotPress(item)}>
      <Card style={{ gap: spacing.xs }}>
        <Text style={typography.subtitle}>{item.name}</Text>
        <Text style={[typography.body, { textTransform: 'capitalize' }]}>{item.category}</Text>
        <Text style={typography.caption}>{item.description}</Text>
      </Card>
    </Pressable>
  );

  return (
    <ScreenContainer>
      {/* Search Header */}
      <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
        <Text style={typography.title}>Search</Text>

        {/* Search Input */}
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <Text style={{ fontSize: 18 }}>🔍</Text>
          <TextInput
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, paddingVertical: spacing.sm, color: colors.text }}
            placeholderTextColor={colors.border}
          />
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {(['guides', 'rentals', 'spots'] as const).map((tabName) => (
            <Pressable
              key={tabName}
              onPress={() => {
                setTab(tabName);
                setSearchQuery('');
                setSelectedType('');
                setSelectedCategory('');
                setMaxPrice('');
              }}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: radius.sm,
                backgroundColor: tab === tabName ? colors.primary : colors.surface,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: tab === tabName ? '#fff' : colors.text,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {tabName}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Filters */}
      {tab === 'rentals' && (
        <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
          <Text style={typography.caption}>Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {RENTAL_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setSelectedType(selectedType === type ? '' : type)}
                style={{
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  borderRadius: radius.sm,
                  backgroundColor: selectedType === type ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: selectedType === type ? '#fff' : colors.text,
                    textTransform: 'capitalize',
                    fontSize: 12,
                  }}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {tab === 'spots' && (
        <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
          <Text style={typography.caption}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {SPOT_CATEGORIES.map((category) => (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                style={{
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  borderRadius: radius.sm,
                  backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: selectedCategory === category ? '#fff' : colors.text,
                    textTransform: 'capitalize',
                    fontSize: 12,
                  }}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {(tab === 'rentals' || tab === 'guides') && (
        <View style={{ marginBottom: spacing.md, gap: spacing.xs }}>
          <Text style={typography.caption}>Max Price: {maxPrice ? `₱${maxPrice}` : 'Any'}</Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: spacing.sm,
            }}
          >
            <TextInput
              placeholder="Enter max price (optional)"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="decimal-pad"
              style={{ paddingVertical: spacing.sm, color: colors.text }}
              placeholderTextColor={colors.border}
            />
          </View>
        </View>
      )}

      {/* Results */}
      {tab === 'guides' && (
        <>
          {guidesQuery.isLoading && <LoadingView />}
          {guidesQuery.isError && <ErrorView message="Failed to load guides" onRetry={guidesQuery.refetch} />}
          {guidesQuery.data && guidesQuery.data.data.length === 0 && (
            <Text style={typography.body}>No guides found</Text>
          )}
          {guidesQuery.data && (
            <FlatList
              data={guidesQuery.data.data}
              renderItem={({ item }) => <GuideItem item={item} />}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            />
          )}
        </>
      )}

      {tab === 'rentals' && (
        <>
          {rentalsQuery.isLoading && <LoadingView />}
          {rentalsQuery.isError && <ErrorView message="Failed to load rentals" onRetry={rentalsQuery.refetch} />}
          {rentalsQuery.data && rentalsQuery.data.data.length === 0 && (
            <Text style={typography.body}>No rentals found</Text>
          )}
          {rentalsQuery.data && (
            <FlatList
              data={rentalsQuery.data.data}
              renderItem={({ item }) => <RentalItem item={item} />}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            />
          )}
        </>
      )}

      {tab === 'spots' && (
        <>
          {spotsQuery.isLoading && <LoadingView />}
          {spotsQuery.isError && <ErrorView message="Failed to load spots" onRetry={spotsQuery.refetch} />}
          {spotsQuery.data && spotsQuery.data.data.length === 0 && (
            <Text style={typography.body}>No spots found</Text>
          )}
          {spotsQuery.data && (
            <FlatList
              data={spotsQuery.data.data}
              renderItem={({ item }) => <SpotItem item={item} />}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            />
          )}
        </>
      )}
    </ScreenContainer>
  );
}

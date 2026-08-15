import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client';

export function ExploreScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'guides' | 'rentals' | 'spots' | 'restaurants'>('guides');

  // Fetch dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['explore-dashboard'],
    queryFn: () => apiFetch('/explore'),
  });

  // Fetch guides
  const { data: guides, isLoading: guidesLoading } = useQuery({
    queryKey: ['explore-guides', search],
    queryFn: () => apiFetch('/explore/guides', { params: { search: search || undefined } }),
    enabled: activeTab === 'guides',
  });

  // Fetch rentals
  const { data: rentals, isLoading: rentalsLoading } = useQuery({
    queryKey: ['explore-rentals', search],
    queryFn: () => apiFetch('/explore/rentals', { params: { search: search || undefined } }),
    enabled: activeTab === 'rentals',
  });

  // Fetch spots
  const { data: spots, isLoading: spotsLoading } = useQuery({
    queryKey: ['explore-spots', search],
    queryFn: () => apiFetch('/explore/spots', { params: { search: search || undefined } }),
    enabled: activeTab === 'spots',
  });

  // Fetch restaurants
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['explore-restaurants', search],
    queryFn: () => apiFetch('/explore/restaurants', { params: { search: search || undefined } }),
    enabled: activeTab === 'restaurants',
  });

  const canBook = dashboard?.can_book ?? false;

  const renderGuideCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('GuideDetail', { guideId: item.id })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {canBook && <Text style={styles.bookingBadge}>Bookable</Text>}
        </View>
        <Text style={styles.cardSubtitle}>{item.tour_guide_profile?.bio}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>PHP {item.tour_guide_profile?.rate_per_pax}/pax</Text>
          <Text style={styles.rating}>⭐ {item.tour_guide_profile?.years_experience || 0} yrs</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRentalCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RentalDetail', { rentalId: item.id })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {canBook && <Text style={styles.bookingBadge}>Bookable</Text>}
        </View>
        <Text style={styles.cardSubtitle}>{item.type}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>PHP {item.price_per_day}/day</Text>
          <Text style={styles.rating}>{item.address}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSpotCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SpotDetail', { spotId: item.id })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
        </View>
        <Text style={styles.cardSubtitle}>{item.category}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{item.municipality}</Text>
          <Text style={styles.rating}>₱{item.fee_amount} fee</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRestaurantCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
        </View>
        <Text style={styles.cardSubtitle}>{item.cuisine_tags?.join(', ')}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{item.municipality}</Text>
          <Text style={styles.rating}>{item.price_range}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const isLoading =
    guidesLoading || rentalsLoading || spotsLoading || restaurantsLoading;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['guides', 'rentals', 'spots', 'restaurants'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={
            activeTab === 'guides'
              ? guides?.data || []
              : activeTab === 'rentals'
              ? rentals?.data || []
              : activeTab === 'spots'
              ? spots?.data || []
              : restaurants?.data || []
          }
          renderItem={
            activeTab === 'guides'
              ? renderGuideCard
              : activeTab === 'rentals'
              ? renderRentalCard
              : activeTab === 'spots'
              ? renderSpotCard
              : renderRestaurantCard
          }
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No {activeTab} found</Text>
            </View>
          }
        />
      )}

      {/* Can Book Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {canBook
            ? '✓ You can book guides and rentals'
            : 'Read-only access (cannot book)'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#007AFF',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  bookingBadge: {
    fontSize: 11,
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  rating: {
    fontSize: 12,
    color: '#999',
  },
  listContent: {
    paddingVertical: 8,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

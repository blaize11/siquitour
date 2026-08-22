import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  Text,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client';

export function RestaurantDetailScreen({ route }: any) {
  const { restaurantId } = route.params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['explore-restaurant-detail', restaurantId],
    queryFn: () => apiFetch(`/explore/restaurants/${restaurantId}`),
  });

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load restaurant details</Text>
      </View>
    );
  }

  const restaurant = data?.data;

  return (
    <ScrollView style={styles.container}>
      {/* Images */}
      {restaurant?.images && restaurant.images.length > 0 && (
        <View style={styles.imageContainer}>
          <FlatList
            data={restaurant.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{restaurant?.name}</Text>
        <Text style={styles.priceRange}>{restaurant?.price_range}</Text>
      </View>

      {/* Description */}
      {restaurant?.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{restaurant.description}</Text>
        </View>
      )}

      {/* Cuisine Tags */}
      {restaurant?.cuisine_tags && restaurant.cuisine_tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuisine</Text>
          <View style={styles.tagsContainer}>
            {restaurant.cuisine_tags.map((cuisine: string, idx: number) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{cuisine}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Municipality</Text>
          <Text style={styles.value}>{restaurant?.municipality}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Price Range</Text>
          <Text style={styles.value}>{restaurant?.price_range}</Text>
        </View>

        {restaurant?.opening_time && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Opening Hours</Text>
            <Text style={styles.value}>
              {restaurant.opening_time} - {restaurant.closing_time}
            </Text>
          </View>
        )}
      </View>

      {/* Location */}
      {restaurant?.latitude && restaurant?.longitude && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Coordinates</Text>
            <Text style={styles.value}>
              {restaurant.latitude}, {restaurant.longitude}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
  imageContainer: {
    height: 240,
    backgroundColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  priceRange: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  spacer: {
    height: 20,
  },
});

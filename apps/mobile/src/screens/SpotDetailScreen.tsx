import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client';

export function SpotDetailScreen({ route }: any) {
  const { spotId } = route.params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['explore-spot-detail', spotId],
    queryFn: () => apiFetch(`/explore/spots/${spotId}`),
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
        <Text style={styles.errorText}>Failed to load spot details</Text>
      </View>
    );
  }

  const spot = data?.data;

  return (
    <ScrollView style={styles.container}>
      {/* Images */}
      {spot?.images && spot.images.length > 0 && (
        <View style={styles.imageContainer}>
          <FlatList
            data={spot.images}
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
        <Text style={styles.name}>{spot?.name}</Text>
        <Text style={styles.category}>{spot?.category}</Text>
      </View>

      {/* Description */}
      {spot?.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{spot.description}</Text>
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{spot?.category}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Municipality</Text>
          <Text style={styles.value}>{spot?.municipality}</Text>
        </View>

        {spot?.fee_amount && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Entry Fee</Text>
            <Text style={styles.value}>
              PHP {spot.fee_amount} ({spot.fee_type})
            </Text>
          </View>
        )}

        {spot?.typical_duration_minutes && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Typical Duration</Text>
            <Text style={styles.value}>{spot.typical_duration_minutes} minutes</Text>
          </View>
        )}
      </View>

      {/* Location */}
      {spot?.latitude && spot?.longitude && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Coordinates</Text>
            <Text style={styles.value}>
              {spot.latitude}, {spot.longitude}
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
  category: {
    fontSize: 13,
    color: '#999',
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

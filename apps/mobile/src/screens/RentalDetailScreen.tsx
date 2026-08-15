import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client';

export function RentalDetailScreen({ route, navigation }: any) {
  const { rentalId } = route.params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['explore-rental-detail', rentalId],
    queryFn: () => apiFetch(`/explore/rentals/${rentalId}`),
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
        <Text style={styles.errorText}>Failed to load rental details</Text>
      </View>
    );
  }

  const rental = data?.data;
  const canBook = data?.can_book;

  return (
    <ScrollView style={styles.container}>
      {/* Images */}
      {rental?.images && rental.images.length > 0 && (
        <View style={styles.imageContainer}>
          <FlatList
            data={rental.images}
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
            scrollEventThrottle={16}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{rental?.title}</Text>
          <Text style={styles.type}>{rental?.type}</Text>
          <Text style={styles.price}>PHP {rental?.price_per_day}/day</Text>
        </View>
      </View>

      {/* Description */}
      {rental?.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{rental.description}</Text>
        </View>
      )}

      {/* Renter Info */}
      {rental?.renter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Renter</Text>
          <View style={styles.renterCard}>
            <View style={styles.renterInfo}>
              <Text style={styles.renterName}>{rental.renter.name}</Text>
              {rental.renter.phone && (
                <Text style={styles.renterPhone}>{rental.renter.phone}</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Location */}
      {rental?.address && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{rental.address}</Text>
          </View>
          {rental?.latitude && rental?.longitude && (
            <View style={styles.infoCard}>
              <Text style={styles.label}>Coordinates</Text>
              <Text style={styles.value}>
                {rental.latitude}, {rental.longitude}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Reviews */}
      {rental?.reviews && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({rental.reviews.total})</Text>
          {rental.reviews.data?.map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.guest?.name}</Text>
                <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))}
          {rental.reviews.data?.length === 0 && (
            <Text style={styles.emptyText}>No reviews yet</Text>
          )}
        </View>
      )}

      {/* Action Button */}
      {canBook && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate('BookingForm', {
              bookableType: 'rental',
              bookableId: rentalId,
            })
          }
        >
          <Text style={styles.bookButtonText}>Book Rental</Text>
        </TouchableOpacity>
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
  headerContent: {
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  type: {
    fontSize: 13,
    color: '#999',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
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
  renterCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  renterInfo: {
    flex: 1,
  },
  renterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  renterPhone: {
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
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  reviewRating: {
    fontSize: 12,
    color: '#FFA500',
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
  },
});

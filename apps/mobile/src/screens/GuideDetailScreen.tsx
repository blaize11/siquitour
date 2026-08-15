import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client';

export function GuideDetailScreen({ route, navigation }: any) {
  const { guideId } = route.params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['explore-guide-detail', guideId],
    queryFn: () => apiFetch(`/explore/guides/${guideId}`),
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
        <Text style={styles.errorText}>Failed to load guide details</Text>
      </View>
    );
  }

  const guide = data?.data;
  const canBook = data?.can_book;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{guide?.name}</Text>
          <Text style={styles.bio}>{guide?.profile?.bio}</Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Experience</Text>
          <Text style={styles.value}>{guide?.profile?.years_experience || 0} years</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Rate per Person</Text>
          <Text style={styles.value}>PHP {guide?.profile?.rate_per_pax}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Followers</Text>
          <Text style={styles.value}>{guide?.followers_count || 0}</Text>
        </View>

        {guide?.municipality && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{guide.municipality}</Text>
          </View>
        )}
      </View>

      {/* Packages */}
      {guide?.packages && guide.packages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tour Packages ({guide.packages.length})</Text>
          {guide.packages.map((pkg: any) => (
            <TouchableOpacity key={pkg.id} style={styles.packageCard}>
              <Text style={styles.packageTitle}>{pkg.title}</Text>
              <Text style={styles.packageDesc}>{pkg.description}</Text>
              <Text style={styles.packageDetails}>
                {pkg.duration_days} days • {pkg.min_pax}-{pkg.max_pax} pax
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Reviews */}
      {guide?.reviews && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({guide.reviews.total})</Text>
          {guide.reviews.data?.map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.guest?.name}</Text>
                <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))}
          {guide.reviews.data?.length === 0 && (
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
              bookableType: 'guide',
              bookableId: guideId,
            })
          }
        >
          <Text style={styles.bookButtonText}>Book Guide</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    marginTop: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  packageCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  packageTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  packageDetails: {
    fontSize: 11,
    color: '#999',
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

import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useMyRentals } from '../../src/api/queries/renter';
import { useProfile } from '../../src/api/queries/profile';
import { RentalCard, Button, LoadingView, ErrorView, ScreenContainer, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

type RentalFilter = 'all' | 'motorbikes' | 'scooters' | 'atv' | 'bicycles';

const RENTAL_FILTERS: { key: RentalFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'motorbikes', label: 'Motorbikes' },
  { key: 'scooters', label: 'Scooters' },
  { key: 'atv', label: 'ATV' },
  { key: 'bicycles', label: 'Bicycles' },
];

export default function RenterHomeScreen() {
  const { data: rentalsData, isLoading: rentalsLoading, isError: rentalsError, error: rentalsErrorMsg, refetch: refetchRentals } = useMyRentals();
  const { data: profileData } = useProfile();
  const [filter, setFilter] = React.useState<RentalFilter>('all');
  const [searchText, setSearchText] = React.useState('');

  const isLoading = rentalsLoading;
  const isError = rentalsError;
  const errorMsg = rentalsErrorMsg;

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} onRetry={refetchRentals} />;

  const rentals = rentalsData?.data || [];
  const currentProfile = profileData?.data;

  // Filter rentals
  let filteredRentals = rentals;
  if (filter !== 'all') {
    filteredRentals = rentals.filter(
      (rental) => rental.type?.toLowerCase() === filter.replace('motorbikes', 'motorbike')
    );
  }
  if (searchText.trim()) {
    filteredRentals = filteredRentals.filter(
      (rental) => rental.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  const totalEarnings = rentals.reduce((sum, r) => sum + (r.total_earnings || 0), 0);
  const totalBookings = rentals.reduce((sum, r) => sum + (r.booking_count || 0), 0);

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header with Profile */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Profile Photo */}
          {currentProfile?.profile_image_url ? (
            <Image
              source={{ uri: currentProfile.profile_image_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.placeholderText}>👤</Text>
            </View>
          )}

          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hi, Rider!</Text>
            <Text style={styles.subGreeting}>Find the best rides in Siquijor.</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search motorbikes..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatCard label="Total Earnings" value={`₱${totalEarnings.toLocaleString()}`} icon="💰" />
          <StatCard label="Total Bookings" value={String(totalBookings)} icon="📅" />
          <StatCard label="Active Rentals" value={String(rentals.length)} icon="🏍️" />
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={RENTAL_FILTERS}
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

        {/* Available Rentals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Rentals</Text>
            <Pressable onPress={() => router.push('/(renter)/rentals/new')}>
              <Text style={styles.addButton}>+ Add</Text>
            </Pressable>
          </View>

          {filteredRentals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏍️</Text>
              <Text style={styles.emptyStateText}>No rentals found</Text>
              <Pressable
                onPress={() => router.push('/(renter)/rentals/new')}
                style={styles.addRentalButton}
              >
                <Text style={styles.addRentalButtonText}>Add Your First Rental</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.rentalsList}>
              {filteredRentals.map((rental) => (
                <Pressable
                  key={rental.id}
                  onPress={() => router.push(`/(renter)/rentals/${rental.id}`)}
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
                    onPress={() => router.push(`/(renter)/rentals/${rental.id}`)}
                    onFavorite={() => {}}
                    isFavorite={false}
                    availability={rental.status === 'active' ? 'available' : 'unavailable'}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const React = require('react');

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 30,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
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
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  rentalsList: {
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyStateIcon: {
    fontSize: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addRentalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  addRentalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

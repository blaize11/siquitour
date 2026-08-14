import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useGuides } from '../../src/api/queries/guides';
import { useRentals } from '../../src/api/queries/rentals';
import { useSpots } from '../../src/api/queries/spots';
import { useBookings } from '../../src/api/queries/bookings';
import {
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  spacing,
  typography,
} from '../../src/components';
import { StatusBadge } from '../../src/components/RoleBadge';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function AdminDashboardScreen() {
  const { data: guidesData, isLoading: guidesLoading, isError: guidesError, error: guidesErrorMsg } = useGuides();
  const { data: rentalsData, isLoading: rentalsLoading, isError: rentalsError, error: rentalsErrorMsg } = useRentals();
  const { data: spotsData, isLoading: spotsLoading, isError: spotsError, error: spotsErrorMsg } = useSpots();
  const { data: bookingsData, isLoading: bookingsLoading, isError: bookingsError, error: bookingsErrorMsg } = useBookings();

  const isLoading = guidesLoading || rentalsLoading || spotsLoading || bookingsLoading;
  const isError = guidesError || rentalsError || spotsError || bookingsError;
  const errorMsg = guidesErrorMsg || rentalsErrorMsg || spotsErrorMsg || bookingsErrorMsg;

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} />;

  const guides = guidesData?.data || [];
  const rentals = rentalsData?.data || [];
  const spots = spotsData?.data || [];
  const bookings = bookingsData?.data || [];

  const stats = [
    {
      icon: '👤',
      label: 'Tour Guides',
      value: guides.length,
      color: colors.primary,
    },
    {
      icon: '📍',
      label: 'Spots',
      value: spots.length,
      color: '#FF9500',
    },
    {
      icon: '🏍️',
      label: 'Rentals',
      value: rentals.length,
      color: '#5AC8FA',
    },
    {
      icon: '📅',
      label: 'Bookings',
      value: bookings.length,
      color: '#4CD964',
    },
  ];

  const quickActions = [
    {
      icon: '📍',
      label: 'Add Spot',
      onPress: () => router.push('/(admin)/spots'),
    },
    {
      icon: '👤',
      label: 'Add Guide',
      onPress: () => router.push('/(admin)/index'),
    },
    {
      icon: '🏍️',
      label: 'Add Rental',
      onPress: () => router.push('/(admin)/index'),
    },
    {
      icon: '📅',
      label: 'View Bookings',
      onPress: () => router.push('/(admin)/index'),
    },
  ];

  const recentBookings = bookings.slice(0, 5);

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Welcome back, Admin!</Text>
            <Text style={styles.headerSubtitle}>Manage Siquijor with ease.</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(admin)/profile')}
            style={styles.notificationButton}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Statistics */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Pressable
                key={index}
                onPress={action.onPress}
                style={styles.quickActionCard}
              >
                <View style={styles.quickActionIconContainer}>
                  <Text style={styles.quickActionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              <Pressable onPress={() => router.push('/(admin)/index')}>
                <Text style={styles.viewAllLink}>View all</Text>
              </Pressable>
            </View>

            {recentBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingRow}>
                <View style={styles.bookingInfo}>
                  <View style={styles.guestInfo}>
                    {booking.guest?.avatar_url ? (
                      <Text style={styles.guestAvatar}>{booking.guest.name.charAt(0)}</Text>
                    ) : (
                      <Text style={styles.guestAvatar}>👤</Text>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.guestName}>{booking.guest?.name || 'Guest'}</Text>
                      <Text style={styles.bookingType}>{booking.tour_name || 'Booking'}</Text>
                      <Text style={styles.bookingDetails}>
                        {booking.pax_count} pax • {new Date(booking.start_date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <StatusBadge status={booking.status} />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  viewAllLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  bookingRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  guestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 40,
  },
  guestName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bookingType: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  bookingDetails: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

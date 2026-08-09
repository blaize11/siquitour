import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useBookings } from '../../../src/api/queries/bookings';
import { EmptyState, ErrorView, LoadingView, ScreenContainer, colors, spacing, typography } from '../../../src/components';
import { StatusBadge } from '../../../src/components/RoleBadge';
import { extractErrorMessage } from '../../../src/components/ErrorView';
import type { Booking, Rental, User } from '../../../src/types/api';

function bookingTitle(booking: Booking): string {
  if (booking.bookable_type === 'App\\Models\\User') {
    return (booking.bookable as User | undefined)?.name ?? 'Tour guide';
  }
  return (booking.bookable as Rental | undefined)?.title ?? 'Rental';
}

function getBookingIcon(booking: Booking): string {
  if (booking.bookable_type === 'App\\Models\\User') {
    return '👤';
  }
  return '🏍️';
}

export default function GuestBookingsScreen() {
  const { data, isLoading, isError, error, refetch } = useBookings();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const bookings = data?.data || [];

  // Group bookings by status
  const upcomingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>Track your adventures and rentals</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState message="You haven't booked anything yet." />
          <Pressable
            style={styles.browseButton}
            onPress={() => router.push('/(guest)/index')}
          >
            <Text style={styles.browseButtonText}>Browse Tours & Rentals</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                <Text style={styles.sectionBadge}>{upcomingBookings.length}</Text>
              </View>
              <View style={styles.bookingsList}>
                {upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    title={bookingTitle(booking)}
                    icon={getBookingIcon(booking)}
                    onPress={() => router.push(`/(guest)/bookings/${booking.id}`)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Completed Bookings */}
          {completedBookings.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Completed</Text>
                <Text style={styles.sectionBadge}>{completedBookings.length}</Text>
              </View>
              <View style={styles.bookingsList}>
                {completedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    title={bookingTitle(booking)}
                    icon={getBookingIcon(booking)}
                    onPress={() => router.push(`/(guest)/bookings/${booking.id}`)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cancelled</Text>
                <Text style={styles.sectionBadge}>{cancelledBookings.length}</Text>
              </View>
              <View style={styles.bookingsList}>
                {cancelledBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    title={bookingTitle(booking)}
                    icon={getBookingIcon(booking)}
                    onPress={() => router.push(`/(guest)/bookings/${booking.id}`)}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={{ height: spacing.lg }} />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

interface BookingCardProps {
  booking: Booking;
  title: string;
  icon: string;
  onPress: () => void;
}

function BookingCard({ booking, title, icon, onPress }: BookingCardProps) {
  const startDate = new Date(booking.start_date);
  const endDate = booking.end_date ? new Date(booking.end_date) : null;

  return (
    <Pressable onPress={onPress} style={styles.bookingCard}>
      <View style={styles.bookingCardContent}>
        {/* Left side - Icon and Info */}
        <View style={styles.bookingCardLeft}>
          <Text style={styles.bookingIcon}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingTitle} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.dateRange}>
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              {endDate && (
                <>
                  <Text style={styles.dateSeparator}>→</Text>
                  <Text style={styles.dateText}>
                    {endDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Right side - Price and Status */}
        <View style={styles.bookingCardRight}>
          <Text style={styles.bookingPrice}>₱{booking.total_price.toLocaleString()}</Text>
          <StatusBadge status={booking.status} />
        </View>
      </View>

      {/* Divider */}
      <View style={styles.bookingDivider} />

      {/* Footer - Pax and Actions */}
      <View style={styles.bookingFooter}>
        <Text style={styles.bookingDetails}>{booking.pax_count} pax</Text>
        <Text style={styles.viewDetailsLink}>View Details →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: 'rgba(14, 124, 123, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  bookingsList: {
    gap: spacing.md,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  bookingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  bookingIcon: {
    fontSize: 32,
  },
  bookingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dateSeparator: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bookingCardRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  bookingDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  bookingDetails: {
    fontSize: 12,
    color: colors.textMuted,
  },
  viewDetailsLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  useAcceptBooking,
  useBookings,
  useCompleteBooking,
  useDeclineBooking,
} from '../../src/api/queries/bookings';
import { useGuides } from '../../src/api/queries/guides';
import { useSpots } from '../../src/api/queries/spots';
import {
  SpotCard,
  ImageCarousel,
  Button,
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  spacing,
  typography,
} from '../../src/components';
import { StatusBadge } from '../../src/components/RoleBadge';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function GuideHomeScreen() {
  const { data: guideData, isLoading: guideLoading, isError: guideError, error: guideErrorMsg } = useGuides();
  const { data: bookingData, isLoading: bookingLoading, isError: bookingError, error: bookingErrorMsg, refetch: refetchBookings } = useBookings();
  const { data: spotsData } = useSpots();

  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();
  const completeBooking = useCompleteBooking();

  const isLoading = guideLoading || bookingLoading;
  const isError = guideError || bookingError;
  const errorMsg = guideErrorMsg || bookingErrorMsg;

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} onRetry={refetchBookings} />;

  // Get current guide (assuming first guide in list is current user)
  const currentGuide = guideData?.data?.[0];
  const bookings = bookingData?.data || [];
  const todayBookings = bookings.filter((b) =>
    new Date(b.start_date).toDateString() === new Date().toDateString()
  );
  const spots = spotsData?.data || [];

  const handleAccept = (bookingId: string) => {
    acceptBooking.mutate(bookingId);
  };

  const handleDecline = (bookingId: string) => {
    declineBooking.mutate(bookingId);
  };

  const handleComplete = (bookingId: string) => {
    completeBooking.mutate(bookingId);
  };

  return (
    <ScreenContainer scroll={true} style={{ padding: 0 }}>
      {/* Header with Profile */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Profile Photo */}
          {currentGuide?.avatar_url ? (
            <Image
              source={{ uri: currentGuide.avatar_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.placeholderText}>👤</Text>
            </View>
          )}

          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hi, {currentGuide?.name || 'Guide'}!</Text>
            <Text style={styles.subGreeting}>Ready for today's adventure?</Text>
          </View>
        </View>

        {/* Availability Badge */}
        <View style={styles.availabilityBadge}>
          <View style={[styles.availabilityDot, styles.availableDot]} />
          <Text style={styles.availabilityText}>Available</Text>
        </View>
      </View>

      <View>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="📅"
            label="My Bookings"
            onPress={() => router.push('/(guide)/')}
          />
          <QuickActionButton
            icon="🗺️"
            label="My Tours"
            onPress={() => {}}
          />
          <QuickActionButton
            icon="💰"
            label="Earnings"
            onPress={() => {}}
          />
          <QuickActionButton
            icon="⭐"
            label="Reviews"
            onPress={() => {}}
          />
        </View>

        {/* Today's Bookings */}
        {todayBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Bookings</Text>
              <Pressable onPress={() => router.push('/(guide)/bookings')}>
                <Text style={styles.seeAll}>View all</Text>
              </Pressable>
            </View>

            {todayBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAccept={() => handleAccept(String(booking.id))}
                onDecline={() => handleDecline(String(booking.id))}
                onComplete={() => handleComplete(String(booking.id))}
                busy={acceptBooking.isPending || declineBooking.isPending || completeBooking.isPending}
              />
            ))}
          </View>
        )}

        {/* Nearby/Popular Spots */}
        {spots.length > 0 && (
          <View style={styles.section}>
            <ImageCarousel
              title="Nearby You"
              seeAllText="See all"
              onSeeAll={() => {}}
              data={spots.slice(0, 5)}
              renderItem={(spot) => (
                <SpotCard
                  key={spot.id}
                  id={spot.id}
                  name={spot.name}
                  imageUrl={spot.image_url}
                  category={spot.category}
                  rating={spot.rating}
                  reviewCount={spot.review_count}
                  distance={spot.distance}
                  municipality={spot.municipality}
                  onPress={() => {}}
                  onFavorite={() => {}}
                  isFavorite={false}
                />
              )}
            />
          </View>
        )}

        {/* Popular Spots Section */}
        {spots.length > 5 && (
          <View style={styles.section}>
            <ImageCarousel
              title="Popular Spots"
              data={spots.slice(5)}
              renderItem={(spot) => (
                <SpotCard
                  key={spot.id}
                  id={spot.id}
                  name={spot.name}
                  imageUrl={spot.image_url}
                  category={spot.category}
                  rating={spot.rating}
                  reviewCount={spot.review_count}
                  distance={spot.distance}
                  municipality={spot.municipality}
                  onPress={() => {}}
                  onFavorite={() => {}}
                  isFavorite={false}
                />
              )}
            />
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </View>
    </ScreenContainer>
  );
}

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function QuickActionButton({ icon, label, onPress }: QuickActionButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.quickActionButton}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

interface BookingCardProps {
  booking: any;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
  busy: boolean;
}

function BookingCard({ booking, onAccept, onDecline, onComplete, busy }: BookingCardProps) {
  return (
    <View style={styles.bookingCard}>
      {/* Guest Avatar and Basic Info */}
      <View style={styles.bookingHeader}>
        {booking.guest?.avatar_url ? (
          <Image
            source={{ uri: booking.guest.avatar_url }}
            style={styles.guestAvatar}
          />
        ) : (
          <View style={[styles.guestAvatar, styles.guestAvatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>👤</Text>
          </View>
        )}

        <View style={styles.guestInfo}>
          <Text style={styles.bookingGuestName}>{booking.guest?.name || 'Guest'}</Text>
          <Text style={styles.guestRole}>{booking.guest?.role || 'Tourist'}</Text>
          <StatusBadge status={booking.status} />
        </View>
      </View>

      {/* Booking Details */}
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Date</Text>
          <Text style={styles.detailValue}>
            {new Date(booking.start_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🕐 Time</Text>
          <Text style={styles.detailValue}>
            {new Date(booking.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>👥 Guests</Text>
          <Text style={styles.detailValue}>{booking.pax_count} {booking.pax_count === 1 ? 'Pax' : 'Pax'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🎯 Tour</Text>
          <Text style={styles.detailValue}>{booking.tour_name || 'Tour Package'}</Text>
        </View>
        {booking.total_price && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰 Price</Text>
            <Text style={styles.detailValue}>₱{parseFloat(booking.total_price).toLocaleString()}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {booking.status === 'pending' && (
        <View style={styles.bookingActions}>
          <Pressable
            style={[styles.bookingActionButton, styles.acceptButton]}
            onPress={onAccept}
            disabled={busy}
          >
            <Text style={styles.acceptButtonText}>✓ Accept</Text>
          </Pressable>
          <Pressable
            style={[styles.bookingActionButton, styles.declineButton]}
            onPress={onDecline}
            disabled={busy}
          >
            <Text style={styles.declineButtonText}>✕ Decline</Text>
          </Pressable>
        </View>
      )}

      {booking.status === 'accepted' && (
        <Pressable
          style={[styles.bookingActionButton, styles.completeButton]}
          onPress={onComplete}
          disabled={busy}
        >
          <Text style={styles.completeButtonText}>✓ Mark Completed</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
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
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availableDot: {
    backgroundColor: '#4CAF50',
  },
  availabilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionIcon: {
    fontSize: 28,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
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
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingImagePlaceholder: {
    fontSize: 40,
  },
  bookingContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  guestAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
  },
  guestAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 28,
  },
  guestInfo: {
    flex: 1,
  },
  bookingGuestName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  guestRole: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  bookingDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  bookingTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bookingActionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#f0f0f0',
  },
  declineButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: colors.primary,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

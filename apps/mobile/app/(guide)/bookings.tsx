import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  useAcceptBooking,
  useBookings,
  useCompleteBooking,
  useDeclineBooking,
} from '../../src/api/queries/bookings';
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

type BookingStatus = 'all' | 'pending' | 'accepted' | 'completed' | 'declined';

export default function GuideBookingsScreen() {
  const [activeStatus, setActiveStatus] = useState<BookingStatus>('all');

  const { data: bookingData, isLoading, isError, error: errorMsg, refetch } = useBookings();
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();
  const completeBooking = useCompleteBooking();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} onRetry={refetch} />;

  const bookings = bookingData?.data || [];

  // Filter bookings by status
  const filteredBookings = activeStatus === 'all'
    ? bookings
    : bookings.filter((b: any) => b.status === activeStatus);

  // Group bookings by date
  const groupedBookings = filteredBookings.reduce((acc: any, booking: any) => {
    const date = new Date(booking.start_date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

  const bookingStatuses = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'pending', label: 'Pending', count: bookings.filter((b: any) => b.status === 'pending').length },
    { key: 'accepted', label: 'Accepted', count: bookings.filter((b: any) => b.status === 'accepted').length },
    { key: 'completed', label: 'Completed', count: bookings.filter((b: any) => b.status === 'completed').length },
    { key: 'declined', label: 'Declined', count: bookings.filter((b: any) => b.status === 'declined').length },
  ];

  const handleAccept = (bookingId: string) => {
    acceptBooking.mutate(bookingId);
  };

  const handleDecline = (bookingId: string) => {
    declineBooking.mutate(bookingId);
  };

  const handleComplete = (bookingId: string) => {
    completeBooking.mutate(bookingId);
  };

  const busy = acceptBooking.isPending || declineBooking.isPending || completeBooking.isPending;

  return (
    <ScreenContainer scroll={true} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Status Filters */}
      <View style={styles.filterContainer}>
        {bookingStatuses.map((status) => (
          <Pressable
            key={status.key}
            onPress={() => setActiveStatus(status.key as BookingStatus)}
            style={[
              styles.filterChip,
              activeStatus === status.key && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                activeStatus === status.key && styles.filterLabelActive,
              ]}
            >
              {status.label}
            </Text>
            <Text
              style={[
                styles.filterCount,
                activeStatus === status.key && styles.filterCountActive,
              ]}
            >
              {status.count}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Bookings List */}
      <View style={styles.bookingsList}>
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>
              {activeStatus === 'all'
                ? 'You don\'t have any bookings yet'
                : `You don\'t have any ${activeStatus} bookings`}
            </Text>
          </View>
        ) : (
          Object.entries(groupedBookings).map(([date, dateBookings]: [string, any]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>{date}</Text>
              {(dateBookings as any[]).map((booking: any) => (
                <BookingDetailCard
                  key={booking.id}
                  booking={booking}
                  onAccept={() => handleAccept(String(booking.id))}
                  onDecline={() => handleDecline(String(booking.id))}
                  onComplete={() => handleComplete(String(booking.id))}
                  busy={busy}
                />
              ))}
            </View>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

interface BookingDetailCardProps {
  booking: any;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
  busy: boolean;
}

function BookingDetailCard({
  booking,
  onAccept,
  onDecline,
  onComplete,
  busy,
}: BookingDetailCardProps) {
  const startTime = new Date(booking.start_date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const endTime = booking.end_date
    ? new Date(booking.end_date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <View style={styles.bookingCard}>
      {/* Guest Info & Status */}
      <View style={styles.bookingTop}>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{booking.guest?.name || 'Guest'}</Text>
          <Text style={styles.guestEmail}>{booking.guest?.email}</Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      {/* Tour Details */}
      <View style={styles.tourDetails}>
        <DetailRow icon="🗺️" label="Tour" value={booking.tour_name || 'Tour'} />
        <DetailRow icon="⏰" label="Time" value={`${startTime}${endTime ? ` - ${endTime}` : ''}`} />
        <DetailRow icon="👥" label="Guests" value={`${booking.pax_count} Pax`} />
        {booking.notes && (
          <DetailRow icon="💬" label="Notes" value={booking.notes} />
        )}
      </View>

      {/* Actions based on status */}
      {booking.status === 'pending' && (
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.button, styles.acceptButton]}
            onPress={onAccept}
            disabled={busy}
          >
            <Text style={styles.acceptButtonText}>✓ Accept</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.declineButton]}
            onPress={onDecline}
            disabled={busy}
          >
            <Text style={styles.declineButtonText}>✕ Decline</Text>
          </Pressable>
        </View>
      )}

      {booking.status === 'accepted' && (
        <Pressable
          style={[styles.button, styles.completeButton]}
          onPress={onComplete}
          disabled={busy}
        >
          <Text style={styles.completeButtonText}>✓ Mark Complete</Text>
        </Pressable>
      )}

      {booking.status === 'completed' && (
        <Pressable
          style={[styles.button, styles.reviewButton]}
          onPress={() => router.push(`/(guide)/bookings/${booking.id}`)}
        >
          <Text style={styles.reviewButtonText}>👁️ View Reviews</Text>
        </Pressable>
      )}

      {booking.status === 'declined' && (
        <View style={styles.declinedBadge}>
          <Text style={styles.declinedText}>✕ Booking Declined</Text>
        </View>
      )}
    </View>
  );
}

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterChip: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  filterLabelActive: {
    color: '#fff',
  },
  filterCount: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  filterCountActive: {
    color: '#fff',
  },

  bookingsList: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },

  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },

  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  guestEmail: {
    fontSize: 12,
    color: colors.textMuted,
  },

  tourDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  detailIcon: {
    fontSize: 16,
    marginTop: 2,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButton: {
    backgroundColor: colors.success,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  declineButton: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  declineButtonText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13,
  },

  completeButton: {
    backgroundColor: colors.primary,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  reviewButton: {
    backgroundColor: colors.primary,
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  declinedBadge: {
    backgroundColor: '#ffebee',
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  declinedText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13,
  },
});

import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, colors, spacing, LoadingView } from '../components';

export default function RenterHomeScreen() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Explore Rentals',
      icon: 'map',
      color: colors.primary,
      onPress: () => router.push('/(renter)/explore'),
    },
    {
      title: 'My Listings',
      icon: 'home',
      color: '#FF6B6B',
      onPress: () => router.push('/(renter)/'),
    },
    {
      title: 'Bookings',
      icon: 'calendar',
      color: '#4ECDC4',
      onPress: () => router.push('/(renter)/bookings/index'),
    },
    {
      title: 'Reviews',
      icon: 'star',
      color: '#FFD93D',
      onPress: () => router.push('/(renter)/reviews'),
    },
    {
      title: 'Messages',
      icon: 'chatbubble-ellipses',
      color: '#9B59B6',
      onPress: () => router.push('/(renter)/chat/index'),
    },
  ];

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, Host! 👋</Text>
            <Text style={styles.subGreeting}>Manage your properties & guests</Text>
          </View>
          <Ionicons name="person-circle" size={48} color="#fff" />
        </View>

        {/* Performance Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>🏠</Text>
              <Text style={styles.statValue}>5</Text>
            </View>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>8</Text>
            </View>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>4.9</Text>
            </View>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <Pressable
                key={index}
                onPress={action.onPress}
                style={styles.actionCard}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Add New Listing CTA */}
        <View style={styles.section}>
          <Pressable
            style={styles.ctaCard}
            onPress={() => router.push('/(renter)/rentals/new')}
          >
            <View style={styles.ctaIcon}>
              <Ionicons name="add-circle" size={32} color="#fff" />
            </View>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Add New Property</Text>
              <Text style={styles.ctaDesc}>List a new rental and start earning</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={[styles.activityBadge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.activityIcon}>✅</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Booking Confirmed</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <View style={[styles.activityBadge, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.activityIcon}>⭐</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Guest Left a Review</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <View style={[styles.activityBadge, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.activityIcon}>💬</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Message from Guest</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </View>


        {/* Upcoming Bookings */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
            <Pressable>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.bookingCard}>
            <View style={styles.bookingLeft}>
              <Text style={styles.bookingDate}>Aug 20-24</Text>
              <Text style={styles.bookingGuest}>John Smith</Text>
            </View>
            <View style={styles.bookingMiddle}>
              <Text style={styles.bookingProperty}>Beachfront Villa</Text>
              <Text style={styles.bookingPrice}>₱12,000</Text>
            </View>
            <View style={styles.bookingRight}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  statIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  ctaCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ctaIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  ctaDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  activityBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  bookingLeft: {
    gap: 4,
  },
  bookingDate: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  bookingGuest: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  bookingMiddle: {
    flex: 1,
    gap: 2,
  },
  bookingProperty: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  bookingPrice: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  bookingRight: {
    justifyContent: 'center',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  feedCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: 120,
  },
  feedAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  feedName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  feedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  feedRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  spotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  spotIcon: {
    fontSize: 24,
  },
  spotContent: {
    flex: 1,
  },
  spotName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  spotLocation: {
    fontSize: 11,
    color: colors.textMuted,
  },
});

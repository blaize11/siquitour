import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, colors, spacing, LoadingView } from '../components';

export default function GuideHomeScreen() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'My Bookings',
      icon: 'calendar',
      color: colors.primary,
      onPress: () => router.push('/(guide)/'),
    },
    {
      title: 'Availability',
      icon: 'time',
      color: '#4ECDC4',
      onPress: () => router.push('/(guide)/availability'),
    },
    {
      title: 'Reviews',
      icon: 'star',
      color: '#FFD93D',
      onPress: () => router.push('/(guide)/reviews'),
    },
    {
      title: 'Messages',
      icon: 'chatbubble-ellipses',
      color: '#FF6B6B',
      onPress: () => router.push('/(guide)/chat/index'),
    },
  ];

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Guide! 👋</Text>
            <Text style={styles.subGreeting}>Manage your tours & bookings</Text>
          </View>
          <Ionicons name="person-circle" size={48} color="#fff" />
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>📅</Text>
              <Text style={styles.metricValue}>12</Text>
            </View>
            <Text style={styles.metricLabel}>Total Bookings</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>⭐</Text>
              <Text style={styles.metricValue}>4.8</Text>
            </View>
            <Text style={styles.metricLabel}>Avg Rating</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>💰</Text>
              <Text style={styles.metricValue}>₱8.5k</Text>
            </View>
            <Text style={styles.metricLabel}>This Month</Text>
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

        {/* Pending Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Actions</Text>
          <View style={styles.pendingCard}>
            <View style={styles.pendingBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
            <View style={styles.pendingContent}>
              <Text style={styles.pendingTitle}>New Booking Requests</Text>
              <Text style={styles.pendingDesc}>Review and respond to guest requests</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </View>
          <View style={styles.pendingCard}>
            <View style={[styles.pendingBadge, { backgroundColor: '#FFD93D' }]}>
              <Text style={styles.badgeText}>5</Text>
            </View>
            <View style={styles.pendingContent}>
              <Text style={styles.pendingTitle}>Awaiting Reviews</Text>
              <Text style={styles.pendingDesc}>Guests can now leave reviews</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </View>
        </View>


        {/* Upcoming Tours */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={styles.sectionTitle}>Upcoming Tours</Text>
            <Pressable>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.tourCard}>
            <Text style={styles.tourDate}>Tomorrow, 9:00 AM</Text>
            <Text style={styles.tourTitle}>Mountain Hiking Adventure</Text>
            <View style={styles.tourDetails}>
              <View style={styles.tourDetail}>
                <Ionicons name="people" size={14} color={colors.textMuted} />
                <Text style={styles.tourDetailText}>4 guests</Text>
              </View>
              <View style={styles.tourDetail}>
                <Ionicons name="location" size={14} color={colors.textMuted} />
                <Text style={styles.tourDetailText}>Mt. Pulag</Text>
              </View>
            </View>
            <Pressable style={styles.tourAction}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Manage Tour</Text>
            </Pressable>
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
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  metricLabel: {
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
  pendingCard: {
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
  pendingBadge: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  pendingContent: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  pendingDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tourCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tourDate: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tourTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  tourDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  tourDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tourDetailText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tourAction: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedRentalCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    width: 140,
  },
  rentalImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: colors.border,
  },
  rentalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  feedName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.textMuted,
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

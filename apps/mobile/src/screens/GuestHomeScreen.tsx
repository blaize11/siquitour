import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, colors, spacing } from '../components';

export default function GuestHomeScreen() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Explore Tours',
      icon: 'map',
      color: colors.primary,
      onPress: () => router.push('/(guest)/'),
    },
    {
      title: 'My Bookings',
      icon: 'calendar',
      color: '#FF6B6B',
      onPress: () => router.push('/(guest)/bookings/index'),
    },
    {
      title: 'Messages',
      icon: 'chatbubble-ellipses',
      color: '#4ECDC4',
      onPress: () => router.push('/(guest)/chat/index'),
    },
    {
      title: 'My Reviews',
      icon: 'star',
      color: '#FFD93D',
      onPress: () => router.push('/(guest)/reviews'),
    },
  ];

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back! 👋</Text>
            <Text style={styles.subGreeting}>Ready for your next adventure?</Text>
          </View>
          <Ionicons name="person-circle" size={48} color="#fff" />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Reviews Given</Text>
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


        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore More</Text>
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationIcon}>🗺️</Text>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Discover Top Tours</Text>
              <Text style={styles.recommendationDesc}>
                Explore the best guided tours in your area
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </View>
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationIcon}>🏠</Text>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Browse Rentals</Text>
              <Text style={styles.recommendationDesc}>
                Find unique places to stay nearby
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <Pressable style={styles.helpCard}>
            <Text style={styles.helpIcon}>❓</Text>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Contact Support</Text>
              <Text style={styles.helpDesc}>Get help with your bookings and account</Text>
            </View>
          </Pressable>
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
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
  recommendationCard: {
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
  recommendationIcon: {
    fontSize: 32,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  recommendationDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 124, 123, 0.05)',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    gap: spacing.md,
  },
  helpIcon: {
    fontSize: 32,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  helpDesc: {
    fontSize: 12,
    color: colors.textMuted,
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

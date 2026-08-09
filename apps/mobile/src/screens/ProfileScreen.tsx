import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../auth/SessionContext';
import { Button, RoleBadge, ScreenContainer, colors, spacing, typography } from '../components';

export function ProfileScreen({ children }: { children?: ReactNode }) {
  const { user, logout } = useSession();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Profile Image */}
          {user.profile_image_url ? (
            <Image source={{ uri: user.profile_image_url }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}

          {/* Role Badge */}
          <View style={styles.roleBadgeContainer}>
            <RoleBadge role={user.role} />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{user.name}</Text>

          <View style={styles.detailsContainer}>
            <DetailRow icon="📧" label="Email" value={user.email} />
            {user.phone && <DetailRow icon="📞" label="Phone" value={user.phone} />}
            {user.municipality && (
              <DetailRow icon="📍" label="Location" value={user.municipality} />
            )}
          </View>
        </View>

        {/* Quick Stats */}
        {user.role === 'tour_guide' && (
          <View style={styles.statsSection}>
            <StatCard label="Bookings" value="0" icon="📅" />
            <StatCard label="Rating" value="0" icon="⭐" />
            <StatCard label="Earnings" value="₱0" icon="💰" />
          </View>
        )}

        {user.role === 'renter' && (
          <View style={styles.statsSection}>
            <StatCard label="Rentals" value="0" icon="🏍️" />
            <StatCard label="Bookings" value="0" icon="📅" />
            <StatCard label="Earnings" value="₱0" icon="💰" />
          </View>
        )}

        {/* Additional Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <MenuButton icon="🔐" label="Change Password" onPress={() => {}} />
          <MenuButton icon="🔔" label="Notifications" onPress={() => {}} />
          <MenuButton icon="⚙️" label="Preferences" onPress={() => {}} />
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <MenuButton icon="❓" label="FAQ" onPress={() => {}} />
          <MenuButton icon="💬" label="Contact Support" onPress={() => {}} />
          <MenuButton icon="📋" label="Terms & Privacy" onPress={() => {}} />
        </View>

        {/* Additional Content (from children) */}
        {children}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button title="Log Out" variant="danger" onPress={() => logout()} />
        </View>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
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
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
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

interface MenuButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function MenuButton({ icon, label, onPress }: MenuButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.menuButton}>
      <View style={styles.menuButtonContent}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.primary,
    paddingTop: spacing.lg,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileImagePlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  roleBadgeContainer: {
    marginTop: spacing.md,
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statsSection: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
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
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    fontSize: 15,
    color: colors.text,
  },
  menuArrow: {
    fontSize: 20,
    color: colors.textMuted,
  },
  logoutContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
});

import { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { apiFetch } from '../../src/api/client';
import {
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  spacing,
  typography,
  Button,
} from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'guest' | 'tour_guide' | 'renter' | 'admin';
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  email_verified_at?: string;
  tour_guide_profile?: {
    verification_status: 'not_submitted' | 'pending_review' | 'approved' | 'rejected';
  };
  created_at: string;
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'guest' | 'tour_guide' | 'renter' | 'admin'>('all');
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await apiFetch<{ data: User[] }>('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setIsError(true);
      setErrorMsg(extractErrorMessage(err, 'Failed to load users'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#FF5252';
      case 'tour_guide':
        return '#2196F3';
      case 'renter':
        return '#FF9800';
      case 'guest':
        return '#4CAF50';
      default:
        return colors.textMuted;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👨‍💼';
      case 'tour_guide':
        return '🧑‍🏫';
      case 'renter':
        return '🏍️';
      case 'guest':
        return '👤';
      default:
        return '❓';
    }
  };

  const getVerificationBadge = (user: User) => {
    if (user.role !== 'tour_guide') return null;

    const status = user.tour_guide_profile?.verification_status;
    switch (status) {
      case 'approved':
        return { icon: '✓', label: 'Verified', color: '#4CAF50' };
      case 'pending_review':
        return { icon: '⏳', label: 'Pending', color: '#FFA500' };
      case 'rejected':
        return { icon: '✕', label: 'Rejected', color: '#FF5252' };
      default:
        return { icon: '⚠️', label: 'Not Verified', color: '#9E9E9E' };
    }
  };

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={errorMsg} onRetry={loadUsers} />;

  const roleStats = {
    all: users.length,
    guest: users.filter((u) => u.role === 'guest').length,
    tour_guide: users.filter((u) => u.role === 'tour_guide').length,
    renter: users.filter((u) => u.role === 'renter').length,
    admin: users.filter((u) => u.role === 'admin').length,
  };

  const pendingVerifications = users.filter(
    (u) => u.role === 'tour_guide' && u.tour_guide_profile?.verification_status === 'pending_review'
  ).length;

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Users Management</Text>
          <Text style={styles.headerSubtitle}>View and manage all users</Text>
        </View>
      </View>

      {/* Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer} contentContainerStyle={styles.statsContent}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{roleStats.all}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{roleStats.tour_guide}</Text>
          <Text style={styles.statLabel}>Tour Guides</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingVerifications}</Text>
          <Text style={styles.statLabel}>Pending Verify</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{roleStats.renter}</Text>
          <Text style={styles.statLabel}>Renters</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{roleStats.guest}</Text>
          <Text style={styles.statLabel}>Guests</Text>
        </View>
      </ScrollView>

      {/* Role Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { label: 'All', role: 'all' },
          { label: 'Tour Guides', role: 'tour_guide' },
          { label: 'Renters', role: 'renter' },
          { label: 'Guests', role: 'guest' },
          { label: 'Admins', role: 'admin' },
        ].map((filter) => (
          <Pressable
            key={filter.role}
            onPress={() => setSelectedRole(filter.role as any)}
            style={[styles.filterTab, selectedRole === filter.role && styles.filterTabActive]}
          >
            <Text style={[styles.filterLabel, selectedRole === filter.role && styles.filterLabelActive]}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search users...</Text>
      </View>

      {/* Users List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          filteredUsers.map((user) => {
            const badge = getVerificationBadge(user);
            const isExpanded = expandedUserId === user.id;

            return (
              <Pressable
                key={user.id}
                onPress={() => setExpandedUserId(isExpanded ? null : user.id)}
                style={styles.userCard}
              >
                {/* User Header */}
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    {user.avatar_url ? (
                      <Image source={{ uri: user.avatar_url }} style={styles.userAvatar} />
                    ) : (
                      <View style={[styles.userAvatar, { backgroundColor: getRoleColor(user.role) }]}>
                        <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      <View style={styles.userMeta}>
                        <View
                          style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}
                        >
                          <Text style={[styles.roleIcon, { marginRight: 4 }]}>
                            {getRoleIcon(user.role)}
                          </Text>
                          <Text style={[styles.roleLabel, { color: getRoleColor(user.role) }]}>
                            {user.role === 'tour_guide' ? 'Tour Guide' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Text>
                        </View>
                        {badge && (
                          <View style={[styles.verificationBadge, { backgroundColor: badge.color + '20' }]}>
                            <Text style={styles.badgeIcon}>{badge.icon}</Text>
                            <Text style={[styles.badgeLabel, { color: badge.color }]}>
                              {badge.label}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </View>

                {/* Expanded Content */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ID</Text>
                      <Text style={styles.detailValue}>#{user.id}</Text>
                    </View>
                    {user.phone && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Phone</Text>
                        <Text style={styles.detailValue}>{user.phone}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <Text style={[styles.detailValue, { color: user.status === 'active' ? '#4CAF50' : '#FF5252' }]}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email Verified</Text>
                      <Text style={[styles.detailValue, { color: user.email_verified_at ? '#4CAF50' : '#FF9800' }]}>
                        {user.email_verified_at ? '✓ Yes' : '✕ No'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Joined</Text>
                      <Text style={styles.detailValue}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* Actions */}
                    {user.role === 'tour_guide' && (
                      <Pressable
                        style={styles.actionButton}
                        onPress={() => router.push('/(admin)/guide-verifications')}
                      >
                        <Text style={styles.actionButtonText}>📋 View Verification</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    gap: spacing.md,
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
    color: '#fff',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  statsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },

  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: colors.textMuted,
  },

  listContainer: {
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

  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    padding: spacing.md,
  },

  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },

  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  userAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },

  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },

  userMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },

  roleIcon: {
    fontSize: 12,
  },

  roleLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },

  badgeIcon: {
    fontSize: 12,
    marginRight: 2,
  },

  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  expandIcon: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },

  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },

  actionButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },

  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

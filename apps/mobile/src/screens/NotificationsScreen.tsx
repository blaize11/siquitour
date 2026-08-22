import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useNotificationNavigation,
  type Notification,
} from '../api/queries/notifications';
import {
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  spacing,
  typography,
} from '../components';
import { extractErrorMessage } from '../components/ErrorView';

export function NotificationsScreen() {
  const { data, isLoading, isError, error: errorMsg, refetch } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  const handleNotificationClick = useNotificationNavigation();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(errorMsg)} onRetry={refetch} />;

  const notifications = data?.data || [];
  const unreadCount = data?.unread_count || 0;

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead.mutate(notificationId);
  };

  const handleDelete = (notificationId: number) => {
    deleteNotification.mutate(notificationId);
  };

  const handleNotificationPress = (notification: Notification) => {
    handleNotificationClick(notification);
  };

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            style={styles.markAllButton}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>You'll see activity updates here</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => handleNotificationPress(notification)}
              style={[
                styles.notificationCard,
                !notification.read_at && styles.notificationCardUnread,
              ]}
            >
              <View style={styles.notificationContent}>
                <Text style={styles.notificationIcon}>{notification.icon}</Text>
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.notificationActions}>
                {!notification.read_at && (
                  <Pressable
                    onPress={() => handleMarkAsRead(notification.id)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionText}>✓</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => handleDelete(notification.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
          <View style={{ height: spacing.lg }} />
        </ScrollView>
      )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  markAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  notificationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.border,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationCardUnread: {
    borderLeftColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  notificationTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#d32f2f',
    fontWeight: '700',
    fontSize: 12,
  },
});

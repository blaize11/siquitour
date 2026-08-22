import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { apiFetch } from '../client';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  icon: string;
  related_id?: number;
  related_type?: string;
  read_at?: string | null;
  created_at: string;
  // Navigation routing - format: "screen:id" e.g., "booking:123"
  action?: string | null;
}

export interface NotificationsResponse {
  data: Notification[];
  unread_count: number;
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      return apiFetch<NotificationsResponse>('/notifications');
    },
    refetchInterval: 2000, // Refetch every 2 seconds for near real-time updates
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      return apiFetch<Notification>(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
        body: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiFetch('/notifications/read-all', {
        method: 'POST',
        body: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      return apiFetch(`/notifications/${notificationId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to handle notification click navigation.
 * Automatically navigates to the relevant screen and marks notification as read.
 *
 * Usage:
 * ```
 * const handleNotificationClick = useNotificationNavigation();
 * handleNotificationClick(notification);
 * ```
 */
export function useNotificationNavigation() {
  const router = useRouter();
  const markAsRead = useMarkNotificationAsRead();

  return (notification: Notification) => {
    // Mark as read
    if (notification.id) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on action
    if (!notification.action) {
      console.warn('No action routing configured for notification type:', notification.type);
      return;
    }

    const [screen, idString] = notification.action.split(':');
    const id = parseInt(idString, 10);

    // Validate ID was parsed correctly
    if (isNaN(id)) {
      console.error('Invalid notification ID:', idString, 'from action:', notification.action);
      return;
    }

    switch (screen) {
      // Booking notifications (for guests, guides, renters)
      case 'booking':
        router.push(`/(tabs)/bookings/${id}`);
        break;

      // Chat/Message notifications
      case 'conversation':
        router.push(`/(tabs)/chat/${id}`);
        break;

      // Review notifications
      case 'review':
        router.push(`/(tabs)/bookings/${id}`);
        break;

      // User profile notifications (follow, etc)
      case 'user_profile':
        router.push(`/guide/${id}`);
        break;

      default:
        console.warn('Unknown notification action screen:', screen);
    }
  };
}

/**
 * Get unread notification count.
 *
 * Usage:
 * ```
 * const { unreadCount, isLoading } = useUnreadNotificationCount();
 * <View>{unreadCount > 0 && <Badge>{unreadCount}</Badge>}</View>
 * ```
 */
export function useUnreadNotificationCount() {
  const { data, isLoading } = useNotifications();
  return {
    unreadCount: data?.unread_count ?? 0,
    isLoading,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  icon: string;
  related_id?: number;
  related_type?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
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
    refetchInterval: 5000, // Refetch every 5 seconds for near-real-time updates
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

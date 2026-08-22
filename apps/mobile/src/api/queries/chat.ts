import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { Conversation, Message, Paginated } from '../../types/api';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiFetch<Paginated<Conversation>>('/conversations'),
    refetchInterval: 3000, // Refetch every 3 seconds for near real-time updates
    staleTime: 0, // Data is immediately stale, so refetch is always used when needed
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      apiFetch<Conversation>('/conversations', { method: 'POST', body: { user_id: userId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
}

export function useMessages(conversationId: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: () => apiFetch<Paginated<Message>>(`/conversations/${conversationId}/messages`),
    enabled: Number.isFinite(conversationId),
    refetchInterval: 2000, // Refetch every 2 seconds for near real-time updates
    onSuccess: (data) => {
      // Invalidate notifications to show new message notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      apiFetch<Message>(`/conversations/${conversationId}/messages`, { method: 'POST', body: { body } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkMessagesAsRead(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/conversations/${conversationId}/messages/mark-read`, { method: 'POST', body: {} }),
    onSuccess: () => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.refetchQueries({ queryKey: ['conversations'] });

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.refetchQueries({ queryKey: ['notifications'] });

      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
    },
  });
}

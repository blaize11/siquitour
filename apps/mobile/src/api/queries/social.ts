import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      apiFetch<{ following: boolean }>(`/users/${userId}/follow`, { method: 'POST' }),
    onSuccess: (_data, userId) => queryClient.invalidateQueries({ queryKey: ['guides', userId] }),
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      apiFetch<{ following: boolean }>(`/users/${userId}/follow`, { method: 'DELETE' }),
    onSuccess: (_data, userId) => queryClient.invalidateQueries({ queryKey: ['guides', userId] }),
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      apiFetch<{ blocked: boolean }>(`/users/${userId}/block`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      apiFetch<{ blocked: boolean }>(`/users/${userId}/block`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
}

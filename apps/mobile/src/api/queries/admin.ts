import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { CommissionSetting, Paginated, Role, User } from '../../types/api';

export function useAdminUsers(role?: Role) {
  return useQuery({
    queryKey: ['admin-users', role ?? 'all'],
    queryFn: () => apiFetch<Paginated<User>>(`/admin/users${role ? `?role=${role}` : ''}`),
  });
}

export function useVerifyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => apiFetch<User>(`/admin/users/${userId}/verify`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: 'active' | 'suspended' }) =>
      apiFetch<User>(`/admin/users/${userId}/status`, { method: 'PUT', body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useCommission() {
  return useQuery({
    queryKey: ['commission'],
    queryFn: () => apiFetch<CommissionSetting>('/admin/commission'),
  });
}

export function useUpdateCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (percentage: number) =>
      apiFetch<CommissionSetting>('/admin/commission', { method: 'PUT', body: { percentage } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commission'] }),
  });
}

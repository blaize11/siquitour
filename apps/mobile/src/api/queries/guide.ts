import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { GuideAvailability, User } from '../../types/api';

type ProfileInput = {
  bio?: string;
  years_experience?: number;
  rate_per_pax?: number;
  phone?: string;
};

export function useUpdateGuideProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => apiFetch<User>('/guide/profile', { method: 'PUT', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useGuideAvailability() {
  return useQuery({
    queryKey: ['guide-availability'],
    queryFn: () => apiFetch<GuideAvailability[]>('/guide/availability'),
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { date: string; is_available: boolean; note?: string }) =>
      apiFetch<GuideAvailability>('/guide/availability', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guide-availability'] }),
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/guide/availability/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guide-availability'] }),
  });
}

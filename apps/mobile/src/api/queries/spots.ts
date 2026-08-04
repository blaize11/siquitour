import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { Paginated, Spot } from '../../types/api';

export function useSpots(category?: 'spot' | 'restaurant') {
  return useQuery({
    queryKey: ['spots', category ?? 'all'],
    queryFn: () => apiFetch<Paginated<Spot>>(`/spots${category ? `?category=${category}` : ''}`),
  });
}

export function useSpot(id: number) {
  return useQuery({
    queryKey: ['spots', 'detail', id],
    queryFn: () => apiFetch<Spot>(`/spots/${id}`),
    enabled: Number.isFinite(id),
  });
}

type SpotInput = {
  category: 'spot' | 'restaurant';
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
};

export function useCreateSpot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SpotInput) => apiFetch<Spot>('/admin/spots', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots'] }),
  });
}

export function useUpdateSpot(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<SpotInput>) =>
      apiFetch<Spot>(`/admin/spots/${id}`, { method: 'PUT', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots'] }),
  });
}

export function useDeleteSpot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/admin/spots/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots'] }),
  });
}

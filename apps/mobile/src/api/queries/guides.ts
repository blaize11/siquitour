import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { Paginated, User } from '../../types/api';

export function useGuides() {
  return useQuery({
    queryKey: ['guides'],
    queryFn: () => apiFetch<Paginated<User>>('/guides'),
  });
}

export function useGuide(id: number) {
  return useQuery({
    queryKey: ['guides', id],
    queryFn: () => apiFetch<User>(`/guides/${id}`),
    enabled: Number.isFinite(id),
  });
}

export function useGuideBookedDates(id: number) {
  return useQuery({
    queryKey: ['guides', id, 'booked-dates'],
    queryFn: () => apiFetch<{ booked_dates: string[] }>(`/guides/${id}/booked-dates`),
    enabled: Number.isFinite(id),
  });
}

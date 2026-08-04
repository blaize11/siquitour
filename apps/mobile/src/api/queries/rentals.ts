import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { Paginated, Rental, RentalType } from '../../types/api';

export function useRentals(type?: RentalType) {
  return useQuery({
    queryKey: ['rentals', type ?? 'all'],
    queryFn: () => apiFetch<Paginated<Rental>>(`/rentals${type ? `?type=${type}` : ''}`),
  });
}

export function useRental(id: number) {
  return useQuery({
    queryKey: ['rentals', 'detail', id],
    queryFn: () => apiFetch<Rental>(`/rentals/${id}`),
    enabled: Number.isFinite(id),
  });
}

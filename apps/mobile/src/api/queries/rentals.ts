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

export function useRentalBookedDates(id: number) {
  return useQuery({
    queryKey: ['rentals', id, 'booked-dates'],
    queryFn: () => apiFetch<{ booked_dates: string[]; rental_id: number; rental_name: string }>(`/rentals/${id}/booked-dates`),
    enabled: Number.isFinite(id),
  });
}

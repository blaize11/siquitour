import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { Paginated, Rental, RentalImage, RentalType } from '../../types/api';

export function useMyRentals() {
  return useQuery({
    queryKey: ['my-rentals'],
    queryFn: async () => {
      try {
        return await apiFetch<Paginated<Rental>>('/renter/rentals');
      } catch (error: any) {
        // Suppress 403 errors for non-renter users (guests, guides accessing renter route)
        if (error?.status === 403) {
          return { data: [] } as Paginated<Rental>;
        }
        throw error;
      }
    },
  });
}

type RentalInput = {
  type: RentalType;
  title: string;
  description?: string;
  price_per_day: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  status?: 'active' | 'inactive';
};

function useInvalidateMyRentals() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['my-rentals'] });
}

export function useCreateRental() {
  const invalidate = useInvalidateMyRentals();
  return useMutation({
    mutationFn: (input: RentalInput) => apiFetch<Rental>('/renter/rentals', { method: 'POST', body: input }),
    onSuccess: invalidate,
  });
}

export function useUpdateRental(id: number) {
  const invalidate = useInvalidateMyRentals();
  return useMutation({
    mutationFn: (input: Partial<RentalInput>) =>
      apiFetch<Rental>(`/renter/rentals/${id}`, { method: 'PUT', body: input }),
    onSuccess: invalidate,
  });
}

export function useDeleteRental() {
  const invalidate = useInvalidateMyRentals();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/renter/rentals/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
}

export function useAddRentalImage(rentalId: number) {
  const invalidate = useInvalidateMyRentals();
  return useMutation({
    mutationFn: (url: string) =>
      apiFetch<RentalImage>(`/renter/rentals/${rentalId}/images`, { method: 'POST', body: { url } }),
    onSuccess: invalidate,
  });
}

export function useDeleteRentalImage(rentalId: number) {
  const invalidate = useInvalidateMyRentals();
  return useMutation({
    mutationFn: (imageId: number) =>
      apiFetch<void>(`/renter/rentals/${rentalId}/images/${imageId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
}

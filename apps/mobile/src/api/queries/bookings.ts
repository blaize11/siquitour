import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { Booking, Paginated, Review } from '../../types/api';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiFetch<Paginated<Booking>>('/bookings'),
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => apiFetch<Booking>(`/bookings/${id}`),
    enabled: Number.isFinite(id),
  });
}

type CreateBookingInput = {
  bookable_type: 'guide' | 'rental';
  bookable_id: number;
  start_date: string;
  end_date?: string;
  pax_count?: number;
};

function useInvalidateBookings() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['bookings'] });
}

export function useCreateBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (input: CreateBookingInput) =>
      apiFetch<Booking>('/bookings', { method: 'POST', body: input }),
    onSuccess: invalidate,
  });
}

export function useAcceptBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (id: number) => apiFetch<Booking>(`/bookings/${id}/accept`, { method: 'POST' }),
    onSuccess: invalidate,
  });
}

export function useDeclineBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (id: number) => apiFetch<Booking>(`/bookings/${id}/decline`, { method: 'POST' }),
    onSuccess: invalidate,
  });
}

export function useCompleteBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (id: number) => apiFetch<Booking>(`/bookings/${id}/complete`, { method: 'POST' }),
    onSuccess: invalidate,
  });
}

export function useCancelBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (id: number) => apiFetch<Booking>(`/bookings/${id}/cancel`, { method: 'POST' }),
    onSuccess: invalidate,
  });
}

export function useCreateReview() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: ({ bookingId, rating, comment }: { bookingId: number; rating: number; comment?: string }) =>
      apiFetch<Review>(`/bookings/${bookingId}/review`, { method: 'POST', body: { rating, comment } }),
    onSuccess: invalidate,
  });
}

export function usePayBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (bookingId: number, options?: { payment_type?: string; payment_method?: string }) =>
      apiFetch<{ checkout_url: string }>(`/bookings/${bookingId}/pay`, {
        method: 'POST',
        body: options || {}
      }),
    onSuccess: invalidate,
  });
}

export function useReplyToReview() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: number; reply: string }) =>
      apiFetch<Review>(`/reviews/${reviewId}/reply`, { method: 'POST', body: { reply } }),
    onSuccess: invalidate,
  });
}

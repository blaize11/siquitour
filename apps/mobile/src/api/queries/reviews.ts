import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { User } from '../../types/api';

export interface Review {
  id: number;
  booking_id: number;
  rental_id?: number | null;
  guest_id: number;
  tour_guide_id?: number | null;
  renter_id?: number | null;
  rating: number;
  comment: string | null;
  guide_reply: string | null;
  replied_at: string | null;
  renter_reply: string | null;
  renter_replied_at: string | null;
  guest?: User;
  tour_guide?: User;
  renter?: User;
  created_at: string;
  updated_at: string;
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  average_rating?: number;
}

export function useGuideReviews() {
  return useQuery({
    queryKey: ['guide-reviews'],
    queryFn: async () => {
      const data = await apiFetch<ReviewsResponse>('/reviews');
      return data;
    },
  });
}

export function useGuestReviews() {
  return useQuery({
    queryKey: ['guest-reviews'],
    queryFn: async () => {
      const data = await apiFetch<ReviewsResponse>('/reviews/my-reviews');
      return data;
    },
  });
}

export function useRenterReviews() {
  return useQuery({
    queryKey: ['renter-reviews'],
    queryFn: async () => {
      const data = await apiFetch<ReviewsResponse>('/renter/reviews');
      return data;
    },
  });
}

export function useReplyToReview() {
  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: number; reply: string }) => {
      return apiFetch<Review>(`/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        body: { guide_reply: reply },
      });
    },
  });
}

export function useReplyToRentalReview() {
  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: number; reply: string }) => {
      return apiFetch<Review>(`/reviews/${reviewId}/renter-reply`, {
        method: 'PATCH',
        body: { renter_reply: reply },
      });
    },
  });
}

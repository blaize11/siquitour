import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { User, Rental, Spot } from '../../types/api';

export interface GuideFeed extends User {
  average_rating?: number;
  review_count?: number;
}

export interface RentalFeed extends Rental {
  average_rating?: number;
  review_count?: number;
}

export interface FeedResponse<T> {
  data: T[];
  total: number;
}

export function useFeaturedGuides() {
  return useQuery({
    queryKey: ['featured-guides'],
    queryFn: async () => {
      const data = await apiFetch<FeedResponse<GuideFeed>>('/guides?limit=6&sort=rating');
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useFeaturedRentals() {
  return useQuery({
    queryKey: ['featured-rentals'],
    queryFn: async () => {
      const data = await apiFetch<FeedResponse<RentalFeed>>('/rentals?limit=6&sort=rating');
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useFeaturedSpots() {
  return useQuery({
    queryKey: ['featured-spots'],
    queryFn: async () => {
      const data = await apiFetch<FeedResponse<Spot>>('/spots?limit=6&sort=popular');
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

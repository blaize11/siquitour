import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../client';
import type { Paginated, User, Rental, Spot } from '../../types/api';

interface SearchParams {
  search?: string;
  type?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_experience?: number;
  verified?: boolean;
}

export function useSearchGuides(params: SearchParams) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.min_experience) queryParams.append('min_experience', params.min_experience.toString());
  if (params.max_price) queryParams.append('max_price', params.max_price.toString());
  if (params.verified) queryParams.append('verified', 'true');

  return useQuery({
    queryKey: ['guides', 'search', params],
    queryFn: () => apiFetch<Paginated<User>>(`/guides?${queryParams}`),
  });
}

export function useSearchRentals(params: SearchParams) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.type) queryParams.append('type', params.type);
  if (params.min_price) queryParams.append('min_price', params.min_price.toString());
  if (params.max_price) queryParams.append('max_price', params.max_price.toString());

  return useQuery({
    queryKey: ['rentals', 'search', params],
    queryFn: () => apiFetch<Paginated<Rental>>(`/rentals?${queryParams}`),
  });
}

export function useSearchSpots(params: SearchParams) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);

  return useQuery({
    queryKey: ['spots', 'search', params],
    queryFn: () => apiFetch<Paginated<Spot>>(`/spots?${queryParams}`),
  });
}

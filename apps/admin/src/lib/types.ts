export type Role = 'guest' | 'tour_guide' | 'renter' | 'admin';

export interface TourGuideProfile {
  id: number;
  user_id: number;
  bio: string | null;
  years_experience: number;
  rate_per_pax: string;
  is_verified: boolean;
}

export interface RenterProfile {
  id: number;
  user_id: number;
  business_name: string | null;
  is_verified: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  status: 'active' | 'suspended';
  created_at: string;
  tour_guide_profile?: TourGuideProfile;
  renter_profile?: RenterProfile;
}

export interface Spot {
  id: number;
  category: 'spot' | 'restaurant';
  name: string;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
  created_by: number;
}

export interface CommissionSetting {
  id: number;
  percentage: string;
  is_active: boolean;
}

export interface Paginated<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

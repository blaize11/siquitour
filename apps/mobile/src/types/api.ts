export type Role = 'guest' | 'tour_guide' | 'renter' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  avatar_url: string | null;
  status: 'active' | 'suspended';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  tour_guide_profile?: TourGuideProfile;
  renter_profile?: RenterProfile;
  reviews_received?: Review[];
}

export interface TourGuideProfile {
  id: number;
  user_id: number;
  bio: string | null;
  years_experience: number;
  rate_per_pax: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RenterProfile {
  id: number;
  user_id: number;
  business_name: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type RentalType = 'motorbike' | 'car' | 'tuktuk' | 'van' | 'bicycle' | 'room';

export interface RentalImage {
  id: number;
  rental_id: number;
  url: string;
  sort_order: number;
}

export interface Rental {
  id: number;
  renter_id: number;
  type: RentalType;
  title: string;
  description: string | null;
  price_per_day: string;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  images?: RentalImage[];
  renter?: Pick<User, 'id' | 'name'>;
}

export interface Spot {
  id: number;
  category: 'spot' | 'restaurant';
  name: string;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export interface Booking {
  id: number;
  guest_id: number;
  bookable_type: 'App\\Models\\User' | 'App\\Models\\Rental';
  bookable_id: number;
  pax_count: number | null;
  start_date: string;
  end_date: string | null;
  status: BookingStatus;
  total_price: string;
  commission_amount: string;
  created_at: string;
  updated_at: string;
  guest?: Pick<User, 'id' | 'name'>;
  bookable?: User | Rental;
  payment?: Payment | null;
  review?: Review | null;
}

export interface Payment {
  id: number;
  booking_id: number;
  provider: string;
  amount: string;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  external_reference: string | null;
}

export interface Review {
  id: number;
  booking_id: number;
  guest_id: number;
  tour_guide_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface GuideAvailability {
  id: number;
  tour_guide_id: number;
  date: string;
  is_available: boolean;
  note: string | null;
}

export interface CommissionSetting {
  id: number;
  percentage: string;
  is_active: boolean;
}

export interface ConversationParticipant {
  id: number;
  name: string;
  role: Role;
}

export interface Conversation {
  id: number;
  participant_one_id: number;
  participant_two_id: number;
  updated_at: string;
  participant_one?: ConversationParticipant;
  participant_two?: ConversationParticipant;
  messages_count?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
  sender?: Pick<User, 'id' | 'name'>;
}

export interface Paginated<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

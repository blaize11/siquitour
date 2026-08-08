import { View } from 'react-native';

interface LocationCardProps {
  location?: any | null;
  onClose?: () => void;
  onViewDetails?: (location: any) => void;
  onBook?: (location: any) => void;
}

export function LocationCard({ location, onClose, onViewDetails, onBook }: LocationCardProps) {
  return null;
}

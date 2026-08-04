import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from './theme';
import type { BookingStatus } from '../types/api';
import { statusColors } from './theme';

const roleLabels: Record<string, string> = {
  guest: 'Guest',
  tour_guide: 'Tour Guide',
  renter: 'Renter',
  admin: 'Admin',
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
      <Text style={styles.text}>{roleLabels[role] ?? role}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: BookingStatus | string }) {
  return (
    <View style={[styles.badge, { backgroundColor: statusColors[status] ?? colors.textMuted }]}>
      <Text style={styles.text}>{status.replace('_', ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export const colors = {
  primary: '#0E7C7B', // teal — ocean
  primaryDark: '#0A5F5E',
  accent: '#F2A65A', // sand/sunset
  background: '#F7F5F0',
  surface: '#FFFFFF',
  border: '#E4E0D8',
  text: '#1F2A2A',
  textMuted: '#6B7373',
  danger: '#C4453B',
  success: '#2E8B57',
  warning: '#D08A2A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
};

export const typography = {
  title: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  subtitle: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  caption: { fontSize: 13, color: colors.textMuted },
};

export const statusColors: Record<string, string> = {
  pending: colors.warning,
  accepted: colors.primary,
  declined: colors.danger,
  completed: colors.success,
  cancelled: colors.textMuted,
  active: colors.success,
  suspended: colors.danger,
  inactive: colors.textMuted,
};

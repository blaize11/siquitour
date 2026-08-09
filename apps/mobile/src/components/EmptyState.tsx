import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from './theme';

type Props = {
  message: string;
  icon?: string;
  subtext?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ message, icon = '📭', subtext, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  icon: {
    fontSize: 60,
  },
  message: {
    ...typography.subtitle,
    textAlign: 'center',
    color: colors.text,
  },
  subtext: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textMuted,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

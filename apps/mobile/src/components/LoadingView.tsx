import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from './theme';

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = 'Loading...' }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  message: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

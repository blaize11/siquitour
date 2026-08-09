import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors, spacing, typography } from './theme';

type Props = {
  message?: string;
  icon?: string;
  onRetry?: () => void;
};

export function ErrorView({
  message = 'Something went wrong.',
  icon = '⚠️',
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onRetry && (
        <View style={styles.buttonContainer}>
          <Button title="Try Again" onPress={onRetry} />
        </View>
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
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: '80%',
  },
  buttonContainer: {
    width: 200,
  },
});

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.message === 'string') {
      return err.message;
    }
    if (typeof err.error === 'string') {
      return err.error;
    }
  }
  return fallback;
}

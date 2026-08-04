import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors, spacing, typography } from './theme';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorView({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={typography.body}>{message}</Text>
      {onRetry && (
        <View style={styles.retry}>
          <Button title="Try again" onPress={onRetry} variant="secondary" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  retry: {
    minWidth: 140,
  },
});

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

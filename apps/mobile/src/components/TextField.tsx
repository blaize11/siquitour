import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, type TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from './theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
};

export function TextField({ label, error, style, showPasswordToggle, secureTextEntry, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={typography.caption}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError, showPasswordToggle && styles.inputWithIcon, style]}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />
        {showPasswordToggle && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggleButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.toggleIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputWithIcon: {
    paddingRight: spacing.xl + spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
  },
  toggleButton: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 20,
  },
});

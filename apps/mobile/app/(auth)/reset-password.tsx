import { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { resetPassword } = useSession();

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValid = password && passwordConfirmation && password === passwordConfirmation && password.length >= 8;

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!email || !code) throw new Error('Email or code is missing');
      await resetPassword(email, code, password, passwordConfirmation);
      setSuccess(true);
      // Auto-redirect to home after showing success message
      setTimeout(() => {
        router.replace('/(guest)/home');
      }, 2000);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ScreenContainer scroll={false}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg }}>
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Text style={[typography.title, { color: colors.success }]}>✓</Text>
            <Text style={typography.title}>Password Reset Successfully</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Your password has been updated. You will be redirected shortly.
            </Text>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text style={typography.title}>Create New Password</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Enter a new password for your SiquiTour account.
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <TextField
            label="New Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 8 characters"
          />
          <TextField
            label="Confirm Password"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            secureTextEntry
            placeholder="Confirm your password"
          />
          {error && <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text>}
          {password && passwordConfirmation && password !== passwordConfirmation && (
            <Text style={{ color: colors.danger, fontSize: 12 }}>Passwords do not match</Text>
          )}
          {password && password.length < 8 && (
            <Text style={{ color: colors.warning, fontSize: 12 }}>Password must be at least 8 characters</Text>
          )}
          <Button
            title="Reset Password"
            onPress={onSubmit}
            loading={loading}
            disabled={!isValid}
          />
        </View>

        <Text
          style={{ textAlign: 'center', color: colors.primary, cursor: 'pointer', fontSize: 12 }}
          onPress={() => router.replace('/(auth)')}
        >
          Back to Login
        </Text>
      </View>
    </ScreenContainer>
  );
}

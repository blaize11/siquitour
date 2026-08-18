import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset } = useSession();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
      // Navigate to verify code screen
      router.push({
        pathname: '/(auth)/verify-reset-code',
        params: { email: email.trim() },
      });
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to process request. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text style={typography.title}>Forgot Password</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Enter the email address associated with your SiquiTour account.
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="you@example.com"
            editable={!submitted}
          />
          {error && <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text>}
          <Button title="Send Code" onPress={onSubmit} loading={loading} disabled={submitted} />
        </View>

        <Text
          style={{ textAlign: 'center', color: colors.primary, cursor: 'pointer' }}
          onPress={() => router.back()}
        >
          Back to Login
        </Text>
      </View>
    </ScreenContainer>
  );
}

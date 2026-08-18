import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function VerifyResetCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyResetCode, requestPasswordReset } = useSession();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!email) throw new Error('Email is missing');
      await verifyResetCode(email, code.trim());
      // Navigate to reset password screen
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email, code: code.trim() },
      });
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid or expired code.'));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setResending(true);
    try {
      if (!email) throw new Error('Email is missing');
      await requestPasswordReset(email);
      setCode('');
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to resend code.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text style={typography.title}>Enter Verification Code</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            We sent a 6-digit code to:
          </Text>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{email}</Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <TextField
            label="Verification Code"
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
          />
          {error && <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text>}
          <Button title="Verify Code" onPress={onSubmit} loading={loading} disabled={code.length !== 6} />
        </View>

        <View style={{ gap: spacing.sm, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Didn't receive the code?
          </Text>
          <Pressable onPress={onResend} disabled={resending}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
              {resending ? 'Resending...' : 'Resend Code'}
            </Text>
          </Pressable>
        </View>

        <Text
          style={{ textAlign: 'center', color: colors.primary, cursor: 'pointer', fontSize: 12 }}
          onPress={() => router.back()}
        >
          Back
        </Text>
      </View>
    </ScreenContainer>
  );
}

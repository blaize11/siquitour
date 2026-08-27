import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email: paramEmail } = useLocalSearchParams<{ email: string }>();
  const { verifyEmailCode, sendVerificationCode } = useSession();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const email = paramEmail || '';

  const onSubmit = async () => {
    setError(null);
    setResendSuccess(false);
    setLoading(true);
    try {
      if (!email) throw new Error('Email is missing');
      await verifyEmailCode(email, code.trim());
      // Show success and auto-navigate to login
      router.replace('/(auth)');
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid or expired code.'));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setResendSuccess(false);
    setResending(true);
    try {
      if (!email) throw new Error('Email is missing');
      await sendVerificationCode(email);
      setCode('');
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000); // Hide success message after 5 seconds
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
          <Text style={typography.title}>Verify Your Email</Text>
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
          {resendSuccess && (
            <Text style={{ color: colors.success, fontSize: 12 }}>
              ✓ Verification code sent successfully
            </Text>
          )}
          <Button
            title="Verify Email"
            onPress={onSubmit}
            loading={loading}
            disabled={code.length !== 6}
          />
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

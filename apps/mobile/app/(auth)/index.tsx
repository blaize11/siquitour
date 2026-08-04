import { useState } from 'react';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function LoginScreen() {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to log in. Check your email and password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text style={[typography.title, { color: colors.primary }]}>SiquiTour</Text>
          <Text style={typography.caption}>Discover Siquijor Island</Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          {error && <Text style={{ color: colors.danger }}>{error}</Text>}
          <Button title="Log in" onPress={onSubmit} loading={submitting} />
        </View>

        <Link href="/(auth)/register" style={{ textAlign: 'center', color: colors.primary }}>
          New here? Create an account
        </Link>
      </View>
    </ScreenContainer>
  );
}

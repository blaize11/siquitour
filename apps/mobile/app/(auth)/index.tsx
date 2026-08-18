import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, googleLogin } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUrl: 'siquitour://oauth/google',
    scopes: ['profile', 'email'],
  });

  // Handle Google OAuth response
  const handleGoogleResponse = async () => {
    if (response?.type === 'success' && response.authentication) {
      setGoogleLoading(true);
      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${response.authentication.accessToken}` },
        });
        const userInfo = await userInfoResponse.json();

        // Login/register with our backend
        await googleLogin(userInfo.id, userInfo.email, userInfo.name, userInfo.picture);
      } catch (err) {
        setError(extractErrorMessage(err, 'Unable to log in with Google.'));
      } finally {
        setGoogleLoading(false);
      }
    } else if (response?.type === 'error') {
      setError('Google authentication was cancelled.');
    }
  };

  // Watch for response changes
  if (response?.type === 'success' && !googleLoading) {
    handleGoogleResponse();
  }

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

          <Link
            href="/(auth)/forgot-password"
            style={{ textAlign: 'right', color: colors.primary, fontSize: 12 }}
          >
            Forgot password?
          </Link>

          {error && <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text>}

          <Button title="Log in" onPress={onSubmit} loading={submitting} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <Button
          title="Continue with Google"
          onPress={() => promptAsync()}
          loading={googleLoading}
          disabled={!request}
          style={{
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: colors.border,
          }}
          textStyle={{ color: colors.text }}
        />

        <Link href="/(auth)/register" style={{ textAlign: 'center', color: colors.primary }}>
          New here? Create an account
        </Link>
      </View>
    </ScreenContainer>
  );
}

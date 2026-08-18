import { useState, useEffect } from 'react';
import { Text, View, Pressable, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

// Import Google OAuth only on native platforms
let Google: any = null;
let useAuthRequest: any = null;

if (Platform.OS !== 'web') {
  try {
    Google = require('expo-auth-session/providers/google');
    useAuthRequest = Google.useAuthRequest;
  } catch (e) {
    // Google OAuth not available
  }
}

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, googleLogin } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [request, setRequest] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [promptAsync, setPromptAsync] = useState<any>(null);

  // Initialize Google OAuth on native platforms
  useEffect(() => {
    if (useAuthRequest && Platform.OS !== 'web') {
      const [req, res, prompt] = useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
        redirectUrl: 'siquitour://oauth/google',
        scopes: ['profile', 'email'],
      });
      setRequest(req);
      setResponse(res);
      setPromptAsync(() => prompt);
    }
  }, []);

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

        {Platform.OS !== 'web' && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>OR</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            <Button
              title="Continue with Google"
              onPress={() => promptAsync && promptAsync()}
              loading={googleLoading}
              disabled={!request}
              style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: colors.border,
              }}
              textStyle={{ color: colors.text }}
            />
          </>
        )}

        <Link href="/(auth)/register" style={{ textAlign: 'center', color: colors.primary }}>
          New here? Create an account
        </Link>
      </View>
    </ScreenContainer>
  );
}

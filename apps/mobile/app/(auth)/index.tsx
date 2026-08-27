import { useState, useEffect } from 'react';
import { Text, View, Pressable, Platform, Image, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, spacing, typography, radius } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

// Import Google OAuth
let Google: any = null;
let useAuthRequest: any = null;

try {
  Google = require('expo-auth-session/providers/google');
  useAuthRequest = Google.useAuthRequest;
} catch (e) {
  // Google OAuth not available
}

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, googleLogin, sendVerificationCode } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [request, setRequest] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [promptAsync, setPromptAsync] = useState<any>(null);
  const [isUnverifiedEmail, setIsUnverifiedEmail] = useState(false);

  // Initialize Google OAuth (works on all platforms)
  useEffect(() => {
    if (useAuthRequest) {
      const redirectUrl = Platform.OS === 'web'
        ? 'http://localhost:8081'  // Web redirect
        : 'siquitour://oauth/google';  // Native redirect

      const [req, res, prompt] = useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
        redirectUrl,
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
    setIsUnverifiedEmail(false);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Unable to log in. Check your email and password.');
      if (errorMsg.includes('verify your email')) {
        setIsUnverifiedEmail(true);
        setError(errorMsg);
      } else {
        setError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onResendVerification = async () => {
    setError(null);
    try {
      await sendVerificationCode(email.trim());
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim() },
      });
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to resend verification code.'));
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.lg }}>
          {/* Awesome Header with Icon */}
          <View style={{ alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                overflow: 'hidden',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <Image
                source={require('../../assets/register-icon.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <View style={{ alignItems: 'center', gap: spacing.xs }}>
              <Text style={[typography.title, { color: colors.primary, fontSize: 28, fontWeight: 'bold' }]}>
                SiquiTour
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Discover Siquijor Island
              </Text>
            </View>
          </View>

          {/* Login Form */}
          <View style={{ gap: spacing.md }}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <View>
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                showPasswordToggle
                placeholder="••••••••"
              />
              <Link
                href="/(auth)/forgot-password"
                style={{ textAlign: 'right', color: colors.primary, fontSize: 12, marginTop: spacing.xs }}
              >
                Forgot password?
              </Link>
            </View>

            {/* Error Message */}
            {error && (
              <View style={{ gap: spacing.sm }}>
                <View
                  style={{
                    backgroundColor: '#fee',
                    padding: spacing.md,
                    borderRadius: radius.sm,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.danger,
                  }}
                >
                  <Text style={{ color: colors.danger, fontWeight: '500', fontSize: 13 }}>{error}</Text>
                </View>
                {isUnverifiedEmail && (
                  <Button
                    title="Resend Verification Email"
                    onPress={onResendVerification}
                    loading={submitting}
                    style={{ backgroundColor: colors.warning }}
                  />
                )}
              </View>
            )}

            {/* Login Button */}
            <Button title="Log in" onPress={onSubmit} loading={submitting} disabled={isUnverifiedEmail} />
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.sm }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500' }}>OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          {/* Google Login Button */}
          <Button
            title="🔵 Continue with Google"
            onPress={() => promptAsync && promptAsync()}
            loading={googleLoading}
            disabled={!request}
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: colors.border,
            }}
            textStyle={{ color: colors.text, fontWeight: '500' }}
          />

          {/* Sign Up Link */}
          <View style={{ alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
            <Text style={{ color: colors.textSecondary }}>New here?</Text>
            <Link href="/(auth)/register" style={{ color: colors.primary, fontWeight: '600', fontSize: 16 }}>
              Create an account
            </Link>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

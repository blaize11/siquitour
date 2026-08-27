import { useState } from 'react';
import { Image, Pressable, Text, View, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, radius, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';
import type { Role } from '../../src/types/api';

const roleOptions: {
  value: Exclude<Role, 'admin'>;
  label: string;
  icon: string;
  description: string;
}[] = [
  { value: 'guest', label: 'Guest', icon: '✈️', description: 'Explore & book tours' },
  { value: 'tour_guide', label: 'Tour Guide', icon: '🧭', description: 'Lead amazing tours' },
  { value: 'renter', label: 'Renter', icon: '🏠', description: 'Rent vehicles/rooms' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<Exclude<Role, 'admin'>>('guest');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);

    // Client-side validation
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({ name: name.trim(), email: email.trim(), password, role });
      // Navigate to verify email screen
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: result.email },
      });
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to create your account.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <ScreenContainer>
        {/* Awesome Header with Icon */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.lg }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: spacing.md,
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
          <Text style={[typography.title, { fontSize: 28, fontWeight: 'bold', marginBottom: spacing.sm }]}>
            Join SiquiTour
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            Create your account and start your adventure
          </Text>
        </View>

        {/* Form Content */}
        <View style={{ gap: spacing.md }}>
          <TextField label="Full name" value={name} onChangeText={setName} placeholder="Juan Dela Cruz" />
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
            showPasswordToggle
            placeholder="At least 8 characters"
          />
          <TextField
            label="Confirm Password"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
            showPasswordToggle
            placeholder="Repeat your password"
          />

          {/* Role Selection with Icons */}
          <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
            <Text style={[typography.caption, { fontWeight: '600' }]}>I am a...</Text>
            <View style={{ gap: spacing.sm }}>
              {roleOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setRole(option.value)}
                  style={{
                    padding: spacing.md,
                    borderRadius: radius.md,
                    borderWidth: 2,
                    borderColor: role === option.value ? colors.primary : colors.border,
                    backgroundColor: role === option.value ? colors.primary : colors.surface,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    elevation: role === option.value ? 3 : 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: role === option.value ? 0.2 : 0,
                    shadowRadius: 3,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{option.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: role === option.value ? '#fff' : colors.text,
                        fontWeight: '600',
                        fontSize: 16,
                      }}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={{
                        color: role === option.value ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
                        fontSize: 12,
                        marginTop: spacing.xs,
                      }}
                    >
                      {option.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={{ backgroundColor: '#fee', padding: spacing.md, borderRadius: radius.sm, borderLeftWidth: 4, borderLeftColor: colors.danger }}>
              <Text style={{ color: colors.danger, fontWeight: '500' }}>{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <Button title="Create account" onPress={onSubmit} loading={submitting} />
        </View>

        {/* Footer Link */}
        <View style={{ alignItems: 'center', marginTop: spacing.lg, paddingBottom: spacing.lg }}>
          <Text style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>Already have an account?</Text>
          <Link href="/(auth)" style={{ textAlign: 'center', color: colors.primary, fontWeight: '600' }}>
            Log in here
          </Link>
        </View>
      </ScreenContainer>
    </ScrollView>
  );
}

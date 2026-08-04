import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useSession } from '../../src/auth/SessionContext';
import { Button, ScreenContainer, TextField, colors, radius, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';
import type { Role } from '../../src/types/api';

const roleOptions: { value: Exclude<Role, 'admin'>; label: string }[] = [
  { value: 'guest', label: 'Tourist / Guest' },
  { value: 'tour_guide', label: 'Tour Guide' },
  { value: 'renter', label: 'Renter (vehicles/rooms)' },
];

export default function RegisterScreen() {
  const { register } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Exclude<Role, 'admin'>>('guest');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, role });
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to create your account.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.title}>Create your account</Text>

      <View style={{ gap: spacing.md }}>
        <TextField label="Full name" value={name} onChangeText={setName} placeholder="Juan Dela Cruz" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" />

        <View style={{ gap: spacing.xs }}>
          <Text style={typography.caption}>I am a...</Text>
          <View style={{ gap: spacing.sm }}>
            {roleOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setRole(option.value)}
                style={{
                  padding: spacing.sm,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  borderColor: role === option.value ? colors.primary : colors.border,
                  backgroundColor: role === option.value ? colors.primary : colors.surface,
                }}
              >
                <Text style={{ color: role === option.value ? '#fff' : colors.text }}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error && <Text style={{ color: colors.danger }}>{error}</Text>}
        <Button title="Create account" onPress={onSubmit} loading={submitting} />
      </View>

      <Link href="/(auth)" style={{ textAlign: 'center', color: colors.primary }}>
        Already have an account? Log in
      </Link>
    </ScreenContainer>
  );
}

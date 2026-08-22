import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '../../src/auth/SessionContext';
import { useUpdateGuideProfile } from '../../src/api/queries/guide';
import { Button, Card, TextField, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';
import { ProfileScreen } from '../../src/screens/ProfileScreen';

export default function GuideProfileScreen() {
  const { user, refreshUser } = useSession();
  const updateProfile = useUpdateGuideProfile();

  const [bio, setBio] = useState(user?.tour_guide_profile?.bio ?? '');
  const [ratePerPax, setRatePerPax] = useState(user?.tour_guide_profile?.rate_per_pax ?? '');
  const [yearsExperience, setYearsExperience] = useState(
    String(user?.tour_guide_profile?.years_experience ?? '')
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await updateProfile.mutateAsync({
        bio,
        rate_per_pax: ratePerPax ? Number(ratePerPax) : undefined,
        years_experience: yearsExperience ? Number(yearsExperience) : undefined,
      });
      await refreshUser();
      setSaved(true);

      // Show success message and redirect to home
      Alert.alert('Success', 'Your profile changes have been saved!', [
        {
          text: 'OK',
          onPress: () => {
            router.push('/(guide)/home');
          },
        },
      ]);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to save your profile.'));
    }
  };

  return (
    <ProfileScreen>
      <Card style={{ gap: spacing.sm }}>
        <Text style={typography.subtitle}>Edit guide profile</Text>
        <TextField label="Bio" value={bio} onChangeText={setBio} multiline placeholder="Tell guests about yourself" />
        <TextField label="Rate per pax (₱)" value={ratePerPax} onChangeText={setRatePerPax} keyboardType="decimal-pad" />
        <TextField label="Years of experience" value={yearsExperience} onChangeText={setYearsExperience} keyboardType="number-pad" />
        {error && <Text style={{ color: colors.danger }}>{error}</Text>}
        {saved && <Text style={{ color: colors.success }}>Saved!</Text>}
        <Button title="Save changes" onPress={onSave} loading={updateProfile.isPending} />
      </Card>
    </ProfileScreen>
  );
}

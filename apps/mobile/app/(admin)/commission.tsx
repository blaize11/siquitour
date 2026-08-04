import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useCommission, useUpdateCommission } from '../../src/api/queries/admin';
import { Button, Card, ErrorView, LoadingView, ScreenContainer, TextField, colors, spacing, typography } from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function AdminCommissionScreen() {
  const { data, isLoading, isError, error, refetch } = useCommission();
  const updateCommission = useUpdateCommission();

  const [percentage, setPercentage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.percentage) {
      setPercentage(data.percentage);
    }
  }, [data?.percentage]);

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const onSave = async () => {
    setFormError(null);
    setSaved(false);
    const value = Number(percentage);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      setFormError('Enter a percentage between 0 and 100.');
      return;
    }
    try {
      await updateCommission.mutateAsync(value);
      setSaved(true);
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Unable to update the commission rate.'));
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.title}>Platform Commission</Text>

      <Card style={{ gap: spacing.sm }}>
        <Text style={typography.caption}>
          The percentage SiquiTour takes from every completed advance booking.
        </Text>
        <TextField label="Commission percentage (%)" value={percentage} onChangeText={setPercentage} keyboardType="decimal-pad" />
        {formError && <Text style={{ color: colors.danger }}>{formError}</Text>}
        {saved && <Text style={{ color: colors.success }}>Saved!</Text>}
        <Button title="Save" onPress={onSave} loading={updateCommission.isPending} />
      </Card>
    </ScreenContainer>
  );
}

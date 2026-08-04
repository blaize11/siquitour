import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useDeleteAvailability, useGuideAvailability, useSetAvailability } from '../../src/api/queries/guide';
import {
  Button,
  Card,
  DateField,
  EmptyState,
  ErrorView,
  LoadingView,
  ScreenContainer,
  TextField,
  colors,
  spacing,
  typography,
} from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function GuideAvailabilityScreen() {
  const { data, isLoading, isError, error, refetch } = useGuideAvailability();
  const setAvailability = useSetAvailability();
  const deleteAvailability = useDeleteAvailability();

  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const onAdd = async () => {
    setFormError(null);
    if (!date) {
      setFormError('Choose a date.');
      return;
    }
    try {
      await setAvailability.mutateAsync({ date, is_available: true, note: note || undefined });
      setDate('');
      setNote('');
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Unable to save availability.'));
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <Text style={typography.title}>Availability</Text>

      <Card style={{ gap: spacing.sm }}>
        <Text style={typography.subtitle}>Mark a date as free</Text>
        <DateField label="Date" value={date} onChange={setDate} minimumDate={new Date()} />
        <TextField label="Note (optional)" value={note} onChangeText={setNote} placeholder="Full day free" />
        {formError && <Text style={{ color: colors.danger }}>{formError}</Text>}
        <Button title="Add" onPress={onAdd} loading={setAvailability.isPending} />
      </Card>

      {isLoading && <LoadingView />}
      {isError && <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />}
      {!isLoading && !isError && !data?.length && <EmptyState message="No availability set yet." />}

      {!!data?.length && (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={typography.body}>{item.date.slice(0, 10)}</Text>
                {item.note && <Text style={typography.caption}>{item.note}</Text>}
              </View>
              <Button
                title="Remove"
                variant="secondary"
                onPress={() => deleteAvailability.mutate(item.id)}
                disabled={deleteAvailability.isPending}
              />
            </Card>
          )}
        />
      )}
    </ScreenContainer>
  );
}

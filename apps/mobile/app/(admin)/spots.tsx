import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useCreateSpot, useDeleteSpot, useSpots } from '../../src/api/queries/spots';
import {
  Button,
  Card,
  EmptyState,
  ErrorView,
  LoadingView,
  ScreenContainer,
  TextField,
  colors,
  radius,
  spacing,
  typography,
} from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

export default function AdminSpotsScreen() {
  const { data, isLoading, isError, error, refetch } = useSpots();
  const createSpot = useCreateSpot();
  const deleteSpot = useDeleteSpot();

  const [category, setCategory] = useState<'spot' | 'restaurant'>('spot');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const onAdd = async () => {
    setFormError(null);
    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }
    try {
      await createSpot.mutateAsync({ category, name: name.trim(), description: description || undefined });
      setName('');
      setDescription('');
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Unable to add this spot.'));
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <Text style={typography.title}>Spots & Restaurants</Text>

      <Card style={{ gap: spacing.sm }}>
        <Text style={typography.subtitle}>Add a spot</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['spot', 'restaurant'] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => setCategory(option)}
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: category === option ? colors.primary : colors.border,
                backgroundColor: category === option ? colors.primary : colors.surface,
              }}
            >
              <Text style={{ color: category === option ? '#fff' : colors.text, textTransform: 'capitalize' }}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Cambugahay Falls" />
        <TextField label="Description" value={description} onChangeText={setDescription} multiline />
        {formError && <Text style={{ color: colors.danger }}>{formError}</Text>}
        <Button title="Add" onPress={onAdd} loading={createSpot.isPending} />
      </Card>

      {isLoading && <LoadingView />}
      {isError && <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />}
      {!isLoading && !isError && !data?.data.length && <EmptyState message="No spots added yet." />}

      {!!data?.data.length && (
        <FlatList
          data={data.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={typography.body}>{item.name}</Text>
                <Text style={typography.caption}>{item.category}</Text>
              </View>
              <Button title="Delete" variant="danger" onPress={() => deleteSpot.mutate(item.id)} />
            </Card>
          )}
        />
      )}
    </ScreenContainer>
  );
}

import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRental } from '../../../src/api/queries/rentals';
import {
  useAddRentalImage,
  useDeleteRental,
  useDeleteRentalImage,
  useUpdateRental,
} from '../../../src/api/queries/renter';
import {
  Button,
  Card,
  ErrorView,
  LoadingView,
  ScreenContainer,
  TextField,
  colors,
  spacing,
  typography,
} from '../../../src/components';
import { extractErrorMessage } from '../../../src/components/ErrorView';

export default function EditRentalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rentalId = Number(id);
  const { data: rental, isLoading, isError, error, refetch } = useRental(rentalId);

  const updateRental = useUpdateRental(rentalId);
  const deleteRental = useDeleteRental();
  const addImage = useAddRentalImage(rentalId);
  const deleteImage = useDeleteRentalImage(rentalId);

  const [pricePerDay, setPricePerDay] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error1, setError1] = useState<string | null>(null);

  if (isLoading) return <LoadingView />;
  if (isError || !rental) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;

  const onUpdatePrice = async () => {
    setError1(null);
    try {
      await updateRental.mutateAsync({ price_per_day: Number(pricePerDay || rental.price_per_day) });
      setPricePerDay('');
    } catch (err) {
      setError1(extractErrorMessage(err, 'Unable to update the price.'));
    }
  };

  const onToggleStatus = () => {
    updateRental.mutate({ status: rental.status === 'active' ? 'inactive' : 'active' });
  };

  const onAddImage = async () => {
    if (!imageUrl.trim()) return;
    try {
      await addImage.mutateAsync(imageUrl.trim());
      setImageUrl('');
    } catch (err) {
      setError1(extractErrorMessage(err, 'Unable to add that image.'));
    }
  };

  const onDelete = async () => {
    await deleteRental.mutateAsync(rentalId);
    router.back();
  };

  return (
    <ScreenContainer>
      <Text style={typography.title}>{rental.title}</Text>
      <Text style={typography.caption}>
        {rental.type} · {rental.status}
      </Text>

      <Card style={{ gap: spacing.sm }}>
        <Text style={typography.subtitle}>Current price: ₱{rental.price_per_day} / day</Text>
        <TextField label="New price per day (₱)" value={pricePerDay} onChangeText={setPricePerDay} keyboardType="decimal-pad" />
        <Button title="Update price" onPress={onUpdatePrice} loading={updateRental.isPending} />
        <Button
          title={rental.status === 'active' ? 'Set inactive' : 'Set active'}
          variant="secondary"
          onPress={onToggleStatus}
          disabled={updateRental.isPending}
        />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={typography.subtitle}>Photos</Text>
        <FlatList
          data={rental.images ?? []}
          keyExtractor={(image) => String(image.id)}
          contentContainerStyle={{ gap: spacing.xs }}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={typography.caption} numberOfLines={1} ellipsizeMode="middle">
                {item.url}
              </Text>
              <Button title="Remove" variant="secondary" onPress={() => deleteImage.mutate(item.id)} />
            </View>
          )}
        />
        <TextField label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />
        <Button title="Add photo" variant="secondary" onPress={onAddImage} loading={addImage.isPending} />
      </Card>

      {error1 && <Text style={{ color: colors.danger }}>{error1}</Text>}

      <Button title="Delete listing" variant="danger" onPress={onDelete} loading={deleteRental.isPending} />
    </ScreenContainer>
  );
}

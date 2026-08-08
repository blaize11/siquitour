import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCreateRental } from '../../../src/api/queries/renter';
import {
  Button,
  ScreenContainer,
  TextField,
  LocationSelector,
  ImagePicker,
  colors,
  radius,
  spacing,
  typography,
} from '../../../src/components';
import { extractErrorMessage } from '../../../src/components/ErrorView';
import type { RentalType } from '../../../src/types/api';
import type { PickedImage } from '../../../src/components/ImagePicker';

const typeOptions: RentalType[] = ['motorbike', 'car', 'tuktuk', 'van', 'bicycle', 'room', 'camera', 'other'];

export default function NewRentalScreen() {
  const createRental = useCreateRental();

  const [type, setType] = useState<RentalType>('motorbike');
  const [otherLabel, setOtherLabel] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [address, setAddress] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!title.trim() || !pricePerDay) {
      setError('Title and price per day are required.');
      return;
    }
    if (type === 'other' && !otherLabel.trim()) {
      setError('Please specify what you are renting.');
      return;
    }
    try {
      await createRental.mutateAsync({
        type,
        ...(type === 'other' && { other_label: otherLabel.trim() }),
        title: title.trim(),
        description: description || undefined,
        price_per_day: Number(pricePerDay),
        address: address || undefined,
      });
      router.back();
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to create this listing.'));
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.title}>New Listing</Text>

      <View style={{ gap: spacing.xs }}>
        <Text style={typography.caption}>Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {typeOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setType(option)}
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: type === option ? colors.primary : colors.border,
                backgroundColor: type === option ? colors.primary : colors.surface,
              }}
            >
              <Text style={{ color: type === option ? '#fff' : colors.text, textTransform: 'capitalize' }}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {type === 'other' && (
        <TextField
          label="What are you renting?"
          value={otherLabel}
          onChangeText={setOtherLabel}
          placeholder="e.g., GoPro, snorkel gear, surfboard"
        />
      )}

      <TextField label="Title" value={title} onChangeText={setTitle} placeholder="Honda Click 125" />
      <TextField label="Description" value={description} onChangeText={setDescription} multiline />
      <TextField label="Price per day (₱)" value={pricePerDay} onChangeText={setPricePerDay} keyboardType="decimal-pad" />

      <LocationSelector value={address} onChange={setAddress} />

      <ImagePicker images={images} onImagesChange={setImages} maxImages={5} />

      {error && <Text style={{ color: colors.danger }}>{error}</Text>}
      <Button title="Create listing" onPress={onSubmit} loading={createRental.isPending} />
    </ScreenContainer>
  );
}

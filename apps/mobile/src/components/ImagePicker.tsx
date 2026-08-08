import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { colors, radius, spacing, typography } from './theme';

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface ImagePickerProps {
  images: PickedImage[];
  onImagesChange: (images: PickedImage[]) => void;
  maxImages?: number;
}

export function ImagePicker({ images, onImagesChange, maxImages = 5 }: ImagePickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newImage: PickedImage = {
        uri: asset.uri,
        name: asset.uri.split('/').pop() || `image-${Date.now()}`,
        type: 'image/jpeg',
        size: 0,
      };
      onImagesChange([...images, newImage]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const result = await ExpoImagePicker.launchCameraAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newImage: PickedImage = {
        uri: asset.uri,
        name: asset.uri.split('/').pop() || `photo-${Date.now()}`,
        type: 'image/jpeg',
        size: 0,
      };
      onImagesChange([...images, newImage]);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={typography.caption}>
          Images ({images.length}/{maxImages})
        </Text>
      </View>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {images.map((image, index) => (
              <View key={index} style={{ position: 'relative' }}>
                <Image
                  source={{ uri: image.uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: radius.md,
                    backgroundColor: colors.surface,
                  }}
                />
                <Pressable
                  onPress={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: colors.danger,
                    borderRadius: 999,
                    width: 28,
                    height: 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Add Image Buttons */}
      {images.length < maxImages && (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pressable
            onPress={pickImage}
            disabled={isLoading}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              borderWidth: 2,
              borderColor: colors.primary,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.primary + '10',
            }}
          >
            <Text style={{ fontSize: 18 }}>📁</Text>
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
              Choose
            </Text>
          </Pressable>

          <Pressable
            onPress={takePhoto}
            disabled={isLoading}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              borderWidth: 2,
              borderColor: colors.primary,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.primary + '10',
            }}
          >
            <Text style={{ fontSize: 18 }}>📷</Text>
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
              Photo
            </Text>
          </Pressable>
        </View>
      )}

      {images.length === 0 && (
        <Text style={{ ...typography.caption, color: colors.border, textAlign: 'center', paddingVertical: spacing.sm }}>
          Add up to {maxImages} images for your listing
        </Text>
      )}
    </View>
  );
}

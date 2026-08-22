import { useLocalSearchParams, router } from 'expo-router';
import { Pressable, View, Text } from 'react-native';
import { SpotDetailScreen } from '../../../src/screens/SpotDetailScreen';
import { colors, spacing } from '../../../src/components';

export default function AdminSpotDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spotId = Number(id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Back Button */}
      <Pressable onPress={() => router.back()} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md, zIndex: 10 }}>
        <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>← Back</Text>
      </Pressable>

      {/* Detail Screen */}
      <SpotDetailScreen route={{ params: { spotId } }} />
    </View>
  );
}

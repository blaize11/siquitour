import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useGuides } from '../../src/api/queries/guides';
import { useRentals } from '../../src/api/queries/rentals';
import { useSpots } from '../../src/api/queries/spots';
import {
  Card,
  EmptyState,
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  radius,
  spacing,
  typography,
} from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

type Section = 'guides' | 'rentals' | 'spots';

const sections: { key: Section; label: string }[] = [
  { key: 'guides', label: 'Tour Guides' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'spots', label: 'Spots & Food' },
];

export default function ExploreScreen() {
  const [section, setSection] = useState<Section>('guides');

  return (
    <ScreenContainer scroll={false}>
      <Text style={typography.title}>Explore Siquijor</Text>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {sections.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setSection(item.key)}
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.sm,
              backgroundColor: section === item.key ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: section === item.key ? colors.primary : colors.border,
            }}
          >
            <Text style={{ color: section === item.key ? '#fff' : colors.text, fontSize: 13 }}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {section === 'guides' && <GuidesList />}
      {section === 'rentals' && <RentalsList />}
      {section === 'spots' && <SpotsList />}
    </ScreenContainer>
  );
}

function GuidesList() {
  const { data, isLoading, isError, error, refetch } = useGuides();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;
  if (!data?.data.length) return <EmptyState message="No tour guides available yet." />;

  return (
    <FlatList
      data={data.data}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ gap: spacing.sm }}
      renderItem={({ item }) => (
        <Link href={`/(guest)/guide/${item.id}`} asChild>
          <Pressable>
            <Card>
              <Text style={typography.subtitle}>{item.name}</Text>
              {item.tour_guide_profile && (
                <>
                  <Text style={typography.caption} numberOfLines={2}>
                    {item.tour_guide_profile.bio ?? 'No bio yet.'}
                  </Text>
                  <Text style={[typography.body, { marginTop: spacing.xs }]}>
                    ₱{item.tour_guide_profile.rate_per_pax} / pax · {item.tour_guide_profile.years_experience} yrs experience
                  </Text>
                </>
              )}
            </Card>
          </Pressable>
        </Link>
      )}
    />
  );
}

function RentalsList() {
  const { data, isLoading, isError, error, refetch } = useRentals();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;
  if (!data?.data.length) return <EmptyState message="No rentals available yet." />;

  return (
    <FlatList
      data={data.data}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ gap: spacing.sm }}
      renderItem={({ item }) => (
        <Link href={`/(guest)/rental/${item.id}`} asChild>
          <Pressable>
            <Card>
              <Text style={typography.subtitle}>{item.title}</Text>
              <Text style={typography.caption}>{item.type} · by {item.renter?.name}</Text>
              <Text style={[typography.body, { marginTop: spacing.xs }]}>₱{item.price_per_day} / day</Text>
            </Card>
          </Pressable>
        </Link>
      )}
    />
  );
}

function SpotsList() {
  const { data, isLoading, isError, error, refetch } = useSpots();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />;
  if (!data?.data.length) return <EmptyState message="No spots added yet." />;

  return (
    <FlatList
      data={data.data}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ gap: spacing.sm }}
      renderItem={({ item }) => (
        <Card>
          <Text style={typography.subtitle}>{item.name}</Text>
          <Text style={typography.caption}>{item.category === 'spot' ? 'Attraction' : 'Restaurant'}</Text>
          {item.description && <Text style={typography.body}>{item.description}</Text>}
        </Card>
      )}
    />
  );
}

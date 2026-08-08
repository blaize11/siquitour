import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useGuides } from '../../src/api/queries/guides';
import { useRentals } from '../../src/api/queries/rentals';
import { useSpots } from '../../src/api/queries/spots';
import { SiquiTourMap, LocationCard } from '../../src/components/map';
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
import type { MapLocation } from '../../src/types/api';

type Section = 'guides' | 'rentals' | 'spots' | 'map';

const sections: { key: Section; label: string }[] = [
  { key: 'guides', label: 'Tour Guides' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'spots', label: 'Spots & Food' },
  { key: 'map', label: 'Map' },
];

export default function ExploreScreen() {
  const [section, setSection] = useState<Section>('guides');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  return (
    <ScreenContainer scroll={false} style={{ gap: section === 'map' ? 0 : spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <Text style={typography.title}>Explore Siquijor</Text>
        <Pressable
          onPress={() => router.push('/(guest)/search')}
          style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {sections.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => {
              setSection(item.key);
              setSelectedLocation(null);
            }}
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
      {section === 'map' && <MapView selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />}
    </ScreenContainer>
  );
}

interface MapViewProps {
  selectedLocation: MapLocation | null;
  onLocationSelect: (location: MapLocation | null) => void;
}

function MapView({ selectedLocation, onLocationSelect }: MapViewProps) {
  const { data: guidesData } = useGuides();
  const { data: rentalsData } = useRentals();
  const { data: spotsData } = useSpots();

  const guideLocations: MapLocation[] = (guidesData?.data || [])
    .filter((guide) => guide.tour_guide_profile)
    .map((guide) => ({
      id: guide.id,
      name: guide.name,
      category: 'tour_guide',
      latitude: 9.2142,
      longitude: 123.515,
      description: guide.tour_guide_profile?.bio,
      type: 'Tour Guide',
      rate_per_pax: guide.tour_guide_profile?.rate_per_pax,
    }));

  const rentalLocations: MapLocation[] = (rentalsData?.data || [])
    .filter((rental) => rental.latitude && rental.longitude)
    .map((rental) => ({
      id: rental.id,
      name: rental.title,
      category: 'rental',
      latitude: rental.latitude || 0,
      longitude: rental.longitude || 0,
      description: rental.description,
      address: rental.address,
      type: rental.type,
      price_per_day: rental.price_per_day,
    }));

  const spotLocations: MapLocation[] = (spotsData?.data || [])
    .filter((spot) => spot.latitude && spot.longitude)
    .map((spot) => ({
      id: spot.id,
      name: spot.name,
      category: spot.category,
      latitude: spot.latitude || 0,
      longitude: spot.longitude || 0,
      description: spot.description,
    }));

  const displayLocations = [...guideLocations, ...rentalLocations, ...spotLocations];

  const handleViewDetails = (location: MapLocation) => {
    if (location.category === 'tour_guide') {
      router.push(`/(guest)/guide/${location.id}`);
    } else if (location.category === 'rental') {
      router.push(`/(guest)/rental/${location.id}`);
    }
    onLocationSelect(null);
  };

  const handleBook = (location: MapLocation) => {
    if (location.category === 'tour_guide') {
      router.push(`/(guest)/guide/${location.id}`);
    } else if (location.category === 'rental') {
      router.push(`/(guest)/rental/${location.id}`);
    }
    onLocationSelect(null);
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <SiquiTourMap
        locations={displayLocations}
        onMarkerPress={onLocationSelect}
        showUserLocation={true}
        height="100%"
      />
      {selectedLocation && (
        <LocationCard
          location={selectedLocation}
          onClose={() => onLocationSelect(null)}
          onViewDetails={handleViewDetails}
          onBook={handleBook}
        />
      )}
    </View>
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

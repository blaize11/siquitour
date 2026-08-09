import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from './theme';

interface ImageCarouselProps<T> {
  title: string;
  seeAllText?: string;
  onSeeAll?: () => void;
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  horizontal?: boolean;
  showTitle?: boolean;
}

export function ImageCarousel<T extends { id: string }>({
  title,
  seeAllText = 'See all',
  onSeeAll,
  data,
  renderItem,
  horizontal = true,
  showTitle = true,
}: ImageCarouselProps<T>) {
  if (data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {onSeeAll && (
            <Text style={styles.seeAll} onPress={onSeeAll}>
              {seeAllText}
            </Text>
          )}
        </View>
      )}

      <FlatList
        data={data}
        renderItem={({ item, index }) => renderItem(item, index)}
        keyExtractor={(item) => item.id}
        horizontal={horizontal}
        scrollEnabled={horizontal}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={horizontal ? styles.listContent : undefined}
        nestedScrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.subtitle,
  },
  seeAll: {
    color: '#0E7C7B',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

type Props = {
  rating: number;
  onChange?: (value: number) => void;
  size?: number;
};

export function RatingStars({ rating, onChange, size = 18 }: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((value) => {
        const filled = value <= rating;
        const star = (
          <Text style={{ fontSize: size, color: filled ? colors.accent : colors.border }}>★</Text>
        );

        if (!onChange) {
          return <View key={value}>{star}</View>;
        }

        return (
          <Pressable key={value} onPress={() => onChange(value)} hitSlop={6}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});

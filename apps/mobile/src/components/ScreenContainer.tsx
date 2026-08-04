import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from './theme';

type Props = {
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function ScreenContainer({ scroll = true, style, children }: Props) {
  const inner = <View style={[styles.inner, style]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{inner}</ScrollView>
      ) : (
        <View style={styles.content}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  inner: {
    padding: spacing.md,
    gap: spacing.md,
  },
});

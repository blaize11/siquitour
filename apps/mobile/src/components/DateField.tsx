import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextField } from './TextField';
import { colors, radius, spacing, typography } from './theme';

type Props = {
  label: string;
  value: string; // YYYY-MM-DD, or '' for unset
  onChange: (value: string) => void;
  minimumDate?: Date;
  placeholder?: string;
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function DateField({ label, value, onChange, minimumDate, placeholder }: Props) {
  const [show, setShow] = useState(false);

  // react-native-web's support for @react-native-community/datetimepicker is inconsistent,
  // and web is only the dev-testing surface here, not a shipping target — keep the plain
  // text fallback there.
  if (Platform.OS === 'web') {
    return (
      <TextField
        label={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? 'YYYY-MM-DD'}
      />
    );
  }

  const dateValue = value ? new Date(`${value}T00:00:00`) : new Date();

  return (
    <View style={styles.container}>
      <Text style={typography.caption}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setShow(true)}>
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value || placeholder || 'Select a date'}
        </Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          minimumDate={minimumDate}
          onChange={(event, selected) => {
            setShow(false);
            if (event.type === 'set' && selected) {
              onChange(toIsoDate(selected));
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  valueText: {
    fontSize: 15,
    color: colors.text,
  },
  placeholderText: {
    fontSize: 15,
    color: colors.textMuted,
  },
});

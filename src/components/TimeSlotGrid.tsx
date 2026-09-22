import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatTimeOfDay } from '../utils/time';

export function TimeSlotGrid({
  minutesOptions,
  selectedMinutes,
  disabledMinutes,
  onSelect,
}: {
  minutesOptions: number[];
  selectedMinutes: number | null;
  disabledMinutes: Set<number>;
  onSelect: (minutes: number) => void;
}) {
  return (
    <View style={styles.grid}>
      {minutesOptions.map(minutes => {
        const selected = minutes === selectedMinutes;
        const disabled = disabledMinutes.has(minutes);
        return (
          <TouchableOpacity
            key={minutes}
            disabled={disabled}
            style={[
              styles.button,
              selected && styles.buttonSelected,
              disabled && styles.buttonDisabled,
            ]}
            onPress={() => onSelect(minutes)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.label,
                selected && styles.labelSelected,
                disabled && styles.labelDisabled,
              ]}>
              {formatTimeOfDay(minutes)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  button: {
    flexBasis: '31%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  buttonSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  buttonDisabled: { backgroundColor: colors.surface, borderColor: colors.surface },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  labelSelected: { color: colors.primary },
  labelDisabled: { color: colors.textMuted },
});

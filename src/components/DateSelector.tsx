import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { DayOption } from '../utils/time';

export function DateSelector({
  days,
  selectedKey,
  onSelect,
}: {
  days: DayOption[];
  selectedKey: string | null;
  onSelect: (day: DayOption) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {days.map(day => {
        const selected = day.key === selectedKey;
        return (
          <TouchableOpacity
            key={day.key}
            style={[styles.card, selected && styles.cardSelected]}
            onPress={() => onSelect(day)}
            activeOpacity={0.7}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{day.label}</Text>
            <Text style={[styles.dayNumber, selected && styles.labelSelected]}>
              {day.dayNumber}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  card: {
    width: 56,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  dayNumber: { fontSize: 17, color: colors.text, fontWeight: '700', marginTop: 2 },
  labelSelected: { color: colors.primary },
});

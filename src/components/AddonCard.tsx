import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { Addon } from '../types';
import { formatINR } from '../utils/currency';

export function AddonCard({
  addon,
  quantity,
  onIncrement,
  onDecrement,
}: {
  addon: Addon;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.name} numberOfLines={2}>
        {addon.name}
      </Text>
      {!!addon.description && (
        <Text style={styles.description} numberOfLines={2}>
          {addon.description}
        </Text>
      )}
      <Text style={styles.price}>{formatINR(addon.price)}</Text>

      {quantity === 0 ? (
        <TouchableOpacity style={styles.addButton} onPress={onIncrement} activeOpacity={0.7}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={onDecrement}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.stepperButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={onIncrement}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.stepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
  },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, minHeight: 36 },
  description: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs, minHeight: 32 },
  price: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  addButton: {
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  addButtonText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  stepper: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  stepperButton: { paddingHorizontal: spacing.sm },
  stepperButtonText: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  stepperValue: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { PricingTier } from '../types';

export function TierSelector({
  tiers,
  selectedTierId,
  onSelect,
}: {
  tiers: PricingTier[];
  selectedTierId: string | null;
  onSelect: (tierId: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {tiers.map(tier => {
        const selected = tier.id === selectedTierId;
        return (
          <TouchableOpacity
            key={tier.id}
            style={[styles.button, selected && styles.buttonSelected]}
            onPress={() => onSelect(tier.id)}
            activeOpacity={0.7}>
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={2}>
              {tier.facilitySize}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  button: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  buttonSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'center' },
  labelSelected: { color: colors.primary },
});

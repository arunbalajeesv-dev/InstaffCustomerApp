import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { PricingTier } from '../types';
import { formatINR } from '../utils/currency';

export function TierSummaryCard({ tier }: { tier: PricingTier | undefined }) {
  if (!tier) {
    return (
      <View style={[styles.card, styles.emptyCard]}>
        <Text style={styles.emptyText}>Select a facility size to see pricing details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.value}>{tier.professionals}</Text>
        <Text style={styles.label}>{tier.professionals === 1 ? 'Professional' : 'Professionals'}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.value}>{tier.durationHours}</Text>
        <Text style={styles.label}>{tier.durationHours === 1 ? 'Hour' : 'Hours'}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={[styles.value, styles.price]}>{formatINR(tier.price)}</Text>
        <Text style={styles.label}>Price</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  emptyCard: { justifyContent: 'center', minHeight: 68 },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  row: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: colors.border },
  value: { fontSize: 18, fontWeight: '700', color: colors.text },
  price: { color: colors.primary },
  label: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
});

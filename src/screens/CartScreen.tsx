import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartItemCard } from '../components/CartItemCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { useCartStore } from '../store/useCartStore';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../types';
import { computeCartTotals } from '../utils/cartTotals';
import { formatINR } from '../utils/currency';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { items, removeItem } = useCartStore();
  const insets = useSafeAreaInsets();

  const { subtotal, platformFee, gst, total } = computeCartTotals(items);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Cart" />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {items.map(item => (
              <CartItemCard
                key={item.id}
                item={item}
                onPress={() =>
                  navigation.navigate('ServiceDetail', {
                    service: item.service,
                    editCartItemId: item.id,
                  })
                }
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </ScrollView>

          <View style={[styles.summary, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatINR(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform fee</Text>
              <Text style={styles.summaryValue}>{formatINR(platformFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryValue}>{formatINR(gst)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue} testID="cartTotalValue">
                {formatINR(total)}
              </Text>
            </View>
            <TouchableOpacity
              testID="proceedButton"
              style={styles.proceedButton}
              onPress={() => navigation.navigate('Address')}>
              <Text style={styles.proceedButtonText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: colors.textMuted },
  summary: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: { fontSize: 13, color: colors.textMuted },
  summaryValue: { fontSize: 13, color: colors.text },
  totalRow: { marginTop: spacing.xs, marginBottom: spacing.md },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  proceedButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  proceedButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

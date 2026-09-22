import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartItemCard } from '../components/CartItemCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { createBooking, validateSlots } from '../services/bookingsApi';
import { useCartStore } from '../store/useCartStore';
import { colors, radius, spacing } from '../theme';
import type { CartItem, RootStackParamList } from '../types';
import { computeCartTotals } from '../utils/cartTotals';
import { formatINR } from '../utils/currency';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Payment'>;

// Simulated network delay so "Pay Now (Test Mode)" feels like a real
// payment is being processed — no gateway is actually called.
const MOCK_PAYMENT_DELAY_MS = 1500;

type Phase = 'validating' | 'validationError' | 'ready' | 'paying';

export function PaymentScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { items, clearCart } = useCartStore();
  const [phase, setPhase] = useState<Phase>('validating');
  const [validationError, setValidationError] = useState<string | null>(null);

  const totals = computeCartTotals(items);

  const sendBackToFix = useCallback(
    (item: CartItem) => {
      navigation.navigate('ServiceDetail', { service: item.service, editCartItemId: item.id });
    },
    [navigation],
  );

  const runValidation = useCallback(async () => {
    setPhase('validating');
    setValidationError(null);
    try {
      const results = await validateSlots(
        items.map(item => ({
          itemId: item.id,
          serviceId: item.service.id,
          scheduledDate: item.date,
          startTime: item.startTime24,
          endTime: item.endTime24,
        })),
      );
      const unavailable = results.find(r => !r.available);
      if (unavailable) {
        const failedItem = items.find(i => i.id === unavailable.itemId);
        Alert.alert(
          'Slot unavailable',
          `Your slot for ${failedItem?.service.name ?? 'this service'} is no longer available. Please pick a new time.`,
          [{ text: 'OK', onPress: () => (failedItem ? sendBackToFix(failedItem) : navigation.goBack()) }],
        );
        return;
      }
      setPhase('ready');
    } catch (e) {
      setValidationError(e instanceof Error ? e.message : 'Failed to check slot availability');
      setPhase('validationError');
    }
  }, [items, navigation, sendBackToFix]);

  useEffect(() => {
    runValidation();
    // Only re-run on an explicit retry (button), not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayNow = async () => {
    setPhase('paying');
    try {
      await new Promise<void>(resolve => setTimeout(resolve, MOCK_PAYMENT_DELAY_MS));
      const bookingId = await createBooking(items, params.addressId, totals);
      clearCart();
      navigation.reset({
        index: 0,
        routes: [{ name: 'BookingConfirmation', params: { bookingId, total: totals.total } }],
      });
    } catch (e) {
      Alert.alert(
        'Payment failed',
        e instanceof Error ? e.message : 'Something went wrong. Please try again.',
      );
      setPhase('ready');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Payment" />

      <View style={styles.banner}>
        <Text style={styles.bannerText}>TEST MODE — No real payment will be charged</Text>
      </View>

      {phase === 'validating' && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.statusText}>Checking slot availability…</Text>
        </View>
      )}

      {phase === 'validationError' && (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Couldn't check slot availability</Text>
          <Text style={styles.errorDetail}>{validationError}</Text>
          <TouchableOpacity testID="retryValidationButton" onPress={runValidation}>
            <Text style={styles.retry}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {(phase === 'ready' || phase === 'paying') && (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {items.map(item => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </ScrollView>

          <View style={[styles.summary, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatINR(totals.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform fee</Text>
              <Text style={styles.summaryValue}>{formatINR(totals.platformFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryValue}>{formatINR(totals.gst)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue} testID="paymentTotalValue">
                {formatINR(totals.total)}
              </Text>
            </View>
            <TouchableOpacity
              testID="payNowButton"
              style={[styles.payButton, phase === 'paying' && styles.payButtonDisabled]}
              disabled={phase === 'paying'}
              onPress={handlePayNow}>
              {phase === 'paying' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.payButtonText}>Pay Now (Test Mode)</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: {
    backgroundColor: colors.warningLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  bannerText: { color: colors.warning, fontWeight: '700', fontSize: 12, textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  statusText: { fontSize: 14, color: colors.textMuted, marginTop: spacing.md },
  errorTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  errorDetail: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  retry: { color: colors.primary, fontWeight: '600', marginTop: spacing.md },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  summary: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: 13, color: colors.textMuted },
  summaryValue: { fontSize: 13, color: colors.text },
  totalRow: { marginTop: spacing.xs, marginBottom: spacing.md },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  payButtonDisabled: { opacity: 0.7 },
  payButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

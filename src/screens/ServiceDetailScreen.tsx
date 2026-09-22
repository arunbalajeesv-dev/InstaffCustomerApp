import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddonCard } from '../components/AddonCard';
import { DateSelector } from '../components/DateSelector';
import { Icon } from '../components/Icon';
import { ScopeItemRow } from '../components/ScopeItemRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { TierSelector } from '../components/TierSelector';
import { TierSummaryCard } from '../components/TierSummaryCard';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { useCartStore } from '../store/useCartStore';
import { useServiceDetailStore } from '../store/useServiceDetailStore';
import { useServiceSelectionStore } from '../store/useServiceSelectionStore';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../types';
import { formatINR } from '../utils/currency';
import {
  START_TIME_OPTIONS_MINUTES,
  formatDayDisplay,
  formatTime24,
  formatTimeOfDay,
  getNext7Days,
  isSlotDisabled,
} from '../utils/time';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Route = RouteProp<RootStackParamList, 'ServiceDetail'>;

// Rating isn't wired to real data yet — no reviews table exists — so this is
// a static placeholder, not a live average.
const PLACEHOLDER_RATING = 4.8;

export function ServiceDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { service, editCartItemId } = params;
  const insets = useSafeAreaInsets();

  const { tiers, scopeItems, addons, loading, error, load } = useServiceDetailStore();
  const { items: cartItems, addItem, updateItem } = useCartStore();
  const {
    serviceId,
    selectedTierId,
    addonQuantities,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    selectTier,
    incrementAddon,
    decrementAddon,
    selectDate,
    selectStartTime,
    startNewSelection,
    loadSelection,
  } = useServiceSelectionStore();

  useEffect(() => {
    load(service.id);
    const editingItem = editCartItemId
      ? cartItems.find(i => i.id === editCartItemId)
      : undefined;
    if (editingItem) {
      loadSelection({
        serviceId: service.id,
        tierId: editingItem.tier.id,
        addonQuantities: Object.fromEntries(
          editingItem.addons.map(a => [a.addon.id, a.quantity]),
        ),
        date: editingItem.date,
        startTime: editingItem.startTime,
        endTime: editingItem.endTime,
      });
    } else {
      startNewSelection(service.id);
    }
    // Only re-run when navigating to a (possibly different) service or edit
    // target; cartItems is read once at that moment, not reactively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, service.id, editCartItemId, loadSelection, startNewSelection]);

  // Selection belongs to whichever service is currently active; ignore stale
  // state left over from a previous ServiceDetail visit while it clears.
  const isCurrentService = serviceId === service.id;
  const activeTierId = isCurrentService ? selectedTierId : null;
  const activeDate = isCurrentService ? selectedDate : null;
  const activeStartTime = isCurrentService ? selectedStartTime : null;
  const activeEndTime = isCurrentService ? selectedEndTime : null;
  const activeAddonQuantities = useMemo(
    () => (isCurrentService ? addonQuantities : {}),
    [isCurrentService, addonQuantities],
  );

  const selectedTier = useMemo(
    () => tiers.find(t => t.id === activeTierId),
    [tiers, activeTierId],
  );

  // Fixed for the screen's lifetime so the "less than 2 hours away" cutoff
  // (and the day list itself) doesn't shift mid-interaction.
  const now = useMemo(() => new Date(), []);
  const days = useMemo(() => getNext7Days(now), [now]);
  const selectedDay = useMemo(() => days.find(d => d.key === activeDate), [days, activeDate]);

  // Pre-select today so the time grid always has a day to disable slots
  // against, rather than leaving "no date chosen" as an in-between state.
  useEffect(() => {
    if (isCurrentService && activeDate === null) {
      selectDate(days[0].key);
    }
  }, [isCurrentService, activeDate, days, selectDate]);

  const disabledMinutes = useMemo(() => {
    if (!selectedDay) {
      return new Set<number>();
    }
    return new Set(
      START_TIME_OPTIONS_MINUTES.filter(m => isSlotDisabled(selectedDay.date, m, now)),
    );
  }, [selectedDay, now]);

  // The start-time label is stored as formatted text, not raw minutes, so
  // recover the minutes to recompute the end time if the tier (and so the
  // duration) changes after a start time was already picked.
  const selectedStartMinutes = useMemo(
    () =>
      START_TIME_OPTIONS_MINUTES.find(m => formatTimeOfDay(m) === activeStartTime) ?? null,
    [activeStartTime],
  );

  useEffect(() => {
    if (!isCurrentService || selectedStartMinutes === null || !selectedTier) {
      return;
    }
    const endLabel = formatTimeOfDay(selectedStartMinutes + selectedTier.durationHours * 60);
    if (endLabel !== activeEndTime) {
      selectStartTime(formatTimeOfDay(selectedStartMinutes), endLabel);
    }
  }, [isCurrentService, selectedStartMinutes, selectedTier, activeEndTime, selectStartTime]);

  const addonsTotal = useMemo(
    () =>
      addons.reduce((sum, addon) => {
        const qty = activeAddonQuantities[addon.id] ?? 0;
        return sum + addon.price * qty;
      }, 0),
    [addons, activeAddonQuantities],
  );

  const total = (selectedTier?.price ?? 0) + addonsTotal;
  const includedItems = scopeItems.filter(item => item.isIncluded);
  const excludedItems = scopeItems.filter(item => !item.isIncluded);
  const canAddToCart = !!selectedTier && !!activeDate && !!activeStartTime && !!activeEndTime;

  const handleAddToCart = () => {
    if (
      !selectedTier ||
      !activeDate ||
      !activeStartTime ||
      !activeEndTime ||
      selectedStartMinutes === null
    ) {
      return;
    }
    const addonSelections = addons
      .filter(addon => (activeAddonQuantities[addon.id] ?? 0) > 0)
      .map(addon => ({ addon, quantity: activeAddonQuantities[addon.id] }));
    const endMinutes = selectedStartMinutes + selectedTier.durationHours * 60;

    const item = {
      service,
      tier: selectedTier,
      addons: addonSelections,
      date: activeDate,
      dateDisplay: selectedDay ? formatDayDisplay(selectedDay.date) : activeDate,
      startTime: activeStartTime,
      endTime: activeEndTime,
      startTime24: formatTime24(selectedStartMinutes),
      endTime24: formatTime24(endMinutes),
      linePrice: total,
    };

    if (editCartItemId) {
      updateItem(editCartItemId, item);
    } else {
      addItem(item);
    }
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={service.name} />

      <ScrollView contentContainerStyle={styles.content}>
        {service.heroImageUrl ? (
          <Image source={{ uri: service.heroImageUrl }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Icon name="image" size={32} color={colors.textMuted} />
          </View>
        )}

        <Text style={styles.name}>{service.name}</Text>
        <View style={styles.ratingRow}>
          {[0, 1, 2, 3, 4].map(i => (
            <Icon
              key={i}
              name="star"
              size={16}
              color={i < Math.round(PLACEHOLDER_RATING) ? '#F5A623' : colors.border}
            />
          ))}
          <Text style={styles.ratingText}>{PLACEHOLDER_RATING.toFixed(1)}</Text>
        </View>
        {!!service.description && <Text style={styles.description}>{service.description}</Text>}

        {loading && <ActivityIndicator color={colors.primary} style={styles.status} />}

        {error && (
          <View style={styles.status}>
            <Text style={styles.error}>Couldn't load service details</Text>
            <Text style={styles.errorDetail}>{error}</Text>
            <TouchableOpacity onPress={() => load(service.id)}>
              <Text style={styles.retry}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <>
            <Text style={styles.sectionTitle}>Facility Size</Text>
            {tiers.length === 0 ? (
              <Text style={styles.emptyText}>No pricing tiers available yet.</Text>
            ) : (
              <TierSelector tiers={tiers} selectedTierId={activeTierId} onSelect={selectTier} />
            )}

            <View style={styles.summarySpacing}>
              <TierSummaryCard tier={selectedTier} />
            </View>

            <Text style={styles.sectionTitle}>What's Included</Text>
            {includedItems.length === 0 ? (
              <Text style={styles.emptyText}>Nothing listed yet.</Text>
            ) : (
              includedItems.map(item => (
                <ScopeItemRow key={item.id} description={item.description} included />
              ))
            )}

            <Text style={styles.sectionTitle}>What's Not Included</Text>
            {excludedItems.length === 0 ? (
              <Text style={styles.emptyText}>Nothing listed yet.</Text>
            ) : (
              excludedItems.map(item => (
                <ScopeItemRow key={item.id} description={item.description} included={false} />
              ))
            )}

            <Text style={styles.sectionTitle}>Add-ons</Text>
            {addons.length === 0 ? (
              <Text style={styles.emptyText}>No add-ons available yet.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addonsRow}>
                {addons.map(addon => (
                  <AddonCard
                    key={addon.id}
                    addon={addon}
                    quantity={activeAddonQuantities[addon.id] ?? 0}
                    onIncrement={() => incrementAddon(addon.id)}
                    onDecrement={() => decrementAddon(addon.id)}
                  />
                ))}
              </ScrollView>
            )}

            <Text style={styles.sectionTitle}>Select a Slot</Text>
            <DateSelector days={days} selectedKey={activeDate} onSelect={day => selectDate(day.key)} />
            <View style={styles.timeGridSpacing}>
              <TimeSlotGrid
                minutesOptions={START_TIME_OPTIONS_MINUTES}
                selectedMinutes={selectedStartMinutes}
                disabledMinutes={disabledMinutes}
                onSelect={minutes => {
                  const startLabel = formatTimeOfDay(minutes);
                  const endLabel = selectedTier
                    ? formatTimeOfDay(minutes + selectedTier.durationHours * 60)
                    : null;
                  selectStartTime(startLabel, endLabel);
                }}
              />
            </View>
            {!!activeStartTime && (
              <Text style={styles.slotSummary} testID="slotSummary">
                {activeEndTime
                  ? `Your shift will run ${activeStartTime} – ${activeEndTime}`
                  : `Starts at ${activeStartTime} — select a facility size to see the end time.`}
              </Text>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue} testID="totalValue">
            {formatINR(total)}
          </Text>
        </View>
        <TouchableOpacity
          testID="addToCartButton"
          style={[styles.cartButton, !canAddToCart && styles.cartButtonDisabled]}
          disabled={!canAddToCart}
          onPress={handleAddToCart}>
          <Text style={styles.cartButtonText}>{editCartItemId ? 'Update Cart' : 'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  hero: { width: '100%', height: 180, borderRadius: radius.lg, backgroundColor: colors.surface },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: spacing.lg },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 2 },
  ratingText: { fontSize: 13, color: colors.textMuted, marginLeft: spacing.xs },
  description: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  status: { marginTop: spacing.lg },
  error: { fontSize: 15, fontWeight: '600', color: colors.text },
  errorDetail: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  retry: { color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyText: { fontSize: 13, color: colors.textMuted },
  summarySpacing: { marginTop: spacing.lg },
  addonsRow: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  timeGridSpacing: { marginTop: spacing.md },
  slotSummary: { fontSize: 13, color: colors.textMuted, marginTop: spacing.md },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  totalLabel: { fontSize: 12, color: colors.textMuted },
  totalValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  cartButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  cartButtonDisabled: { backgroundColor: colors.border },
  cartButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

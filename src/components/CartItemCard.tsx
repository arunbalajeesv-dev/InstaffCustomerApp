import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { CartItem } from '../types';
import { formatINR } from '../utils/currency';
import { Icon } from './Icon';

export function CartItemCard({
  item,
  onPress,
  onRemove,
}: {
  item: CartItem;
  onPress: () => void;
  onRemove: () => void;
}) {
  const addonsLabel = item.addons.map(a => `${a.addon.name} ×${a.quantity}`).join(', ');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Icon name="close" size={14} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.name} numberOfLines={1}>
        {item.service.name}
      </Text>
      <Text style={styles.detail}>{item.tier.facilitySize}</Text>
      <Text style={styles.detail}>
        {item.dateDisplay} · {item.startTime} – {item.endTime}
      </Text>
      {!!addonsLabel && (
        <Text style={styles.detail} numberOfLines={2}>
          {addonsLabel}
        </Text>
      )}
      <Text style={styles.price}>{formatINR(item.linePrice)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    paddingRight: spacing.xl + spacing.md,
    marginBottom: spacing.md,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  detail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
});

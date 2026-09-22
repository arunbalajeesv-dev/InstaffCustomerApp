import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { Service } from '../types';
import { formatINR } from '../utils/currency';
import { Icon } from './Icon';

export function ServiceCard({
  service,
  lowestPrice,
  onPress,
}: {
  service: Service;
  lowestPrice: number | undefined;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {service.name}
        </Text>
        {!!service.description && (
          <Text style={styles.description} numberOfLines={2}>
            {service.description}
          </Text>
        )}
        <Text style={styles.price}>
          {lowestPrice !== undefined ? `From ${formatINR(lowestPrice)}` : 'Price on request'}
        </Text>
      </View>
      <Icon name="chevronRight" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  textWrap: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  description: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
});

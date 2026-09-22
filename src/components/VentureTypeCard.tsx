import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { VentureType } from '../types';
import { Icon } from './Icon';

export function VentureTypeCard({
  ventureType,
  onPress,
}: {
  ventureType: VentureType;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.badge}>
        <Text style={styles.initial}>{ventureType.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {ventureType.name}
        </Text>
        {!!ventureType.description && (
          <Text style={styles.description} numberOfLines={2}>
            {ventureType.description}
          </Text>
        )}
      </View>
      <Icon name="chevronRight" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 84,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  initial: { color: colors.primary, fontSize: 20, fontWeight: '700' },
  textWrap: { flex: 1 },
  name: { fontSize: 17, fontWeight: '600', color: colors.text },
  description: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});

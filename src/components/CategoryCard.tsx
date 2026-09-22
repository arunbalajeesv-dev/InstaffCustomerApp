import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { ServiceCategory } from '../types';

export function CategoryCard({ category }: { category: ServiceCategory }) {
  const count = category.services.length;
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.initial}>{category.name.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
      <Text style={styles.count}>
        {count} {count === 1 ? 'service' : 'services'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  initial: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  count: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
});

import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Icon } from './Icon';

export function TopBar({ businessName }: { businessName: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.location}>
        <Icon name="pin" size={22} color={colors.primary} />
        <Text style={styles.name} numberOfLines={1}>
          {businessName}
        </Text>
      </View>
      <View style={styles.profile}>
        <Icon name="user" size={20} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  location: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  name: {
    marginLeft: spacing.sm,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
});

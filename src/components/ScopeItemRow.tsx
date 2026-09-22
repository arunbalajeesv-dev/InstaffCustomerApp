import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { Icon } from './Icon';

export function ScopeItemRow({ description, included }: { description: string; included: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, included ? styles.included : styles.excluded]}>
        <Icon name={included ? 'check' : 'close'} size={14} color="#FFFFFF" />
      </View>
      <Text style={styles.text}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  included: { backgroundColor: colors.primary },
  excluded: { backgroundColor: colors.danger },
  text: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
});

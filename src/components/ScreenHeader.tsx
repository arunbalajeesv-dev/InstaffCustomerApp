import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../theme';
import { Icon } from './Icon';

// Shared back-button + title row for screens pushed onto the stack
// (Home's own TopBar covers the tab root, so this is for everything after it).
export function ScreenHeader({ title }: { title: string }) {
  const navigation = useNavigation();

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.back}>
        <Icon name="chevronLeft" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, flexShrink: 1 },
});

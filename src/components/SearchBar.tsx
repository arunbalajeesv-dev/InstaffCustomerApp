import { StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Icon } from './Icon';

// Placeholder only: not wired to any search yet.
export function SearchBar() {
  return (
    <View style={styles.container}>
      <Icon name="search" size={20} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        placeholder="Search for services"
        placeholderTextColor={colors.textMuted}
        editable={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  input: { flex: 1, marginLeft: spacing.sm, fontSize: 15, color: colors.text },
});

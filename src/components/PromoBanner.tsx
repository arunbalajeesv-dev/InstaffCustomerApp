import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export function PromoBanner() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Get your first booking at 20% off</Text>
        <Text style={styles.subtitle}>Trusted professionals, on demand.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  card: {
    width: 300,
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#FFFFFF', fontSize: 14, marginTop: spacing.sm, opacity: 0.9 },
});

import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryCard } from '../components/CategoryCard';
import { PromoBanner } from '../components/PromoBanner';
import { SearchBar } from '../components/SearchBar';
import { TopBar } from '../components/TopBar';
import { useAppStore } from '../store/useAppStore';
import { useServicesStore } from '../store/useServicesStore';
import { colors, spacing } from '../theme';

export function HomeScreen() {
  const businessName = useAppStore(s => s.businessName);
  const { categories, loading, error, loadServices } = useServicesStore();

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const header = (
    <View>
      <TopBar businessName={businessName} />
      <SearchBar />
      <View style={styles.banner}>
        <PromoBanner />
      </View>
      <Text style={styles.sectionTitle}>Categories</Text>
      {loading && <ActivityIndicator color={colors.primary} style={styles.status} />}
      {error && (
        <View style={styles.status}>
          <Text style={styles.error}>Couldn't load categories</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity onPress={loadServices}>
            <Text style={styles.retry}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}
      {!loading && !error && categories.length === 0 && (
        <Text style={[styles.status, styles.errorDetail]}>No categories yet.</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={categories}
        keyExtractor={c => c.name}
        numColumns={2}
        ListHeaderComponent={header}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <CategoryCard category={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: spacing.xl },
  row: { gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  banner: { marginTop: spacing.lg },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  status: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  error: { fontSize: 15, fontWeight: '600', color: colors.text },
  errorDetail: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  retry: { color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
});

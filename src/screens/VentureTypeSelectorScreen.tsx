import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { VentureTypeCard } from '../components/VentureTypeCard';
import { useVentureTypesStore } from '../store/useVentureTypesStore';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'VentureTypeSelector'>;

export function VentureTypeSelectorScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { ventureTypes, loading, error, loadVentureTypes } = useVentureTypesStore();

  useEffect(() => {
    loadVentureTypes();
  }, [loadVentureTypes]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={params.categoryName} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Where do you need {params.categoryName}?</Text>

        {loading && <ActivityIndicator color={colors.primary} style={styles.status} />}

        {error && (
          <View style={styles.status}>
            <Text style={styles.error}>Couldn't load venture types</Text>
            <Text style={styles.errorDetail}>{error}</Text>
            <TouchableOpacity onPress={loadVentureTypes}>
              <Text style={styles.retry}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && ventureTypes.length === 0 && (
          <Text style={[styles.status, styles.errorDetail]}>No venture types yet.</Text>
        )}

        {ventureTypes.map(ventureType => (
          <VentureTypeCard
            key={ventureType.id}
            ventureType={ventureType}
            onPress={() =>
              navigation.navigate('ServiceList', {
                categoryName: params.categoryName,
                ventureType,
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  status: { marginBottom: spacing.md },
  error: { fontSize: 15, fontWeight: '600', color: colors.text },
  errorDetail: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  retry: { color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
});

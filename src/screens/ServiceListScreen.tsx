import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { ServiceCard } from '../components/ServiceCard';
import { useServiceListStore } from '../store/useServiceListStore';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ServiceList'>;

export function ServiceListScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { services, lowestPrices, loading, error, load } = useServiceListStore();

  useEffect(() => {
    load(params.categoryName, params.ventureType.id);
  }, [load, params.categoryName, params.ventureType.id]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={params.ventureType.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>
          {params.categoryName} for {params.ventureType.name}
        </Text>

        {loading && <ActivityIndicator color={colors.primary} style={styles.status} />}

        {error && (
          <View style={styles.status}>
            <Text style={styles.error}>Couldn't load services</Text>
            <Text style={styles.errorDetail}>{error}</Text>
            <TouchableOpacity
              onPress={() => load(params.categoryName, params.ventureType.id)}>
              <Text style={styles.retry}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && services.length === 0 && (
          <Text style={[styles.status, styles.errorDetail]}>No services yet.</Text>
        )}

        {services.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            lowestPrice={lowestPrices[service.id]}
            onPress={() => navigation.navigate('ServiceDetail', { service })}
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

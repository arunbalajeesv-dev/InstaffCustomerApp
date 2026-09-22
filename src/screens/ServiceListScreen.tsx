import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../types';

type Route = RouteProp<RootStackParamList, 'ServiceList'>;

// Services-for-this-venture-type list isn't built yet; this confirms the
// navigation params arrive correctly and gives the next screen a home.
export function ServiceListScreen() {
  const { params } = useRoute<Route>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={params.ventureType.name} />
      <View style={styles.content}>
        <Text style={styles.title}>
          {params.categoryName} · {params.ventureType.name}
        </Text>
        <Text style={styles.subtitle}>Services for this venture type will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: 17, fontWeight: '600', color: colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

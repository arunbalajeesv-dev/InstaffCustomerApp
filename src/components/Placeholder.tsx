import { StyleSheet, Text, View } from 'react-native';

// Temporary stand-in so the navigators have something to render.
export function Placeholder({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <Text>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

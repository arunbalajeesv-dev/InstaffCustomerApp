import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { createAddress } from '../services/addressesApi';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type AddressFormValues = { address: string };

// Text field for now. Google Maps (place search, pin-drop, geocoding) gets
// wired in on top of this in a later phase.
export function AddressScreen() {
  const navigation = useNavigation<Nav>();
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({ defaultValues: { address: '' } });

  const onSubmit = async (values: AddressFormValues) => {
    setSaving(true);
    try {
      const addressId = await createAddress(values.address);
      navigation.navigate('Payment', { addressId });
    } catch (e) {
      Alert.alert(
        "Couldn't save address",
        e instanceof Error ? e.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Address" />
      <View style={styles.content}>
        <Text style={styles.label}>Delivery address</Text>
        <Controller
          control={control}
          name="address"
          rules={{ required: 'Please enter an address' }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="Flat / building, street, area, city"
              placeholderTextColor={colors.textMuted}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              editable={!saving}
            />
          )}
        />
        {!!errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

        <TouchableOpacity
          testID="continueButton"
          style={[styles.button, saving && styles.buttonDisabled]}
          disabled={saving}
          onPress={() => handleSubmit(onSubmit)()}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 90,
  },
  inputError: { borderColor: colors.danger },
  errorText: { fontSize: 12, color: colors.danger, marginTop: spacing.xs },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, radius, spacing } from '../theme';

type AddressFormValues = { address: string };

// Placeholder: a plain text field for now. Google Maps (place search,
// pin-drop, geocoding) gets wired in on top of this in a later phase.
export function AddressScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({ defaultValues: { address: '' } });

  const onSubmit = (values: AddressFormValues) => {
    Alert.alert('Address saved', `${values.address}\n\nMap-based address entry is coming soon.`);
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
            />
          )}
        />
        {!!errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

        <TouchableOpacity
          testID="continueButton"
          style={styles.button}
          onPress={() => handleSubmit(onSubmit)()}>
          <Text style={styles.buttonText}>Continue</Text>
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
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

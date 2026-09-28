import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
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
import { useAuthStore } from '../store/useAuthStore';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type LoginFormValues = { countryCode: string; phone: string };

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const setConfirmation = useAuthStore(s => s.setConfirmation);
  const [sending, setSending] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ defaultValues: { countryCode: '91', phone: '' } });

  const onSubmit = async (values: LoginFormValues) => {
    const digits = values.phone.replace(/\D/g, '');
    const code = values.countryCode.replace(/\D/g, '');
    const e164Phone = `+${code}${digits}`;

    setSending(true);
    try {
      const confirmation = await signInWithPhoneNumber(getAuth(), e164Phone);
      setConfirmation(confirmation);
      navigation.navigate('Otp', { phone: e164Phone });
    } catch (e) {
      Alert.alert(
        "Couldn't send code",
        e instanceof Error ? e.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Enter your phone number to sign in or create an account.</Text>

        <Text style={styles.label}>Phone number</Text>
        <View style={styles.row}>
          <Controller
            control={control}
            name="countryCode"
            rules={{ required: true, pattern: /^\d{1,3}$/ }}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                testID="countryCodeInput"
                style={[styles.input, styles.countryCodeInput]}
                value={`+${value}`}
                onChangeText={text => onChange(text.replace(/\D/g, ''))}
                onBlur={onBlur}
                keyboardType="phone-pad"
                editable={!sending}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            rules={{ required: 'Please enter your phone number', minLength: 6, maxLength: 14 }}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                testID="phoneInput"
                style={[styles.input, styles.phoneInput]}
                placeholder="Phone number"
                placeholderTextColor={colors.textMuted}
                value={value}
                onChangeText={text => onChange(text.replace(/\D/g, ''))}
                onBlur={onBlur}
                keyboardType="phone-pad"
                editable={!sending}
              />
            )}
          />
        </View>
        {!!errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

        <TouchableOpacity
          testID="sendOtpButton"
          style={[styles.button, sending && styles.buttonDisabled]}
          disabled={sending}
          onPress={() => handleSubmit(onSubmit)()}>
          {sending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Send Code</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  countryCodeInput: { width: 72 },
  phoneInput: { flex: 1 },
  errorText: { fontSize: 12, color: colors.danger, marginTop: spacing.xs },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

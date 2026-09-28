import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import type { ComponentRef } from 'react';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { TextInputKeyPressEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuthStore } from '../store/useAuthStore';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../types';

const CODE_LENGTH = 6;

type Route = RouteProp<RootStackParamList, 'Otp'>;

// No manual navigation on success: confirming with Firebase updates its
// auth state, which RootNavigator listens for and swaps to the app stack —
// this screen only needs to report success/failure locally.
export function OtpScreen() {
  const { params } = useRoute<Route>();
  const { confirmation, setConfirmation } = useAuthStore();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<ComponentRef<typeof TextInput> | null>>([]);

  const code = digits.join('');

  const focus = (index: number) => {
    inputs.current[index]?.focus();
  };

  const handleVerify = async (fullCode: string) => {
    if (!confirmation || fullCode.length !== CODE_LENGTH || verifying) {
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      await confirmation.confirm(fullCode);
      setConfirmation(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Incorrect code. Please try again.');
      setDigits(Array(CODE_LENGTH).fill(''));
      focus(0);
    } finally {
      setVerifying(false);
    }
  };

  const handleChangeText = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 0) {
      return;
    }

    if (cleaned.length > 1) {
      // Pasted or autofilled: spread across this box and the ones after it.
      const next = [...digits];
      let cursor = index;
      for (const char of cleaned) {
        if (cursor >= CODE_LENGTH) break;
        next[cursor] = char;
        cursor += 1;
      }
      setDigits(next);
      const lastFilled = Math.min(cursor, CODE_LENGTH - 1);
      focus(lastFilled);
      if (next.join('').length === CODE_LENGTH) {
        handleVerify(next.join(''));
      }
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (index < CODE_LENGTH - 1) {
      focus(index + 1);
    }
    if (next.join('').length === CODE_LENGTH) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyPress = (e: TextInputKeyPressEvent, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && digits[index] === '' && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      focus(index - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Verify" />
      <View style={styles.content}>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {params.phone}</Text>

        <View style={styles.boxRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={el => {
                inputs.current[index] = el;
              }}
              testID={`otpBox-${index}`}
              style={[styles.box, !!error && styles.boxError]}
              value={digit}
              onChangeText={text => handleChangeText(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH} // allows pasting/autofilling the full code into one box
              editable={!verifying}
              textAlign="center"
            />
          ))}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          testID="verifyButton"
          style={[
            styles.button,
            (code.length !== CODE_LENGTH || verifying) && styles.buttonDisabled,
          ]}
          disabled={code.length !== CODE_LENGTH || verifying}
          onPress={() => handleVerify(code)}>
          {verifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.lg, lineHeight: 20 },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  box: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  boxError: { borderColor: colors.danger },
  errorText: { fontSize: 13, color: colors.danger, marginTop: spacing.md },
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

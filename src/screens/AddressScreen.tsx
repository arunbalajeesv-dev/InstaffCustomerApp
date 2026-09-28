import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
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
import {
  autocompletePlaces,
  createSessionToken,
  getPlaceDetails,
  type PlacePrediction,
} from '../services/placesApi';
import { useAuthStore } from '../store/useAuthStore';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

type SelectedPlace = { description: string; latitude: number; longitude: number };

export function AddressScreen() {
  const navigation = useNavigation<Nav>();
  const userId = useAuthStore(s => s.supabaseUser?.id);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [resolvingPlaceId, setResolvingPlaceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sessionTokenRef = useRef(createSessionToken());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchSeqRef = useRef(0);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    setSelectedPlace(null);
    setError(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = text.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const seq = ++searchSeqRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await autocompletePlaces(trimmed, sessionTokenRef.current);
        if (searchSeqRef.current === seq) {
          setSuggestions(results);
        }
      } catch {
        if (searchSeqRef.current === seq) {
          setSuggestions([]);
        }
      } finally {
        if (searchSeqRef.current === seq) {
          setSearching(false);
        }
      }
    }, DEBOUNCE_MS);
  };

  const handleSelectSuggestion = async (prediction: PlacePrediction) => {
    setSuggestions([]);
    setQuery(prediction.description);
    setResolvingPlaceId(prediction.placeId);
    setError(null);
    try {
      const details = await getPlaceDetails(prediction.placeId, sessionTokenRef.current);
      setSelectedPlace({
        description: details.formattedAddress || prediction.description,
        latitude: details.latitude,
        longitude: details.longitude,
      });
      // Start a fresh session for the next search, per Google's billing guidance.
      sessionTokenRef.current = createSessionToken();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load that address. Please try again.');
    } finally {
      setResolvingPlaceId(null);
    }
  };

  const handleContinue = async () => {
    if (!selectedPlace) {
      setError('Please select an address from the suggestions');
      return;
    }
    if (!userId) {
      return;
    }
    setSaving(true);
    try {
      const addressId = await createAddress(
        selectedPlace.description,
        selectedPlace.latitude,
        selectedPlace.longitude,
        userId,
      );
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

  const showDropdown = suggestions.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Address" />
      <View style={styles.content}>
        <Text style={styles.label}>Business address</Text>
        <View style={styles.inputRow}>
          <TextInput
            testID="addressInput"
            style={[styles.input, !!error && styles.inputError]}
            placeholder="Start typing your address..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleChangeText}
            editable={!saving}
          />
          {searching && (
            <ActivityIndicator style={styles.inputSpinner} size="small" color={colors.primary} />
          )}
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {showDropdown && (
          <View style={styles.dropdown} testID="suggestionsList">
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={item.placeId}
                testID={`suggestion-${index}`}
                style={styles.suggestionRow}
                disabled={resolvingPlaceId !== null}
                onPress={() => handleSelectSuggestion(item)}>
                <Text style={styles.suggestionMain}>{item.mainText}</Text>
                {!!item.secondaryText && (
                  <Text style={styles.suggestionSecondary}>{item.secondaryText}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {resolvingPlaceId !== null && (
          <View style={styles.resolvingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.resolvingText}>Loading address details...</Text>
          </View>
        )}

        {selectedPlace && !resolvingPlaceId && (
          <View style={styles.selectedBox} testID="selectedAddress">
            <Text style={styles.selectedText}>{selectedPlace.description}</Text>
            <Text style={styles.selectedCoords}>
              {selectedPlace.latitude.toFixed(5)}, {selectedPlace.longitude.toFixed(5)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          testID="continueButton"
          style={[styles.button, saving && styles.buttonDisabled]}
          disabled={saving}
          onPress={handleContinue}>
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
  inputRow: { justifyContent: 'center' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingRight: spacing.xl,
    fontSize: 15,
    color: colors.text,
  },
  inputSpinner: { position: 'absolute', right: spacing.md },
  inputError: { borderColor: colors.danger },
  errorText: { fontSize: 12, color: colors.danger, marginTop: spacing.xs },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionMain: { fontSize: 14, fontWeight: '600', color: colors.text },
  suggestionSecondary: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  resolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  resolvingText: { fontSize: 13, color: colors.textMuted },
  selectedBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  selectedText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  selectedCoords: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
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

import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import type { User } from '@react-native-firebase/auth';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AddressScreen } from '../screens/AddressScreen';
import { BookingConfirmationScreen } from '../screens/BookingConfirmationScreen';
import { CartScreen } from '../screens/CartScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OtpScreen } from '../screens/OtpScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { ServiceListScreen } from '../screens/ServiceListScreen';
import { VentureTypeSelectorScreen } from '../screens/VentureTypeSelectorScreen';
import { trackAppOpen } from '../services/analytics';
import { registerForPushNotifications } from '../services/notifications';
import { setCurrentScreen } from '../services/sentry';
import { findOrCreateUserByPhone } from '../services/usersApi';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme';
import type { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const {
    initializing,
    firebaseUser,
    supabaseUser,
    setInitializing,
    setFirebaseUser,
    setSupabaseUser,
  } = useAuthStore();

  useEffect(() => {
    trackAppOpen();
  }, []);

  // Keeps Sentry's "screen" tag current so any error reported after this
  // point is attributed to whatever the user was actually looking at.
  // getCurrentRoute() resolves to the innermost focused route even across
  // nested navigators (e.g. which tab inside TabNavigator), not just the
  // top-level stack screen.
  const trackScreen = () => {
    const routeName = navigationRef.getCurrentRoute()?.name;
    if (routeName) {
      setCurrentScreen(routeName);
    }
  };

  useEffect(() => {
    // Fires once immediately with the restored session (or null) on cold
    // start, then again on every sign-in/sign-out. Either way, ensure a
    // matching Supabase profile exists before treating the user as
    // logged in — the app stack needs a real profile id to attribute
    // bookings/addresses to.
    const unsubscribe = onAuthStateChanged(getAuth(), async (user: User | null) => {
      setFirebaseUser(user);
      if (user?.phoneNumber) {
        try {
          const profile = await findOrCreateUserByPhone(user.phoneNumber);
          setSupabaseUser(profile);
          // Fire-and-forget: request the notification permission and sync
          // this device's FCM token. Runs on every resolved login (fresh
          // sign-in or a restored session) — harmless since the OS only
          // prompts once and re-saving the token is a no-op in practice.
          registerForPushNotifications(profile.id);
        } catch {
          // Leave supabaseUser null — isLoggedIn below then stays false, so
          // the user lands back on Login rather than proceeding without a
          // valid profile id. Retrying login (still a valid Firebase
          // session) re-attempts this lookup.
          setSupabaseUser(null);
        }
      } else {
        setSupabaseUser(null);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, [setFirebaseUser, setSupabaseUser, setInitializing]);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isLoggedIn = !!firebaseUser && !!supabaseUser;

  return (
    <NavigationContainer ref={navigationRef} onReady={trackScreen} onStateChange={trackScreen}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="VentureTypeSelector" component={VentureTypeSelectorScreen} />
            <Stack.Screen name="ServiceList" component={ServiceListScreen} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Address" component={AddressScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

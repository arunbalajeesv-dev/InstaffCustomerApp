import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddressScreen } from '../screens/AddressScreen';
import { CartScreen } from '../screens/CartScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { ServiceListScreen } from '../screens/ServiceListScreen';
import { VentureTypeSelectorScreen } from '../screens/VentureTypeSelectorScreen';
import type { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="VentureTypeSelector" component={VentureTypeSelectorScreen} />
        <Stack.Screen name="ServiceList" component={ServiceListScreen} />
        <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Address" component={AddressScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

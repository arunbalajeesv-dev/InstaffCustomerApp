import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

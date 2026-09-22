import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, type IconName } from '../components/Icon';
import { Placeholder } from '../components/Placeholder';
import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../theme';
import type { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();

const icons: Record<keyof TabParamList, IconName> = {
  Home: 'home',
  Bookings: 'calendar',
  Track: 'navigation',
  Account: 'user',
};

const BookingsPlaceholder = () => <Placeholder label="Bookings" />;
const TrackPlaceholder = () => <Placeholder label="Track" />;
const AccountPlaceholder = () => <Placeholder label="Account" />;

const renderTabIcon =
  (name: IconName) =>
  ({ color, size }: { color: string; size: number }) =>
    <Icon name={name} size={size} color={color} />;

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: renderTabIcon(icons[route.name]),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsPlaceholder} />
      <Tab.Screen name="Track" component={TrackPlaceholder} />
      <Tab.Screen name="Account" component={AccountPlaceholder} />
    </Tab.Navigator>
  );
}

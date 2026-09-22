import type { NavigatorScreenParams } from '@react-navigation/native';
import type { VentureType } from './ventureType';

export type TabParamList = {
  Home: undefined;
  Bookings: undefined;
  Track: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  VentureTypeSelector: { categoryName: string };
  ServiceList: { categoryName: string; ventureType: VentureType };
};

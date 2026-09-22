import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Service } from './service';
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
  // editCartItemId: present when arriving from Cart to edit an existing item,
  // absent for a brand-new addition.
  ServiceDetail: { service: Service; editCartItemId?: string };
  Cart: undefined;
  Address: undefined;
};

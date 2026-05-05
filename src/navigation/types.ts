/**
 * Navigation type definitions
 */
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type SettingsStackParamList = {
  Settings: undefined;
};

// Root tab param list
export type RootTabParamList = {
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// Screen props types
export type SettingsScreenProps = NativeStackScreenProps<
  SettingsStackParamList,
  'Settings'
>;

// Tab screen props
export type SettingsTabProps = BottomTabScreenProps<
  RootTabParamList,
  'SettingsTab'
>;

// Utility type for navigation prop
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}

import React, { useState } from 'react';
import { View, StyleSheet, Platform, useColorScheme } from 'react-native';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Cog6ToothIcon } from 'react-native-heroicons/outline';
import {
  Cog6ToothIcon as Cog6ToothIconSolid,
} from 'react-native-heroicons/solid';

import {
  lightTheme,
  darkTheme,
  lightAppColors,
  darkAppColors,
} from '@/config/theme';
import { useSettingsStore } from '@/stores/settingsStore';
import type { RootTabParamList } from './types';

import { SettingsStack } from './SettingsStack';
import { DesktopSidebar, type SidebarTab } from './DesktopSidebar';

const isDesktop = Platform.OS === 'macos' || Platform.OS === 'windows';

const Tab = createBottomTabNavigator<RootTabParamList>();

function renderSettingsIcon({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) {
  return focused ? (
    <Cog6ToothIconSolid color={color} size={size} />
  ) : (
    <Cog6ToothIcon color={color} size={size} />
  );
}

const tabComponents: Record<SidebarTab, React.ComponentType> = {
  SettingsTab: SettingsStack,
};

function DesktopNavigator({ theme }: { theme: typeof lightTheme }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('SettingsTab');
  const ActiveComponent = tabComponents[activeTab];

  return (
    <NavigationContainer theme={theme}>
      <View style={styles.desktopContainer}>
        <DesktopSidebar activeTab={activeTab} onTabPress={setActiveTab} />
        <View style={styles.desktopContent}>
          <ActiveComponent />
        </View>
      </View>
    </NavigationContainer>
  );
}

function MobileNavigator({ theme }: { theme: typeof lightTheme }) {
  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.dark
            ? darkAppColors.textMuted
            : lightAppColors.textMuted,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
        }}
      >
        <Tab.Screen
          name='SettingsTab'
          component={SettingsStack}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: renderSettingsIcon,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export function AppNavigator() {
  const systemColorScheme = useColorScheme();
  const { theme: userTheme } = useSettingsStore();
  const isDark =
    userTheme === 'system'
      ? systemColorScheme === 'dark'
      : userTheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  // Keep NativeWind's colorScheme in lockstep with the resolved theme so any
  // `dark:` variants follow the same source as the navigation chrome + content.
  React.useEffect(() => {
    nativewindColorScheme.set(isDark ? 'dark' : 'light');
  }, [isDark]);

  if (isDesktop) {
    return <DesktopNavigator theme={theme} />;
  }

  return <MobileNavigator theme={theme} />;
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopContent: {
    flex: 1,
  },
});

import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@sudobility/components-rn';
import { Cog6ToothIcon } from 'react-native-heroicons/outline';
import { Cog6ToothIcon as Cog6ToothIconSolid } from 'react-native-heroicons/solid';

export type SidebarTab = 'SettingsTab';

interface DesktopSidebarProps {
  activeTab: SidebarTab;
  onTabPress: (tab: SidebarTab) => void;
}

const ICON_SIZE = 22;

const tabs: { key: SidebarTab; label: string }[] = [
  { key: 'SettingsTab', label: 'Settings' },
];

function TabIcon({
  tab,
  focused,
}: {
  tab: SidebarTab;
  focused: boolean;
}) {
  const className = focused ? 'text-primary' : 'text-muted-foreground';
  switch (tab) {
    case 'SettingsTab':
      return focused ? (
        <Cog6ToothIconSolid className={className} size={ICON_SIZE} />
      ) : (
        <Cog6ToothIcon className={className} size={ICON_SIZE} />
      );
  }
}

export function DesktopSidebar({ activeTab, onTabPress }: DesktopSidebarProps) {
  return (
    <View className='w-20 bg-card border-r border-border pt-2 items-center'>
      <View className='w-10 h-10 rounded-md justify-center items-center mb-4'>
        <Text size='xl' weight='bold' color='primary'>
          S
        </Text>
      </View>
      {tabs.map(({ key, label }) => {
        const focused = activeTab === key;
        return (
          <Pressable
            key={key}
            className={`w-16 py-2 rounded-md items-center mb-1 ${
              focused ? 'bg-background' : ''
            }`}
            onPress={() => onTabPress(key)}
          >
            <TabIcon tab={key} focused={focused} />
            <Text
              size='xs'
              weight='medium'
              color={focused ? 'primary' : 'muted'}
              className='mt-1'
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

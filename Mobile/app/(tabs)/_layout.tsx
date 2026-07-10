import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';

function TabBarBg() {
  return (
    <View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
      backgroundColor: '#0a1420',
      borderTopWidth: 1,
      borderTopColor: 'rgba(16,185,129,0.15)',
    }} />
  );
}

function TabIcon({ name, color, focused }: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={{
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: focused ? 'rgba(16,185,129,0.15)' : 'transparent',
      justifyContent: 'center', alignItems: 'center',
    }}>
      <Feather name={name} size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#475569',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBg />,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: 'My Farms',
          tabBarIcon: ({ color, focused }) => <TabIcon name="map" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="irrigation"
        options={{
          title: 'Irrigation',
          tabBarIcon: ({ color, focused }) => <TabIcon name="droplet" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => <TabIcon name="grid" color={color} focused={focused} />,
        }}
      />

      {/* Hidden from tab bar — still part of (tabs) group */}
      <Tabs.Screen name="water"   options={{ href: null }} />
      <Tabs.Screen name="sensors" options={{ href: null }} />
    </Tabs>
  );
}

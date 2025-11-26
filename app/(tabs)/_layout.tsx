import { useAppTheme } from '@/hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: {
          fontFamily: 'NotoSans_700Bold',
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,

        tabBarActiveTintColor: '#FFFFFF',
        tabBarActiveBackgroundColor: colors.primary,

        tabBarInactiveTintColor: colors.icon,
        tabBarInactiveBackgroundColor: colors.surface,

        tabBarItemStyle: {
          marginHorizontal: 10,
          marginVertical: 5,
          borderRadius: 15,
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontFamily: 'NotoSans_700Bold',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          height: 60 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reviews"
        options={{
          title: 'Reseñas',
          tabBarIcon: ({ color }) => (
            <Feather name="message-square" size={24} color={color} />
          ),
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="reservation"
        options={{
          title: 'Reservas',
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: 'Avisos',
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Feather name="bell" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

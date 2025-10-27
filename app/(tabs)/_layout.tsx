import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';

export default function TabLayout() {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{

        // Estilos Globales para la cabecera
        headerTitleStyle: {
          fontFamily: 'NotoSans_700Bold', // Aplica la fuente al título
        },
        headerStyle: {
          backgroundColor: colors.surface, // Aplica el color de fondo del tema
        },
        headerTintColor: colors.text, // Aplica el color de texto del tema

        // Estilos Globales para pestaña activa
        tabBarActiveTintColor: '#FFFFFF',
        tabBarActiveBackgroundColor: colors.primary,

        // Estilos Globales para pestaña inactiva
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

        // Estilo de la barra de navegación principal
        tabBarStyle: {
          backgroundColor: colors.surface,
          height: 60 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          paddingBottom: insets.bottom,
        },
      }}>
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
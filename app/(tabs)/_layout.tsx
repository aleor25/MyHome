import { Tabs } from 'expo-router';
import React from 'react';

// Asumo que tus colores están en esta ruta
import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  const colors = Colors.light;

  return (
    <Tabs
      screenOptions={{
        // Estilos Globales para pestaña activa
        tabBarActiveTintColor: '#FFFFFF',
        tabBarActiveBackgroundColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarInactiveBackgroundColor: colors.navbar, 

        tabBarItemStyle: {
          marginHorizontal: 10,
          marginVertical: 5,
          borderRadius: 15,
          overflow: 'hidden',
        },

        // Estilo de la barra de navegación principal
        tabBarStyle: {
          backgroundColor: colors.navbar,
          height: 65,
          elevation: 0,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservation"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ color }) => (
            <Feather name="bell" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

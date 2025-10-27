import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();

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
          height: 60 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          paddingBottom: insets.bottom,
        },
      }}>
      
      {/* Pestaña de Inicio (Home) */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      ⭐️ NUEVA PESTAÑA PARA RESEÑAS ⭐️
      {/* El nombre debe coincidir con el nombre del directorio: 'reviews'.
         Esto cargará el stack (o la pantalla) definida en 'app/(tabs)/reviews/'.
      */}
      <Tabs.Screen
        name="reviews" // 👈 Nombre del directorio 'reviews'
        options={{
          title: 'Reseñas',
          tabBarIcon: ({ color }) => (
            <Feather name="message-square" size={24} color={color} /> // O 'star'
          ),
          headerShown: false, // Opcional: Ocultar el encabezado de las pestañas si el stack interno lo maneja
        }}
      />
      
      {/* Pestaña de Reservas */}
      <Tabs.Screen
        name="reservation"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />
      
      {/* Pestaña de Avisos */}
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ color }) => (
            <Feather name="bell" size={24} color={color} />
          ),
        }}
      />
      
      {/* Pestaña de Perfil */}
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
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../assets/colors/colors';
import { PropietarioDashboardScreen } from '../screens/PropietarioDashboardScreen';
import { MisPropriedadesScreen } from '../screens/MisPropriedadesScreen';
import { BuscarPropiedadesScreen } from '../screens/BuscarPropiedadesScreen';
import { MisReservasScreen } from '../screens/MisReservasScreen';
import { NotificacionesScreen } from '../screens/NotificacionesScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { ReservasScreen } from '../screens/ReservasScreen';
import { DetallePropiedad } from '../screens/DetallePropiedad';
import { AgregarPropiedad } from '../screens/AgregarPropiedad';
import { EditarPropiedad } from '../screens/EditarPropiedad';
import { PagoScreen } from '../screens/PagoScreen';
import { ConfirmacionPago } from '../screens/ConfirmacionPago';
import { EditarPerfilScreen } from '../screens/EditarPerfilScreen';
import { CambiarContrasenaScreen } from '../screens/CambiarContrasenaScreen';
import { DetalleReservaScreen } from '../screens/DetalleReservaScreen';
import { CrearResenaScreen } from '../screens/CrearResenaScreen';
import { FavoritosScreen } from '../screens/FavoritosScreen';
import { EscanearQRScreen } from '../screens/EscanearQRScreen';
import { ScanQRHuespedScreen } from '../screens/ScanQRHuespedScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BuscarStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="BuscarPropiedades"
        component={BuscarPropiedadesScreen}
        options={{ title: '🔍 Buscar Propiedades' }}
      />
      <Stack.Screen
        name="DetallePropiedad"
        component={DetallePropiedad}
        options={{ title: 'Detalles de Propiedad' }}
      />
      <Stack.Screen
        name="PagoScreen"
        component={PagoScreen}
        options={{ title: '💳 Pagar Reserva' }}
      />
      <Stack.Screen
        name="ConfirmacionPago"
        component={ConfirmacionPago}
        options={{ title: '✓ Confirmación', headerLeft: () => null }}
      />
    </Stack.Navigator>
  );
};

const PropiedadesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MisPropriedadesScreen"
        component={MisPropriedadesScreen}
        options={{ title: '🏠 Mis Propiedades', headerShown: false }}
      />
      <Stack.Screen
        name="AgregarPropiedad"
        component={AgregarPropiedad}
        options={{ title: '➕ Agregar Propiedad' }}
      />
      <Stack.Screen
        name="EditarPropiedad"
        component={EditarPropiedad}
        options={{ title: '✏️ Editar Propiedad' }}
      />
    </Stack.Navigator>
  );
};

const PerfilStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="PerfilScreen"
        component={PerfilScreen}
        options={{ title: '👤 Perfil', headerShown: false }}
      />
      <Stack.Screen
        name="EditarPerfil"
        component={EditarPerfilScreen}
        options={{ title: '✏️ Editar Perfil' }}
      />
      <Stack.Screen
        name="CambiarContrasena"
        component={CambiarContrasenaScreen}
        options={{ title: '🔐 Cambiar Contraseña' }}
      />
    </Stack.Navigator>
  );
};

const ReservasStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MisReservasScreen"
        component={MisReservasScreen}
        options={{ title: '📅 Mis Reservas', headerShown: false }}
      />
      <Stack.Screen
        name="DetalleReserva"
        component={DetalleReservaScreen}
        options={{ title: '📋 Detalle de Reserva' }}
      />
      <Stack.Screen
        name="CrearResena"
        component={CrearResenaScreen}
        options={{ title: '⭐ Dejar Reseña' }}
      />
      <Stack.Screen
        name="ScanQRHuesped"
        component={ScanQRHuespedScreen}
        options={{ title: '📱 Escanear QR' }}
      />
    </Stack.Navigator>
  );
};

export const PropietarioNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={PropietarioDashboardScreen}
        options={{
          title: '📊 Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="MisProperidades"
        component={PropiedadesStack}
        options={{
          title: '🏠 Mis Propiedades',
          tabBarLabel: 'Propiedades',
        }}
      />
      <Tab.Screen
        name="Reservas"
        component={ReservasScreen}
        options={{
          title: '📅 Reservas',
          tabBarLabel: 'Reservas',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilStack}
        options={{
          title: '👤 Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export const HuespedNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="Buscar"
        component={BuscarStack}
        options={{
          title: '🔍 Buscar Propiedades',
          tabBarLabel: 'Buscar',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          title: '❤️ Favoritos',
          tabBarLabel: 'Favoritos',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="MisReservas"
        component={ReservasStack}
        options={{
          title: '📅 Mis Reservas',
          tabBarLabel: 'Reservas',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="EscanearQR"
        component={ScanQRHuespedScreen}
        options={{
          title: '📱 Escanear QR',
          tabBarLabel: 'Escanear QR',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilStack}
        options={{
          title: '👤 Perfil',
          tabBarLabel: 'Perfil',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};
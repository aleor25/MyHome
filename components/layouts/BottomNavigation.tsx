// components/layouts/BottomNavigation.tsx

import { router, type Router } from 'expo-router'; // 👈 IMPORTAR EL TIPO 'Router'
import { Bookmark, Home, Settings, User } from 'lucide-react-native';
import React, { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// =========================================================
// ⭐️ CORRECCIONES DE TIPADO
// =========================================================

// Definición del tipo para íconos de Lucide (ya incluye fill/color/size)
type LucideIconType = FC<{ color: string; fill: string; size: number }>;

// Asersión de tipo en los íconos
const HomeIcon = Home as LucideIconType;
const BookmarkIcon = Bookmark as LucideIconType;
const UserIcon = User as LucideIconType;
const SettingsIcon = Settings as LucideIconType;


// -------------------------------------------------------------------
// DEFINICIÓN DE BOTONES DE NAVEGACIÓN
// -------------------------------------------------------------------

const navButtons = [
    { key: 'home', label: 'Inicio', icon: HomeIcon, route: '/' },
    { key: 'bookings', label: 'Reservas', icon: BookmarkIcon, route: '/bookings' },
    { key: 'profile', label: 'Perfil', icon: UserIcon, route: '/profile' },
    { key: 'settings', label: 'Ajustes', icon: SettingsIcon, route: '/settings' },
];

// -------------------------------------------------------------------
// TIPADO DE PROPS DEL COMPONENTE
// -------------------------------------------------------------------

interface BottomNavigationProps {
    activeScreen: string;
    onNavigate: (screen: string) => void;
}

// -------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------------------

export default function BottomNavigation({ activeScreen, onNavigate }: BottomNavigationProps) {

    // ⭐️ FUNCIÓN handlePress CORREGIDA
    const handlePress = (buttonKey: string, route: string) => {
        onNavigate(buttonKey);
        
        if (route) {
            // Utilizamos aserción de tipo para indicar que 'route' es una ruta de Expo Router válida.
            // Esto elimina el error de tipado 'string is not assignable to RelativePathString'.
            router.push(route as Parameters<Router['push']>[0]);
        }
    };

    return (
        <View style={styles.container}>
            {navButtons.map((button) => {
                const isActive = button.key === activeScreen;
                const iconColor = isActive ? '#3B82F6' : '#6B7280';
                const IconComponent = button.icon; // Componente tipado

                return (
                    <TouchableOpacity
                        key={button.key}
                        style={styles.button}
                        onPress={() => handlePress(button.key, button.route)}
                    >
                        {/* Uso del componente tipado con fill y color */}
                        <IconComponent 
                            size={24} 
                            color={iconColor} 
                            fill={isActive ? '#E0F2FE' : 'none'} 
                        />
                        <Text style={[styles.label, isActive && styles.activeLabel]}>
                            {button.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// -------------------------------------------------------------------
// ESTILOS
// -------------------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 20, // Ajuste para SafeArea/notch
    },
    button: {
        flex: 1,
        alignItems: 'center',
        padding: 4,
        gap: 4,
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeLabel: {
        color: '#3B82F6',
        fontWeight: '600',
    },
});
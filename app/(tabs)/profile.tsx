import { ThemeColors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

// --- IMPORTANTE ---
// Asegúrate de que estas rutas sean correctas según tu proyecto.
// Tu ARCHITECTURE.md dice que están en 'components/ui/'.
// ------------------

import { ThemedText, ThemedView } from '@/components/ui/themed';

export default function PerfilScreen() {
    const colors = ThemeColors.light;

    return (
        // ThemedView debería aplicar automáticamente tu color de fondo 'f3fbf8'
        <ThemedView style={styles.container}>

            {/* Esto establece el título de la pantalla (útil si navegas "dentro" de esta pestaña) */}
            <Stack.Screen options={{ title: 'Perfil' }} />

            {/* Un ícono de marcador de posición */}
            <Feather
                name="user" // Ícono de "usuario" para el perfil
                size={48}
                color={colors.icon} // Tu color de ícono oscuro
                style={styles.icon}
            />

            {/* Texto de marcador de posición */}
            <ThemedText type="title" style={styles.title}>
                Perfil
            </ThemedText>

            <ThemedText style={styles.subtitle}>
                Aquí irá el contenido de la pantalla de perfil.
            </ThemedText>

        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        marginBottom: 8,
        // Asegúrate de que tu ThemedText tipo "title" use el color de texto correcto
    },
    subtitle: {
        textAlign: 'center',
        color: ThemeColors.light.danger // Un gris más sutil
    },
});

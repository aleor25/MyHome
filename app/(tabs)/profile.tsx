import { ScreenWrapper } from '@/components/layouts/ScreenWrapper';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ProfileScreen() {
    const colors = useAppTheme();

    return (
        <ScreenWrapper>
            <Stack.Screen options={{ title: 'Perfil' }} />

            <Feather name="user" size={48} color={colors.icon} style={styles.icon} />
            <ThemedText type="title" style={styles.title}>
                Perfil
            </ThemedText>
            <ThemedText style={styles.subtitle}>
                Aquí irá el contenido de la pantalla de perfil.
            </ThemedText>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    icon: {
        marginBottom: 16,
        alignSelf: 'center',
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
    },
});

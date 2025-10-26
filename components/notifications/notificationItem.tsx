// En: components/notificaciones/NotificacionItem.tsx
import { ThemedText, ThemedView } from '@/components/ui/themed';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons'; // O tu librería de iconos
import React from 'react';
import { StyleSheet, View } from 'react-native';

export type Notificacion = {
    id: string;
    type: 'confirmacion' | 'recordatorio' | 'pago';
    title: string;
    description: string;
    time: string;
};

type NotificacionItemProps = {
    item: Notificacion;
};

const iconMap = {
    confirmacion: {
        name: 'checkmark-circle-outline',
        color: 'success',
    },
    recordatorio: {
        name: 'calendar-outline',
        color: 'tint',
    },
    pago: {
        name: 'card-outline',
        color: 'warning', // Puedes añadir 'warning' a tus colores
    },
};

export function NotificacionItem({ item }: NotificacionItemProps) {
    const iconConfig = iconMap[item.type] || iconMap.recordatorio;
    const iconColor = useThemeColor({}, iconConfig.color as any);

    return (
        <ThemedView style={styles.card} variant="card">
            <Ionicons name={iconConfig.name as any} size={24} color={iconColor} style={styles.icon} />

            <View style={styles.content}>
                <ThemedText style={styles.title}>{item.title}</ThemedText>
                <ThemedText type="caption" style={styles.description}>{item.description}</ThemedText>
            </View>

            <ThemedText type="caption" style={styles.time}>{item.time}</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        marginRight: 12,
        marginTop: 2,
    },
    content: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
    time: {
        fontSize: 12,
    },
});
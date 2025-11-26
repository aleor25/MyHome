import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView'; // Asegúrate que la importación es correcta
import { useThemeColor } from '@/hooks/useThemeColor'; // Verifica esta ruta
import { Ionicons } from '@expo/vector-icons';
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
        color: 'success', // Usa los nombres de tu tema
    },
    recordatorio: {
        name: 'calendar-outline',
        color: 'primary', // Usa los nombres de tu tema
    },
    pago: {
        name: 'card-outline',
        color: 'warning', // Usa los nombres de tu tema
    },
};

// Asegúrate que el nombre del componente sea PascalCase
export function NotificationItem({ item }: NotificacionItemProps) {
    const iconConfig = iconMap[item.type] || iconMap.recordatorio;
    // Verifica que useThemeColor esté importado correctamente
    const iconColor = useThemeColor({}, iconConfig.color as any);

    return (
        // --- CORRECCIÓN AQUÍ ---
        // Añadimos variant="card" para usar el color 'surface'
        <ThemedView style={styles.card} variant="card">
            <Ionicons name={iconConfig.name as any} size={24} color={iconColor} style={styles.icon} />

            <View style={styles.content}>
                <ThemedText style={styles.title}>{item.title}</ThemedText>
                {/* Asegúrate que ThemedText maneje 'caption' y use 'textSecondary' */}
                <ThemedText type="caption" style={styles.description}>{item.description}</ThemedText>
            </View>

            {/* Asegúrate que ThemedText maneje 'caption' y use 'textSecondary' */}
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
        // Sombras (opcional, puedes ajustarlas o quitarlas)
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
        fontWeight: '600', // Podrías usar tu fuente Bold aquí si la tienes en ThemedText
        marginBottom: 4,
        // El color 'text' (negro) se aplica por defecto en ThemedText
    },
    description: {
        fontSize: 14,
        // El color 'textSecondary' (gris) se aplica con type="caption"
    },
    time: {
        fontSize: 12,
        // El color 'textSecondary' (gris) se aplica con type="caption"
    },
});


// En: app/(tabs)/notificaciones.tsx
import { Notificacion, NotificacionItem } from '@/components/notifications/notificationItem';
import { Chip } from '@/components/ui/chip';
import { ThemedText, ThemedView } from '@/components/ui/themed';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, SectionList, StyleSheet, View } from 'react-native';

// Datos de ejemplo
const DUMMY_NOTIFICACIONES: { title: string; data: Notificacion[] }[] = [
    {
        title: 'Hoy',
        data: [
            { id: '1', type: 'confirmacion', title: 'Tu reserva fue confirmada', description: 'Reserva #A1B2C3 - Habitación Doble', time: '10:24' },
            { id: '2', type: 'recordatorio', title: 'Recordatorio: completa el check-in digital', description: 'Sube tu documento y verifica datos', time: '09:05' },
        ],
    },
    {
        title: 'Ayer',
        data: [
            { id: '3', type: 'pago', title: 'Tu pago ha sido procesado', description: 'Visa **** 2481 - Total $120,00', time: '18:41' },
            { id: '4', type: 'recordatorio', title: 'Recuerda tu llegada mañana', description: 'Check-in el 12 Oct, 14:00', time: '08:12' },
        ],
    },
];

const FILTERS = ['Todos', 'Confirmaciones', 'Recordatorios', 'Pagos'];

export default function PantallaNotificaciones() {
    const [activeFilter, setActiveFilter] = useState('Todos');

    const filteredData = DUMMY_NOTIFICACIONES.map(section => ({
        title: section.title,
        data: section.data.filter(notif => {
            if (activeFilter === 'Todos') return true;
            const filterMap = {
                'Confirmaciones': 'confirmacion',
                'Recordatorios': 'recordatorio',
                'Pagos': 'pago'
            };
            return notif.type === filterMap[activeFilter as keyof typeof filterMap];
        })
    })).filter(section => section.data.length > 0);

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <ThemedText type="subtitle" style={styles.sectionHeader}>{title}</ThemedText>
    );

    const renderItem = ({ item }: { item: Notificacion }) => (
        <NotificacionItem item={item} />
    );

    const renderListHeader = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {FILTERS.map((filter) => (
                <Chip
                    key={filter}
                    title={filter}
                    active={filter === activeFilter}
                    onPress={() => setActiveFilter(filter)}
                />
            ))}
        </ScrollView>
    );

    const renderListFooter = () => (
        <View style={styles.footerLinks}>
            <ThemedText type="link" style={styles.footerLink}>Marcar todo como leído</ThemedText>
            <ThemedText type="link" style={styles.footerLink}>Ver preferencias</ThemedText>
        </View>
    );

    return (
        // Usamos ThemedView con variant="default" (fondo gris)
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Notificaciones' }} />

            <SectionList
                sections={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderListFooter}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    chipContainer: {
        paddingVertical: 16,
        flexGrow: 0,
    },
    sectionHeader: {
        marginTop: 16,
        marginBottom: 8,
        paddingLeft: 4,
    },
    footerLinks: {
        marginTop: 24,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    footerLink: {
        fontSize: 16,
        marginVertical: 8,
    },
});
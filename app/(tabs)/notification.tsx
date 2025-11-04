import { ScreenWrapper } from '@/components/layouts/ScreenWrapper';
import { Notificacion, NotificationItem } from '@/components/notifications/NotificationItem';
import { Chip } from '@/components/ui/Chip';
import { ThemedText } from '@/components/ui/ThemedText';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, SectionList, StyleSheet } from 'react-native';

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
                Confirmaciones: 'confirmacion',
                Recordatorios: 'recordatorio',
                Pagos: 'pago',
            };
            return notif.type === filterMap[activeFilter as keyof typeof filterMap];
        }),
    })).filter(section => section.data.length > 0);

    return (
        <ScreenWrapper scrollable>
            <Stack.Screen options={{ title: 'Notificaciones' }} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {FILTERS.map(filter => (
                    <Chip
                        key={filter}
                        title={filter}
                        active={filter === activeFilter}
                        onPress={() => setActiveFilter(filter)}
                    />
                ))}
            </ScrollView>

            <SectionList
                sections={filteredData}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <NotificationItem item={item} />}
                renderSectionHeader={({ section: { title } }) => (
                    <ThemedText type="subtitle" style={styles.sectionHeader}>
                        {title}
                    </ThemedText>
                )}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    listContent: {
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
});

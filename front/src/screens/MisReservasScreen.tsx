import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';
import { useNavigation } from '@react-navigation/native';

export const MisReservasScreen = () => {
  const navigation = useNavigation<any>();
  const [reservas, setReservas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
  React.useCallback(() => {
    fetchReservas(); // tu función actual que carga reservas
  }, [])
);

  const hasActiveReservation = reservas.some(
    (r) => r.estado === 'confirmada' || r.estado === 'check-in'
  );

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservas/mis-reservas');
      setReservas(response.data.reservas);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id: number, nombre: string) => {
    console.log('[CLICK-CANCELAR-BTN] BOTÓN CLICKEADO - ID:', id, 'Nombre:', nombre);
    await cancelarReserva(id);
  };

  const cancelarReserva = async (id: number) => {
    console.log('==========================================');
    console.log('[FRONTEND-MisReservas] INICIANDO CANCELACIÓN');
    console.log('[FRONTEND-MisReservas] Reserva ID:', id);
    console.log('[FRONTEND-MisReservas] URL:', `/reservas/${id}/cancelar`);
    console.log('[FRONTEND-MisReservas] Body:', { motivo: 'Cancelación del usuario por lista de reservas' });

    try {
      console.log('[FRONTEND-MisReservas] Enviando petición POST...');
      const response = await api.post(`/reservas/${id}/cancelar`, {
        motivo: 'Cancelación del usuario por lista de reservas',
      });

      console.log('[FRONTEND-MisReservas] ✓ Respuesta exitosa recibida');
      console.log('[FRONTEND-MisReservas] Status:', response.status);
      console.log('[FRONTEND-MisReservas] Data:', response.data);

      const penalizacion = response.data.reserva?.penalizacion || 0;
      const mensajePenalizacion = penalizacion > 0
        ? `\n\n⚠️ Penalización: $${parseFloat(penalizacion).toFixed(2)}`
        : '';

      Alert.alert('✓ Éxito', `Reserva cancelada correctamente${mensajePenalizacion}`, [
        { text: 'OK', onPress: () => fetchReservas() }
      ]);
    } catch (error: any) {
      console.error('==========================================');
      console.error('[FRONTEND-MisReservas] ✗ ERROR AL CANCELAR:');
      console.error('[FRONTEND-MisReservas] Error message:', error.message);
      console.error('[FRONTEND-MisReservas] Error code:', error.code);
      console.error('[FRONTEND-MisReservas] Response status:', error.response?.status);
      console.error('[FRONTEND-MisReservas] Response data:', error.response?.data);
      console.error('[FRONTEND-MisReservas] Response headers:', error.response?.headers);
      console.error('[FRONTEND-MisReservas] Request config:', error.config);
      console.error('[FRONTEND-MisReservas] Error completo:', error);
      console.error('==========================================');

      Alert.alert('Error', error.response?.data?.error || error.message || 'Error al cancelar');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return styles.estatusConfirmada;
      case 'check-in':
        return styles.estatusCheckIn;
      case 'check-out':
        return styles.estatusCheckOut;
      case 'completada':
        return styles.estatusCompletada;
      case 'cancelada':
        return styles.estatusCancelada;
      default:
        return styles.estatusConfirmada;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return '✓ Confirmada';
      case 'check-in':
        return '🔓 Check-in';
      case 'check-out':
        return '🔒 Check-out';
      case 'completada':
        return '✓ Completada';
      case 'cancelada':
        return '✗ Cancelada';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderReserva = ({ item }: { item: any }) => {
    console.log(`[RENDER] Reserva #${item.id}: estado='${item.estado}' (tipo: ${typeof item.estado})`);
    return (
      <View style={styles.reservaCard}>
        <View style={styles.reservaHeader}>
          <View style={styles.reservaInfo}>
            <Text style={styles.reservaNombre}>{item.propiedad_nombre}</Text>
            <Text style={styles.reservaZona}>📍 {item.zona}</Text>
          </View>
          <View style={[styles.estatusBadge, getEstadoColor(item.estado)]}>
            <Text style={styles.estatusTexto}>{getEstadoTexto(item.estado)}</Text>
          </View>
        </View>

        <View style={styles.reservaDates}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateValue}>{item.fecha_checkin}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateValue}>{item.fecha_checkout}</Text>
          </View>
        </View>

        <View style={styles.reservaDetails}>
          <Text style={styles.detailText}>💰 ${item.precio_total}</Text>
          {item.penalizacion > 0 && (
            <Text style={styles.detailTextRed}>⚠️ Penalización: ${item.penalizacion}</Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => navigation.navigate('DetalleReserva' as never, { reservaId: item.id } as never)}
          >
            <Text style={styles.buttonText}>Ver Detalles</Text>
          </TouchableOpacity>
          {item.estado !== 'completada' && item.estado !== 'cancelada' && (
            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={() => handleCancelar(item.id, item.propiedad_nombre)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {hasActiveReservation && (
        <View style={styles.scannerBanner}>
          <Text style={styles.bannerText}>📱 Tienes reservas activas</Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('ScanQRHuesped' as never)}
          >
            <Text style={styles.scanButtonText}>Escanear QR</Text>
          </TouchableOpacity>
        </View>
      )}

      {reservas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>📭 Sin reservas</Text>
          <Text style={styles.emptyText}>Aún no tienes reservas</Text>
        </View>
      ) : (
        <FlatList
          data={reservas}
          renderItem={renderReserva}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchReservas}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
  },
  listContent: {
    padding: 15,
    gap: 15,
  },
  reservaCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reservaInfo: {
    flex: 1,
  },
  reservaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  reservaZona: {
    fontSize: 12,
    color: colors.textLight,
  },
  estatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  estatusConfirmada: {
    backgroundColor: '#E3F2FD',
  },
  estatusCheckIn: {
    backgroundColor: '#F3E5F5',
  },
  estatusCheckOut: {
    backgroundColor: '#FCE4EC',
  },
  estatusCompletada: {
    backgroundColor: '#E8F5E9',
  },
  estatusCancelada: {
    backgroundColor: '#FFEBEE',
  },
  estatusTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  reservaDates: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  reservaDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailTextRed: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  scannerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  bannerText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  scanButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  scanButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
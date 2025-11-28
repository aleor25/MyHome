import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';

export const ReservasScreen = () => {
  const [reservas, setReservas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('todas');

  React.useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservas/reservas-propiedades');
      setReservas(response.data.reservas);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
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

  const filteredReservas = filter === 'todas' 
    ? reservas 
    : reservas.filter(r => r.estado === filter);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderReserva = ({ item }: { item: any }) => (
    <View style={styles.reservaCard}>
      <View style={styles.reservaHeader}>
        <View style={styles.reservaInfo}>
          <Text style={styles.reservaNombre}>{item.propiedad_nombre}</Text>
          <Text style={styles.huespedInfo}>👤 {item.huesped_nombre}</Text>
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
        <Text style={styles.detailText}>📞 {item.huesped_telefono}</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Ver Detalles</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['todas', 'confirmada', 'check-in', 'completada'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === status && styles.filterButtonTextActive,
              ]}
            >
              {status === 'todas' ? 'Todas' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredReservas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>📭 Sin reservas</Text>
          <Text style={styles.emptyText}>No hay reservas en este estado</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReservas}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  filterButtonTextActive: {
    color: colors.white,
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
  huespedInfo: {
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
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
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

export const NotificacionesScreen = () => {
  const [notificaciones, setNotificaciones] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notificaciones');
      setNotificaciones(response.data.notificaciones);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      await api.put(`/notificaciones/${id}/leida`);
      fetchNotificaciones();
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const eliminarNotificacion = async (id: number) => {
    try {
      await api.delete(`/notificaciones/${id}`);
      fetchNotificaciones();
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'reserva_confirmada':
        return '🎉';
      case 'recordatorio_checkin':
        return '📍';
      case 'cobro_realizado':
        return '💳';
      case 'check_in_completado':
        return '✅';
      case 'check_out_completado':
        return '👋';
      case 'cancelacion':
        return '❌';
      case 'penalizacion':
        return '⚠️';
      default:
        return '📢';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderNotificacion = ({ item }: { item: any }) => (
    <View
      style={[
        styles.notificacionCard,
        item.leida ? styles.notificacionLeida : styles.notificacionNoLeida,
      ]}
    >
      <View style={styles.notificacionContent}>
        <View style={styles.notificacionHeader}>
          <Text style={styles.notificacionIcon}>{getTipoIcon(item.tipo_notificacion)}</Text>
          <View style={styles.notificacionTexto}>
            <Text style={styles.notificacionTitulo}>{item.titulo}</Text>
            <Text style={styles.notificacionMensaje}>{item.mensaje}</Text>
          </View>
        </View>
        <Text style={styles.notificacionFecha}>
          {new Date(item.fecha_envio).toLocaleDateString('es-ES')}
        </Text>
      </View>

      <View style={styles.notificacionActions}>
        {!item.leida && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => marcarComoLeida(item.id)}
          >
            <Text style={styles.actionButtonText}>✓</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDelete]}
          onPress={() => eliminarNotificacion(item.id)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {notificaciones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🔔 Sin notificaciones</Text>
          <Text style={styles.emptyText}>No tienes notificaciones aún</Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          renderItem={renderNotificacion}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchNotificaciones}
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
    gap: 12,
  },
  notificacionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
  },
  notificacionNoLeida: {
    borderLeftColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  notificacionLeida: {
    borderLeftColor: colors.border,
    backgroundColor: colors.white,
  },
  notificacionContent: {
    flex: 1,
  },
  notificacionHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  notificacionIcon: {
    fontSize: 24,
  },
  notificacionTexto: {
    flex: 1,
  },
  notificacionTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  notificacionMensaje: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 16,
  },
  notificacionFecha: {
    fontSize: 11,
    color: colors.textLight,
    marginLeft: 36,
  },
  notificacionActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDelete: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    fontSize: 16,
  },
});
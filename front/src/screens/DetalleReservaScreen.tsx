import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';
import { useNavigation, useRoute } from '@react-navigation/native';

export const DetalleReservaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reservaId } = route.params as { reservaId: number };

  const [loading, setLoading] = React.useState(true);
  const [reserva, setReserva] = React.useState<any>(null);
  const [pago, setPago] = React.useState<any>(null);

  React.useEffect(() => {
    fetchDetalleReserva();
  }, []);

  const fetchDetalleReserva = async () => {
    try {
      setLoading(true);

      // Obtener detalles de la reserva
      const reservaResponse = await api.get(`/reservas/${reservaId}`);
      setReserva(reservaResponse.data);

      // Obtener información del pago
      try {
        const pagoResponse = await api.get(`/pagos/reserva/${reservaId}`);
        setPago(pagoResponse.data.pago);
      } catch (error) {
        // Si no hay pago, continuar sin error
        console.log('No se encontró información de pago');
      }
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles de la reserva');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    console.log('[CLICK-CANCELAR-BTN-DETALLE] BOTÓN CLICKEADO - Reserva ID:', reservaId);
    await cancelarReserva();
  };

  const cancelarReserva = async () => {
    console.log('==========================================');
    console.log('[FRONTEND-DetalleReserva] INICIANDO CANCELACIÓN');
    console.log('[FRONTEND-DetalleReserva] Reserva ID:', reservaId);
    console.log('[FRONTEND-DetalleReserva] URL:', `/reservas/${reservaId}/cancelar`);
    console.log('[FRONTEND-DetalleReserva] Body:', { motivo: 'Cancelación del usuario' });

    try {
      console.log('[FRONTEND-DetalleReserva] Enviando petición POST...');
      const response = await api.post(`/reservas/${reservaId}/cancelar`, {
        motivo: 'Cancelación del usuario',
      });

      console.log('[FRONTEND-DetalleReserva] ✓ Respuesta exitosa recibida');
      console.log('[FRONTEND-DetalleReserva] Status:', response.status);
      console.log('[FRONTEND-DetalleReserva] Data:', response.data);

      const penalizacion = response.data.reserva?.penalizacion || 0;
      const mensajePenalizacion = penalizacion > 0
        ? `\n\n⚠️ Penalización: $${parseFloat(penalizacion).toFixed(2)}`
        : '';

      Alert.alert('✓ Éxito', `Reserva cancelada correctamente${mensajePenalizacion}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('==========================================');
      console.error('[FRONTEND-DetalleReserva] ✗ ERROR AL CANCELAR:');
      console.error('[FRONTEND-DetalleReserva] Error message:', error.message);
      console.error('[FRONTEND-DetalleReserva] Error code:', error.code);
      console.error('[FRONTEND-DetalleReserva] Response status:', error.response?.status);
      console.error('[FRONTEND-DetalleReserva] Response data:', error.response?.data);
      console.error('[FRONTEND-DetalleReserva] Response headers:', error.response?.headers);
      console.error('[FRONTEND-DetalleReserva] Request config:', error.config);
      console.error('[FRONTEND-DetalleReserva] Error completo:', error);
      console.error('==========================================');

      Alert.alert('Error', error.response?.data?.error || error.message || 'Error al cancelar reserva');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return '#2196F3';
      case 'check-in':
        return '#9C27B0';
      case 'check-out':
        return '#E91E63';
      case 'completada':
        return '#4CAF50';
      case 'cancelada':
        return '#F44336';
      default:
        return colors.primary;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calcularNoches = () => {
    if (!reserva) return 0;
    const checkin = new Date(reserva.fecha_checkin);
    const checkout = new Date(reserva.fecha_checkout);
    const diff = checkout.getTime() - checkin.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (!reserva) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se encontró la reserva</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log(`[DETALLE-RESERVA] Reserva #${reserva.id}: estado='${reserva.estado}' (tipo: ${typeof reserva.estado})`);

  const noches = calcularNoches();

  return (
    <ScrollView style={styles.container}>
      {/* Header con estado */}
      <View style={[styles.header, { backgroundColor: getEstadoColor(reserva.estado) }]}>
        <Text style={styles.headerTitle}>Reserva #{reserva.id}</Text>
        <Text style={styles.headerEstado}>{getEstadoTexto(reserva.estado)}</Text>
        <Text style={styles.headerFecha}>
          Reservado el {formatDate(reserva.fecha_reserva)}
        </Text>
      </View>

      {/* Información de la propiedad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Propiedad</Text>
        <View style={styles.card}>
          <Text style={styles.propertyName}>{reserva.propiedad_nombre}</Text>
          <Text style={styles.propertyZona}>📍 {reserva.zona}</Text>
          {reserva.direccion && (
            <Text style={styles.propertyDireccion}>{reserva.direccion}</Text>
          )}
        </View>
      </View>

      {/* Fechas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Fechas de Estadía</Text>
        <View style={styles.card}>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{formatDate(reserva.fecha_checkin)}</Text>
              <Text style={styles.dateTime}>Después de las 3:00 PM</Text>
            </View>
            <View style={styles.dateSeparator}>
              <Text style={styles.dateArrow}>→</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>{formatDate(reserva.fecha_checkout)}</Text>
              <Text style={styles.dateTime}>Antes de las 11:00 AM</Text>
            </View>
          </View>
          <View style={styles.nightsInfo}>
            <Text style={styles.nightsText}>🌙 {noches} noche{noches !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>

      {/* Códigos QR para Check-in/Check-out */}
      {(reserva.qr_checkin || reserva.qr_checkout) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Códigos QR</Text>
          <View style={styles.card}>
            <Text style={styles.qrInstructions}>
              Presenta estos códigos QR al propietario para realizar el check-in y check-out
            </Text>

            <View style={styles.qrContainer}>
              {reserva.qr_checkin && reserva.estado === 'confirmada' && (
                <View style={styles.qrBox}>
                  <Text style={styles.qrTitle}>🔓 Check-in</Text>
                  <Image
                    source={{ uri: reserva.qr_checkin }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrLabel}>Escanear al llegar</Text>
                </View>
              )}

              {reserva.qr_checkout && reserva.estado === 'check-in' && (
                <View style={styles.qrBox}>
                  <Text style={styles.qrTitle}>🔒 Check-out</Text>
                  <Image
                    source={{ uri: reserva.qr_checkout }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrLabel}>Escanear al salir</Text>
                </View>
              )}

              {reserva.estado === 'completada' && (
                <View style={styles.qrCompleted}>
                  <Text style={styles.qrCompletedIcon}>✓</Text>
                  <Text style={styles.qrCompletedText}>
                    Check-in y check-out completados
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Información de Pago */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Detalles de Pago</Text>
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio por noche</Text>
            <Text style={styles.priceValue}>${reserva.precio_por_noche}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{noches} noche{noches !== 1 ? 's' : ''}</Text>
            <Text style={styles.priceValue}>${reserva.precio_por_noche * noches}</Text>
          </View>
          {reserva.penalizacion > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, styles.penalizacionText]}>⚠️ Penalización</Text>
              <Text style={[styles.priceValue, styles.penalizacionText]}>
                -${reserva.penalizacion}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${reserva.precio_total}</Text>
          </View>

          {pago && (
            <>
              <View style={styles.divider} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Información de Pago</Text>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Estado del pago:</Text>
                  <Text style={[styles.paymentValue, pago.estado === 'completado' && styles.paymentSuccess]}>
                    {pago.estado === 'completado' ? '✓ Pagado' : pago.estado}
                  </Text>
                </View>
                {pago.numero_tarjeta_ultimos_4 && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Tarjeta:</Text>
                    <Text style={styles.paymentValue}>**** {pago.numero_tarjeta_ultimos_4}</Text>
                  </View>
                )}
                {pago.nombre_titular && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Titular:</Text>
                    <Text style={styles.paymentValue}>{pago.nombre_titular}</Text>
                  </View>
                )}
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Fecha de pago:</Text>
                  <Text style={styles.paymentValue}>{formatDate(pago.fecha_pago)}</Text>
                </View>
                {pago.id && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>ID de transacción:</Text>
                    <Text style={styles.paymentValue}>#{pago.id}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </View>

      {/* Información adicional */}
      {reserva.notas && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notas</Text>
          <View style={styles.card}>
            <Text style={styles.notasText}>{reserva.notas}</Text>
          </View>
        </View>
      )}

      {/* Información de contacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Contacto</Text>
        <View style={styles.card}>
          <Text style={styles.contactText}>
            Para cualquier consulta sobre esta reserva, por favor contacta al propietario.
          </Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        {reserva.estado === 'completada' && !pago?.resena_id && (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() =>
              navigation.navigate(
                'CrearResena' as never,
                {
                  reservaId: reserva.id,
                  propiedadId: reserva.propiedad_id,
                  propietarioId: reserva.propietario_id,
                  propiedadNombre: reserva.propiedad_nombre,
                } as never
              )
            }
          >
            <Text style={styles.buttonText}>⭐ Dejar Reseña</Text>
          </TouchableOpacity>
        )}

        {reserva.estado !== 'completada' && reserva.estado !== 'cancelada' && (
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleCancelar}
          >
            <Text style={styles.buttonText}>Cancelar Reserva</Text>
          </TouchableOpacity>
        )}

        {reserva.estado === 'cancelada' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Esta reserva fue cancelada
              {reserva.motivo_cancelacion && `: ${reserva.motivo_cancelacion}`}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.spacing} />
    </ScrollView>
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
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textLight,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  headerEstado: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 5,
  },
  headerFecha: {
    fontSize: 13,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  propertyZona: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 3,
  },
  propertyDireccion: {
    fontSize: 13,
    color: colors.textLight,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  dateSeparator: {
    marginHorizontal: 10,
  },
  dateArrow: {
    fontSize: 20,
    color: colors.primary,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 3,
  },
  dateTime: {
    fontSize: 11,
    color: colors.textLight,
  },
  nightsInfo: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  nightsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  penalizacionText: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paymentInfo: {
    marginTop: 5,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  paymentLabel: {
    fontSize: 13,
    color: colors.textLight,
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  paymentSuccess: {
    color: '#4CAF50',
  },
  notasText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  contactText: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  actionButtons: {
    padding: 15,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    padding: 12,
    borderRadius: 6,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  spacing: {
    height: 20,
  },
  qrInstructions: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 18,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  qrLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  qrCompleted: {
    alignItems: 'center',
    padding: 20,
  },
  qrCompletedIcon: {
    fontSize: 48,
    color: '#4CAF50',
    marginBottom: 10,
  },
  qrCompletedText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
});

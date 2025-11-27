import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../assets/colors/colors';
import { useNavigation, useRoute } from '@react-navigation/native';

export const ConfirmacionPago = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pago, reserva, propiedad } = route.params as {
    pago: any;
    reserva: any;
    propiedad: any;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calcularDias = () => {
    const inicio = new Date(reserva.fecha_checkin);
    const fin = new Date(reserva.fecha_checkout);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const handleVolverInicio = () => {
    // Navegar a la pantalla principal del huésped
    navigation.getParent()?.navigate('MisReservas');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header de éxito */}
      <View style={styles.successHeader}>
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.successTitle}>¡Pago Exitoso!</Text>
        <Text style={styles.successSubtitle}>
          Tu reserva ha sido confirmada
        </Text>
      </View>

      {/* Detalles del pago */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💳 Detalles del Pago</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID de Pago</Text>
          <Text style={styles.detailValue}>#{pago.id}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha y Hora</Text>
          <Text style={styles.detailValue}>
            {formatearFecha(pago.fecha_pago)} {formatearHora(pago.fecha_pago)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Método de Pago</Text>
          <Text style={styles.detailValue}>
            Tarjeta •••• {pago.numero_tarjeta_ultimos_4}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Titular</Text>
          <Text style={styles.detailValue}>{pago.nombre_titular}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estado</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✓ Completado</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.totalLabel}>Monto Total</Text>
          <Text style={styles.totalValue}>${parseFloat(pago.monto).toFixed(2)}</Text>
        </View>
      </View>

      {/* Detalles de la reserva */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Detalles de la Reserva</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID de Reserva</Text>
          <Text style={styles.detailValue}>#{reserva.id}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Propiedad</Text>
          <Text style={styles.detailValue}>{propiedad.nombre}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ubicación</Text>
          <Text style={styles.detailValue}>{propiedad.zona}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Check-in</Text>
          <Text style={styles.detailValue}>{formatearFecha(reserva.fecha_checkin)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Check-out</Text>
          <Text style={styles.detailValue}>{formatearFecha(reserva.fecha_checkout)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Noches</Text>
          <Text style={styles.detailValue}>{calcularDias()} noches</Text>
        </View>
      </View>

      {/* Información importante */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📧 Confirmación Enviada</Text>
        <Text style={styles.infoText}>
          Hemos enviado un correo de confirmación con todos los detalles de tu reserva.
          Recuerda revisar tu bandeja de entrada.
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Próximos Pasos</Text>
        <Text style={styles.infoText}>
          • Revisa los detalles de tu reserva en "Mis Reservas"{'\n'}
          • El propietario recibirá una notificación{'\n'}
          • Puedes contactar al propietario si tienes dudas{'\n'}
          • Recuerda realizar el check-in en la fecha indicada
        </Text>
      </View>

      {/* Botones de acción */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleVolverInicio}
      >
        <Text style={styles.buttonText}>Ver Mis Reservas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Buscar')}
      >
        <Text style={styles.secondaryButtonText}>Buscar Más Propiedades</Text>
      </TouchableOpacity>

      <View style={styles.spacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  successHeader: {
    backgroundColor: colors.white,
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: colors.white,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  infoBox: {
    backgroundColor: colors.white,
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    marginHorizontal: 15,
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  spacing: {
    height: 30,
  },
});

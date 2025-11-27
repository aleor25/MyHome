// 👇 Añade esto arriba del componente PagoScreen
declare global {
  namespace ReactNavigation {
    interface RootParamList {
      ConfirmacionPago: {
        pago: any;
        reserva: any;
        propiedad: any;
      };
    }
  }
}

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';
import { useNavigation, useRoute } from '@react-navigation/native';

export const PagoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reservaId, propiedad, fechaCheckin, fechaCheckout, precioTotal: precioDirect } = route.params as {
    reservaId: number;
    propiedad: any;
    fechaCheckin: string;
    fechaCheckout: string;
    precioTotal: number | string;
  };

  // Convertir precioTotal a número (puede venir como string)
  const precioTotal = typeof precioDirect === 'string' ? parseFloat(precioDirect) : precioDirect;

  const [loading, setLoading] = React.useState(false);

  // Estados del formulario
  const [numeroTarjeta, setNumeroTarjeta] = React.useState('');
  const [nombreTitular, setNombreTitular] = React.useState('');
  const [mesExpiracion, setMesExpiracion] = React.useState('');
  const [anioExpiracion, setAnioExpiracion] = React.useState('');
  const [cvv, setCvv] = React.useState('');

  // Formatear número de tarjeta con espacios cada 4 dígitos
  const formatearNumeroTarjeta = (texto: string) => {
    const limpio = texto.replace(/\s/g, '').replace(/[^0-9]/g, '');
    const grupos = limpio.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : limpio;
  };

  const handleNumeroTarjetaChange = (texto: string) => {
    const limpio = texto.replace(/\s/g, '');
    if (limpio.length <= 19) {
      setNumeroTarjeta(formatearNumeroTarjeta(texto));
    }
  };

  const handleMesChange = (texto: string) => {
    const limpio = texto.replace(/[^0-9]/g, '');
    if (limpio.length <= 2) {
      setMesExpiracion(limpio);
    }
  };

  const handleAnioChange = (texto: string) => {
    const limpio = texto.replace(/[^0-9]/g, '');
    if (limpio.length <= 4) {
      setAnioExpiracion(limpio);
    }
  };

  const handleCvvChange = (texto: string) => {
    const limpio = texto.replace(/[^0-9]/g, '');
    if (limpio.length <= 4) {
      setCvv(limpio);
    }
  };

  const validarFormulario = () => {
    if (!numeroTarjeta || !nombreTitular || !mesExpiracion || !anioExpiracion || !cvv) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return false;
    }

    const numeroLimpio = numeroTarjeta.replace(/\s/g, '');
    if (numeroLimpio.length < 13 || numeroLimpio.length > 19) {
      Alert.alert('Error', 'Número de tarjeta inválido');
      return false;
    }

    if (!nombreTitular.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del titular');
      return false;
    }

    const mes = parseInt(mesExpiracion);
    if (mes < 1 || mes > 12) {
      Alert.alert('Error', 'Mes de expiración inválido (01-12)');
      return false;
    }

    const anio = parseInt(anioExpiracion);
    const anioActual = new Date().getFullYear();
    if (anio < anioActual || anio > anioActual + 20) {
      Alert.alert('Error', 'Año de expiración inválido');
      return false;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert('Error', 'CVV inválido');
      return false;
    }

    return true;
  };

  const handlePagar = async () => {
  if (!validarFormulario()) return;

  setLoading(true);
  try {
    // 🔹 Primero crea la reserva
    const reservaResp = await api.post('/reservas/crear', {
      propiedadId: propiedad.id,
      fechaCheckin,
      fechaCheckout,
    });
    const reserva = reservaResp.data.reserva;

    // 🔹 Luego procesa el pago
    const numeroLimpio = numeroTarjeta.replace(/\s/g, '');
    const pagoResp = await api.post('/pagos/procesar', {
      reservaId: reserva.id,
      numeroTarjeta: numeroLimpio,
      cvv,
      mesExpiracion,
      anioExpiracion,
      nombreTitular: nombreTitular.trim(),
    });

    // 🔹 Navega a ConfirmacionPago
    navigation.navigate('ConfirmacionPago', {
      pago: pagoResp.data.pago,
      reserva: pagoResp.data.reserva,
      propiedad,
    });
  } catch (error: any) {
    console.error('Error al procesar pago:', error);
    Alert.alert('Error', error.response?.data?.error || 'Error al procesar el pago');
  } finally {
    setLoading(false);
  }
};


  const calcularDias = () => {
    const inicio = new Date(fechaCheckin);
    const fin = new Date(fechaCheckout);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💳 Pagar Reserva</Text>
          <Text style={styles.headerSubtitle}>Ingresa los datos de tu tarjeta</Text>
        </View>

        {/* Resumen de la reserva */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de Reserva</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Propiedad:</Text>
            <Text style={styles.summaryValue}>{propiedad.nombre}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Check-in:</Text>
            <Text style={styles.summaryValue}>{fechaCheckin}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Check-out:</Text>
            <Text style={styles.summaryValue}>{fechaCheckout}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Noches:</Text>
            <Text style={styles.summaryValue}>{calcularDias()} noches</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabelBold}>Total a pagar:</Text>
            <Text style={styles.summaryValueBold}>${precioTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Formulario de tarjeta */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Datos de la Tarjeta</Text>

          <View style={styles.cardPreview}>
            <Text style={styles.cardNumber}>{numeroTarjeta || '•••• •••• •••• ••••'}</Text>
            <View style={styles.cardDetails}>
              <Text style={styles.cardHolder}>{nombreTitular.toUpperCase() || 'NOMBRE DEL TITULAR'}</Text>
              <Text style={styles.cardExpiry}>
                {mesExpiracion && anioExpiracion ? `${mesExpiracion}/${anioExpiracion}` : 'MM/AAAA'}
              </Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Número de Tarjeta *</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={numeroTarjeta}
              onChangeText={handleNumeroTarjetaChange}
              keyboardType="number-pad"
              maxLength={23}
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre del Titular *</Text>
            <TextInput
              style={[styles.input, styles.inputUppercase]}
              placeholder="JUAN PÉREZ"
              value={nombreTitular}
              onChangeText={setNombreTitular}
              autoCapitalize="characters"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Mes *</Text>
              <TextInput
                style={styles.input}
                placeholder="MM"
                value={mesExpiracion}
                onChangeText={handleMesChange}
                keyboardType="number-pad"
                maxLength={2}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Año *</Text>
              <TextInput
                style={styles.input}
                placeholder="AAAA"
                value={anioExpiracion}
                onChangeText={handleAnioChange}
                keyboardType="number-pad"
                maxLength={4}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>CVV *</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={cvv}
                onChangeText={handleCvvChange}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>🔒</Text>
            <Text style={styles.infoText}>
              Esta es una simulación. No procesamos pagos reales. Los datos ingresados no se almacenan de forma completa.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handlePagar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Confirmar Pago</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <View style={styles.spacing} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  summaryLabelBold: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  summaryValueBold: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  form: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  cardPreview: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 180,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardNumber: {
    fontSize: 24,
    color: colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    marginTop: 40,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolder: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
    flex: 1,
  },
  cardExpiry: {
    fontSize: 14,
    color: colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputUppercase: {
    textTransform: 'uppercase',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.border,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  spacing: {
    height: 20,
  },
});

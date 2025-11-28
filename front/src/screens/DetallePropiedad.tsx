import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';

import { format } from "date-fns";
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
  TextInput,
  Platform, 
} from 'react-native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';

export const DetallePropiedad = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<any>>();
  const { propiedadId } = route.params as { propiedadId: number };
  const [propiedad, setPropiedad] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [creandoReserva, setCreandoReserva] = React.useState(false);
  const [showReservaModal, setShowReservaModal] = React.useState(false);

  // Estados para fechas (entrada manual)
  const [fechaCheckin, setFechaCheckin] = React.useState('');
  const [fechaCheckout, setFechaCheckout] = React.useState('');
  const [diasOcupados, setDiasOcupados] = React.useState<string[]>([]);

  const [isDatePickerVisible, setDatePickerVisible] = React.useState(false);
  const [datePickerType, setDatePickerType] = React.useState<'checkin' | 'checkout' | null>(null);
const showDatePicker = (type: 'checkin' | 'checkout') => {
  setDatePickerType(type);
  setDatePickerVisible(true);
};

const hideDatePicker = () => {
  setDatePickerVisible(false);
  setDatePickerType(null);
};
useFocusEffect(
  React.useCallback(() => {
    checkFavorito(); // Llama a la función existente de checkFavorito
  }, [])
);


  const [resenas, setResenas] = React.useState<any[]>([]);
  const [promedioResenas, setPromedioResenas] = React.useState<any>(null);
  const [esFavorito, setEsFavorito] = React.useState(false);

  React.useEffect(() => {
    fetchPropiedad();
    fetchDiasOcupados();
    fetchResenas();
    checkFavorito();
  }, []);

  const fetchPropiedad = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/propiedades/detalle/${propiedadId}`);
      // El API devuelve { propiedad: {...}, fotos: [...] }
      setPropiedad(response.data.propiedad || response.data);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };


  const handleConfirmDate = (date: Date) => {
  const selectedDate = format(date, 'yyyy-MM-dd');

  if (datePickerType === 'checkin') {
    setFechaCheckin(selectedDate);
    // Limpia el check-out si el check-in es después del check-out seleccionado
    if (fechaCheckout && new Date(selectedDate) >= new Date(fechaCheckout)) {
      setFechaCheckout('');  // Limpia el check-out si el check-in es posterior
    }
  } else if (datePickerType === 'checkout') {
    // Verifica si la fecha seleccionada se cruza con las fechas ocupadas entre check-in y check-out
    const fechaSeleccionada = new Date(selectedDate);
    const fechasOcupadasEnRango = [];
    
    let fecha = new Date(fechaCheckin);
    while (fecha <= fechaSeleccionada) {
      const fechaFormato = format(fecha, 'yyyy-MM-dd');
      if (diasOcupados.includes(fechaFormato)) {
        fechasOcupadasEnRango.push(fechaFormato);
      }
      fecha.setDate(fecha.getDate() + 1);
    }

    // Si hay fechas ocupadas en el rango de fechas seleccionadas, ajustamos el check-out
    if (fechasOcupadasEnRango.length > 0) {
      setFechaCheckin(selectedDate);  // Ajusta el check-in
      setFechaCheckout('');  // Limpiar el check-out
      Alert.alert('Fechas ocupadas', 'El período seleccionado contiene días ocupados. El check-in se ha ajustado a la fecha seleccionada.');
    } else {
      setFechaCheckout(selectedDate);  // Si no hay conflicto, establece el check-out
    }
  }

  hideDatePicker();
};





  const fetchResenas = async () => {
    try {
      const response = await api.get(`/resenas/propiedad/${propiedadId}`);
      setResenas(response.data.resenas || []);
      setPromedioResenas(response.data.promedio);
    } catch (error: any) {
      console.error('Error al cargar reseñas:', error);
    }
  };

  const checkFavorito = async () => {
    try {
      const response = await api.get(`/favoritos/verificar/${propiedadId}`);
      setEsFavorito(response.data.esFavorito);
    } catch (error: any) {
      console.error('Error al verificar favorito:', error);
    }
  };

  const toggleFavorito = async () => {
    try {
      await api.post('/favoritos/toggle', { propiedadId });
      setEsFavorito(!esFavorito);
      //Alert.alert('Éxito', esFavorito ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo procesar la solicitud');
    }
  };

  const calcularPrecioTotal = () => {
    if (!fechaCheckin || !fechaCheckout) return 0;

    const inicio = new Date(fechaCheckin);
    const fin = new Date(fechaCheckout);
    
    // Si la fecha es inválida o la de fin es anterior/igual a la de inicio, retorna 0.
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || inicio >= fin) return 0;
    
    const diffTime = fin.getTime() - inicio.getTime();
    const dias = Math.ceil(diffTime / (1000 * 3600 * 24)); 
    
    const precioNoche = parseFloat(propiedad.precio_noche);
    
    if (isNaN(precioNoche) || precioNoche <= 0 || dias < 1) return 0;

    return dias * precioNoche;
  };

const fetchDiasOcupados = async () => {
  try {
    const response = await api.get(`/propiedades/${propiedadId}/fechas-ocupadas`);
    setDiasOcupados(response.data.diasOcupados || []);
  } catch (error) {
    console.error('Error al cargar fechas ocupadas:', error);
  }
};


  const handleCrearReserva = () => {
  if (!fechaCheckin || !fechaCheckout) {
    Alert.alert('Error', 'Por favor selecciona las fechas');
    return;
  }

  const inicio = new Date(fechaCheckin);
  const fin = new Date(fechaCheckout);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || inicio >= fin) {
    Alert.alert('Error', 'Fechas inválidas. El check-out debe ser posterior al check-in.');
    return;
  }

  const precioTotal = calcularPrecioTotal();
  if (precioTotal <= 0) {
    Alert.alert('Error', 'No se puede calcular el precio total.');
    return;
  }


  
  // Cierra el modal y navega al pago (sin crear reserva todavía)
  setShowReservaModal(false);

  navigation.navigate('PagoScreen', {
    propiedad,
    fechaCheckin,
    fechaCheckout,
    precioTotal,
  });

  // Limpia fechas seleccionadas
  setFechaCheckin('');
  setFechaCheckout('');
};


  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!propiedad) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se encontró la propiedad</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
  {propiedad.foto_exterior || propiedad.foto_interior ? (
  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
    {propiedad.foto_exterior && (
      <Image
        source={{
          uri: propiedad.foto_exterior.startsWith('http')
            ? propiedad.foto_exterior
            : `http://192.168.0.103:5000${propiedad.foto_exterior}`, // 👈 usa tu IP local
        }}
        style={styles.detailImage}
        resizeMode="cover"
      />
    )}
    {propiedad.foto_interior && (
      <Image
        source={{
          uri: propiedad.foto_interior.startsWith('http')
            ? propiedad.foto_interior
            : `http://192.168.0.103:5000${propiedad.foto_interior}`, // 👈 usa tu IP local
        }}
        style={styles.detailImage}
        resizeMode="cover"
      />
    )}
  </ScrollView>
) : (
  <View style={styles.imagePlaceholder}>
    <Text style={styles.imagePlaceholderText}>📸 {propiedad.total_fotos} fotos</Text>
  </View>
)}

  <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorito}>
    <Text style={styles.favoriteIcon}>{esFavorito ? '❤️' : '🤍'}</Text>
  </TouchableOpacity>
</View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{propiedad.nombre}</Text>
              <Text style={styles.zone}>📍 {propiedad.zona}</Text>
              <Text style={styles.location}>🌍 {propiedad.ciudad || 'Ciudad'}, {propiedad.pais || 'País'}</Text>
            </View>
          </View>

          <View style={styles.priceAvailabilityRow}>
            <Text style={styles.price}>${propiedad.precio_noche}/noche</Text>
            {propiedad.disponible ? (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>✓ Disponible</Text>
              </View>
            ) : (
              <View style={styles.unavailableBadge}>
                <Text style={styles.unavailableText}>✗ Ocupada</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>
              {propiedad.descripcion || `Hermosa propiedad en ${propiedad.zona} con todas las comodidades necesarias para una estancia memorable.`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de la Propiedad</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🛏️</Text>
                <Text style={styles.detailLabel}>Habitaciones</Text>
                <Text style={styles.detailValue}>{propiedad.cantidad_habitaciones}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>👥</Text>
                <Text style={styles.detailLabel}>Capacidad (Huéspedes)</Text>
                <Text style={styles.detailValue}>{propiedad.cantidad_huespedes}</Text>
              </View>
            </View>
          </View>

          {/* Reseñas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Reseñas</Text>
              {promedioResenas && parseFloat(promedioResenas.promedio_general) > 0 && (
                <Text style={styles.ratingBadge}>
                  {parseFloat(promedioResenas.promedio_general).toFixed(1)} ⭐ ({promedioResenas.total_resenas})
                </Text>
              )}
            </View>

            {resenas.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Text style={styles.emptyReviewsText}>No hay reseñas todavía</Text>
              </View>
            ) : (
              <View>
                {resenas.slice(0, 3).map((resena) => (
                  <View key={resena.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{resena.nombre_huesped}</Text>
                      <Text style={styles.reviewRating}>
                        {'⭐'.repeat(resena.calificacion)}
                      </Text>
                    </View>
                    {resena.comentario && (
                      <Text style={styles.reviewComment}>{resena.comentario}</Text>
                    )}
                    <Text style={styles.reviewDate}>
                      {new Date(resena.fecha_creacion).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                ))}
                {resenas.length > 3 && (
                  <Text style={styles.moreReviews}>
                    +{resenas.length - 3} reseñas más
                  </Text>
                )}
              </View>
            )}
          </View>

          

          <View style={styles.spacing} />
        </View>
      </ScrollView>

      {propiedad.disponible && (
        <View style={styles.footer}>
          <TouchableOpacity
  style={styles.reserveButton}
  onPress={() => {
    fetchDiasOcupados();
    setShowReservaModal(true);
  }}
>
  <Text style={styles.reserveButtonText}>Reservar Ahora</Text>
</TouchableOpacity>

        </View>
      )}

      {showReservaModal && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Nueva Reserva</Text>

      <Text style={styles.inputLabel}>Selecciona fechas disponibles</Text>

      <Calendar
  minDate={(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  })()}
  maxDate={(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  })()}
  onDayPress={(day: { dateString: string }) => {
    const date = day.dateString;
    handleConfirmDate(new Date(date));  // Confirmar la fecha seleccionada

    // Día ocupado → no dejar seleccionar
    if (diasOcupados.includes(date)) {
      Alert.alert('Fecha no disponible', 'Este día ya está reservado.');
      return;
    }

    // Si no hay check-in → establecerlo
    if (!fechaCheckin) {
      setFechaCheckin(date);
      setFechaCheckout('');
    }
    // Si ya hay check-in pero no check-out → establecerlo si es posterior
    else if (!fechaCheckout && new Date(date) > new Date(fechaCheckin)) {
      setFechaCheckout(date);
    }
    // Si selecciona una nueva fecha antes → reiniciar selección
    else {
      setFechaCheckin(date);
      setFechaCheckout('');
    }
  }}
  markedDates={{
    ...diasOcupados.reduce<Record<string, any>>((acc, date: string) => {
      acc[date] = {
        disabled: true,  // Deshabilitar los días ocupados
        disableTouchEvent: true,  // Evitar interacción con días ocupados
        customStyles: {
          container: { backgroundColor: '#ffcccc' }, // Color de fondo rojo para días ocupados
          text: { color: 'red' }, // Texto rojo para días ocupados
        },
      };
      return acc;
    }, {}),
    
    ...(fechaCheckin && {
      [fechaCheckin]: { 
        selected: true, 
        selectedColor: 'green',  // Color verde para check-in
        selectedTextColor: 'white', // Texto blanco en el día seleccionado
      },
    }),

    ...(fechaCheckout && {
      [fechaCheckout]: { 
        selected: true, 
        selectedColor: 'blue', // Color azul para check-out
        selectedTextColor: 'white', // Texto blanco en el día seleccionado
      },
    }),

    [new Date().toISOString().split('T')[0]]: {
      marked: true,
      dotColor: 'blue', // Color del punto en el día actual
      activeOpacity: 0, // Hace que el punto no sea interactivo
    },
  }}
  markingType={'custom'}
/>




      {fechaCheckin && (
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          Check-in: <Text style={{ fontWeight: 'bold' }}>{fechaCheckin}</Text>
        </Text>
      )}
      {fechaCheckout && (
        <Text style={{ textAlign: 'center' }}>
          Check-out: <Text style={{ fontWeight: 'bold' }}>{fechaCheckout}</Text>
        </Text>
      )}

      {fechaCheckin && fechaCheckout && calcularPrecioTotal() > 0 && (
        <View style={styles.pricePreview}>
          <Text style={styles.pricePreviewLabel}>Total estimado:</Text>
          <Text style={styles.pricePreviewValue}>
            ${calcularPrecioTotal().toFixed(2)}
          </Text>
        </View>
      )}

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, styles.modalButtonCancel]}
          onPress={() => setShowReservaModal(false)}
          disabled={creandoReserva}
        >
          <Text style={styles.modalButtonCancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, styles.modalButtonConfirm]}
          onPress={handleCrearReserva}
          disabled={creandoReserva || calcularPrecioTotal() <= 0}
        >
          {creandoReserva ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.modalButtonConfirmText}>Continuar al Pago</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}

    


    </>
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
  errorText: {
    fontSize: 16,
    color: colors.text,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: colors.white,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: colors.textLight,
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  zone: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: colors.textLight,
  },
  priceAvailabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  availableBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  availableText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  unavailableBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unavailableText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    gap: 15,
  },
  ownerIcon: {
    fontSize: 40,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  ownerEmail: {
    fontSize: 12,
    color: colors.textLight,
  },
  spacing: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 15,
  },
  reserveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  inputLabel: {
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
    marginBottom: 15,
  },
  inputPlaceholder: {
    fontSize: 14,
    color: colors.textLight,
  },
  dateInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: colors.white,
  },
  dateTextInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  calendarIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  pricePreview: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricePreviewLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  pricePreviewValue: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonCancelText: {
    color: colors.text,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonConfirmText: {
    color: colors.white,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyReviews: {
    padding: 20,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: 14,
    color: colors.textLight,
  },
  reviewCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  reviewRating: {
    fontSize: 16,
  },
  reviewComment: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 11,
    color: colors.textLight,
  },
  moreReviews: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
  },
  detailImage: {
  width: 400,
  height: 250,
  backgroundColor: colors.background,
},

});
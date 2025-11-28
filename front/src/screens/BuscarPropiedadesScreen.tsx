import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';

type NavigationProps = NavigationProp<any>;

export const BuscarPropiedadesScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [zona, setZona] = React.useState('');
  const [zonas, setZonas] = React.useState<string[]>([]);
  const [propiedades, setPropiedades] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingZonas, setLoadingZonas] = React.useState(true);
  const [searched, setSearched] = React.useState(false);

  React.useEffect(() => {
    fetchZonas();
  }, []);
useFocusEffect(
  React.useCallback(() => {
    if (zona) {
      handleBuscar(); // Llamar a `handleBuscar` al volver a esta pantalla
    }
  }, [zona])
);

  const fetchZonas = async () => {
    try {
      setLoadingZonas(true);
      const response = await api.get('/propiedades/zonas');
      setZonas(response.data.zonas);
    } catch (error: any) {
      console.error('Error al obtener zonas:', error);
      Alert.alert('Error', 'No se pudieron cargar las zonas disponibles');
    } finally {
      setLoadingZonas(false);
    }
  };

  const handleBuscar = async () => {
  if (!zona) {
    Alert.alert('Error', 'Por favor selecciona una zona');
    return;
  }
  setLoading(true);
  try {
    const response = await api.get('/propiedades/buscar', { params: { zona } });
    setPropiedades(response.data.propiedades);
    setSearched(true);
  } catch (error: any) {
    Alert.alert('Error', 'No se pudieron cargar las propiedades');
  } finally {
    setLoading(false);
  }
};


  const renderProperty = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.propertyCardLarge}
      onPress={() => navigation.navigate('DetallePropiedad', { propiedadId: item.id })}
    >
      
      {item.foto_exterior ? (
        <Image
  source={{
    uri: `http://192.168.0.103:5000${item.foto_exterior}`,
  }}
  style={styles.propertyImage}
  resizeMode="cover"
/>

      ) : (
        <View style={styles.propertyImagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>📸</Text>
          <Text style={styles.imagePlaceholderSubtext}>
            {item.total_fotos || 0} {item.total_fotos === 1 ? 'foto' : 'fotos'}
          </Text>
        </View>
      )}


      <View style={styles.propertyContent}>
        <View style={styles.propertyHeaderLarge}>
          <View style={styles.propertyTitleContainer}>
            <Text style={styles.propertyNameLarge}>{item.nombre}</Text>
            <Text style={styles.propertyZoneLarge}>📍 {item.zona}</Text>
          </View>
          <View style={[styles.statusBadge, item.disponible ? styles.statusAvailable : styles.statusUnavailable]}>
            <Text style={styles.statusText}>
              {item.disponible ? '✓ Disponible' : '✗ Ocupada'}
            </Text>
          </View>
        </View>

        <Text style={styles.propertyDescription} numberOfLines={2}>
          {item.descripcion || 'Propiedad en ' + item.zona}
        </Text>

        <View style={styles.propertyDetailsLarge}>
          <Text style={styles.detailTextLarge}>🛏️ {item.cantidad_habitaciones} habitación</Text>
          <Text style={styles.detailTextLarge}>👥 {item.cantidad_huespedes} Capacidad</Text>
          <Text style={styles.propertyPriceLarge}>${item.precio_noche}/noche</Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
  <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
    <View style={styles.searchContainer}>
      <Text style={styles.label}>Zona *</Text>
      {loadingZonas ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Cargando zonas...</Text>
        </View>
      ) : zonas.length === 0 ? (
        <View style={styles.emptyZonasContainer}>
          <Text style={styles.emptyZonasText}>
            No hay zonas disponibles. Agrega propiedades primero.
          </Text>
        </View>
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={zona}
            onValueChange={(value) => setZona(value)}
            enabled={!loading}
            style={styles.picker}
          >
            <Picker.Item label="Selecciona una zona..." value="" />
            {zonas.map((z, index) => (
              <Picker.Item key={index} label={z} value={z} />
            ))}
          </Picker>
        </View>
      )}

      <TouchableOpacity
        style={[styles.searchButton, loading && styles.buttonDisabled]}
        onPress={handleBuscar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.searchButtonText}>🔍 Buscar Propiedades</Text>
        )}
      </TouchableOpacity>
    </View>

    {searched && (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {propiedades.length} {propiedades.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
        </Text>
        {propiedades.length === 0 ? (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>🏠</Text>
    <Text style={styles.emptyText}>No hay propiedades disponibles</Text>
    <Text style={styles.emptySubtext}>Intenta con otra zona</Text>
  </View>
) : (
  propiedades.map((item) => (
    <React.Fragment key={item.id}>
      {renderProperty({ item })}
    </React.Fragment>
  ))
)}

      </View>
    )}
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    backgroundColor: colors.white,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 8,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textLight,
  },
  emptyZonasContainer: {
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  emptyZonasText: {
    fontSize: 13,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  searchButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    padding: 15,
    gap: 15,
  },
  // Added scrollContent to match contentContainerStyle usage on ScrollView
  scrollContent: {
    padding: 15,
    gap: 15,
    paddingBottom: 100,
  },
  propertyCardLarge: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  propertyImagePlaceholder: {
    height: 180,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
    marginBottom: 5,
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: colors.textLight,
  },
  propertyContent: {
    padding: 15,
  },
  propertyHeaderLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  propertyTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  propertyNameLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  propertyZoneLarge: {
    fontSize: 13,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusAvailable: {
    backgroundColor: '#E8F5E9',
  },
  statusUnavailable: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  propertyDescription: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  propertyDetailsLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailTextLarge: {
    fontSize: 13,
    color: colors.text,
  },
  propertyPriceLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
    marginLeft: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  propertyImage: {
  width: '100%',
  height: 180,
  backgroundColor: colors.background,
  },

});

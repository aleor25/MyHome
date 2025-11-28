import React from 'react';
import * as FileSystem from 'expo-file-system';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { colors } from '../assets/colors/colors';
import { useNavigation } from '@react-navigation/native';
import { obtenerCiudadPorCP, validarCP } from '../utils/zipCodeUtils';

export const AgregarPropiedad = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);
  const [loadingCP, setLoadingCP] = React.useState(false);

  // Estados del formulario
  const [nombre, setNombre] = React.useState('');
  const [descripcion, setDescripcion] = React.useState('');
  const [zona, setZona] = React.useState('');
  const [precioNoche, setPrecioNoche] = React.useState('');
  const [habitaciones, setHabitaciones] = React.useState('');
  const [huespedes, setHuespedes] = React.useState('');
  
  // Direccion
  const [calle, setCalle] = React.useState('');
  const [entreCalle, setEntreCalle] = React.useState('');
  const [yEntreCalle, setYEntreCalle] = React.useState('');
  const [cp, setCP] = React.useState('');
  const [colonia, setColonia] = React.useState('');
  const [ciudad, setCiudad] = React.useState('');
  const [estado, setEstado] = React.useState('');
  const [colonias, setColonias] = React.useState<string[]>([]);
  
  // Fotos
  const [fotoExterior, setFotoExterior] = React.useState<string | null>(null);
  const [fotoInterior, setFotoInterior] = React.useState<string | null>(null);

  const [showModal, setShowModal] = React.useState(false);

  const handleSeleccionarFoto = async (tipo: 'exterior' | 'interior') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: false,
      });

      if (result.canceled || !result.assets?.length) return;

      let uri = result.assets[0].uri;

      if (uri.startsWith('data:image')) {
        const filename = `${FileSystem.documentDirectory}${tipo}_${Date.now()}.jpg`;
        await FileSystem.writeAsStringAsync(filename, uri.split(',')[1], {
          encoding: FileSystem.EncodingType.Base64,
        });
        uri = filename;
      }

      if (tipo === 'exterior') setFotoExterior(uri);
      else setFotoInterior(uri);
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleEliminarFoto = (tipo: 'exterior' | 'interior') => {
    if (tipo === 'exterior') setFotoExterior(null);
    else setFotoInterior(null);
  };

  const handleBuscarCP = async () => {
    if (!cp || !validarCP(cp)) {
      Alert.alert('Error', 'Ingresa un CP válido (5 dígitos)');
      return;
    }

    setLoadingCP(true);
    try {
      const resultado = await obtenerCiudadPorCP(cp);
      if (resultado.error) {
        Alert.alert('Información', resultado.error);
        setColonias([]);
      } else {
        setCiudad(resultado.ciudad);
        setEstado(resultado.estado || '');
        setColonias(resultado.colonias);
        if (resultado.colonias.length > 0) {
          setColonia(resultado.colonias[0]);
        }
        Alert.alert('Éxito', `Ciudad: ${resultado.ciudad}\nEstado: ${resultado.estado}\nColonias encontradas: ${resultado.colonias.length}`);
      }
    } catch (error) {
      console.error('Error al buscar CP:', error);
      Alert.alert('Error', 'No se pudo buscar el CP');
    } finally {
      setLoadingCP(false);
    }
  };

  const handleGuardar = async () => {
    if (!nombre || !zona || !descripcion || !precioNoche || !habitaciones || !huespedes || !calle || !ciudad || !cp || !colonia || !fotoExterior || !fotoInterior) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Crear la propiedad
      const response = await api.post('/propiedades/crear', {
        nombre,
        descripcion,
        zona,
        calle,
        entreCalle,
        yEntreCalle,
        cp,
        colonia,
        ciudad,
        estado,
        precio_noche: parseFloat(precioNoche),
        cantidad_habitaciones: parseInt(habitaciones),
        cantidad_huespedes: parseInt(huespedes),
      });

      const propiedadId = response.data.propiedad.id;
      console.log('Propiedad creada con ID:', propiedadId);

      // 2️⃣ Subir fotos
      const subirFoto = async (uri: string, tipo: 'exterior' | 'interior') => {
        const formData = new FormData();
        const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
        const filename = `${tipo}_${Date.now()}.jpg`;

        formData.append('foto', {
          uri: fileUri,
          name: filename,
          type: 'image/jpeg',
        } as any);
        formData.append('tipoFoto', tipo);

        console.log(`📤 Subiendo ${tipo}:`, fileUri);

        await api.post(`/propiedades/${propiedadId}/agregar-foto`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          transformRequest: (data) => data,
        });
      };

      // Subir fotos
      await subirFoto(fotoExterior, 'exterior');
      await subirFoto(fotoInterior, 'interior');

      //Alert.alert('Éxito', 'Propiedad creada y fotos subidas correctamente 🎉');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error al crear propiedad:', error);
      Alert.alert('Error', error.response?.data?.error || 'Error al crear la propiedad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Crear Nueva Propiedad</Text>
          <Text style={styles.headerSubtitle}>Completa los detalles de tu propiedad</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre de la Propiedad *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Casa en Playa Hermosa"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Zona/Ubicación *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Playa Hermosa"
              value={zona}
              onChangeText={setZona}
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Dirección completa *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Avenida Central #123, cerca del parque"
              value={calle}
              onChangeText={setCalle}
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Código Postal *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 28001"
                value={cp}
                onChangeText={setCP}
                keyboardType="number-pad"
                maxLength={5}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <TouchableOpacity
              style={[styles.cpButton, loadingCP && { opacity: 0.6 }]}
              onPress={handleBuscarCP}
              disabled={loadingCP}
            >
              {loadingCP ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={{ color: colors.white, fontSize: 12, fontWeight: 'bold' }}>Buscar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Ciudad *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#f5f5f5' }]}
                placeholder="Se llena automáticamente con el CP"
                value={ciudad}
                editable={false}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Estado *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#f5f5f5' }]}
                placeholder="Se llena automáticamente con el CP"
                value={estado}
                editable={false}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Colonia *</Text>
            <Picker
              selectedValue={colonia}
              onValueChange={(itemValue) => setColonia(itemValue)}
            >
              {colonias.map((colonia) => (
                <Picker.Item key={colonia} label={colonia} value={colonia} />
              ))}
            </Picker>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              multiline
              placeholder="Describe brevemente la propiedad..."
              value={descripcion}
              onChangeText={setDescripcion}
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Foto Exterior *</Text>
            {fotoExterior ? (
              <View style={styles.photoPreviewBox}>
                <Image source={{ uri: fotoExterior }} style={styles.photoThumb} />
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => handleEliminarFoto('exterior')}
                >
                  <Text style={styles.deleteIconText}>✖</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => handleSeleccionarFoto('exterior')}
              >
                <Text style={styles.photoButtonText}>📸 Subir Foto Exterior</Text>
              </TouchableOpacity>
            )}

            <Text style={[styles.label, { marginTop: 20 }]}>Foto Interior *</Text>
            {fotoInterior ? (
              <View style={styles.photoPreviewBox}>
                <Image source={{ uri: fotoInterior }} style={styles.photoThumb} />
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => handleEliminarFoto('interior')}
                >
                  <Text style={styles.deleteIconText}>✖</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => handleSeleccionarFoto('interior')}
              >
                <Text style={styles.photoButtonText}>📸 Subir Foto Interior</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Precio por Noche ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 150.00"
              value={precioNoche}
              onChangeText={setPrecioNoche}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Habitaciones *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 3"
                value={habitaciones}
                onChangeText={setHabitaciones}
                keyboardType="number-pad"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Capacidad (Huéspedes) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 8"
                value={huespedes}
                onChangeText={setHuespedes}
                keyboardType="number-pad"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              loading || !fotoExterior || !fotoInterior || !nombre || !zona || !ciudad || !cp || !colonia || !precioNoche || !habitaciones || !huespedes
                ? styles.buttonDisabled
                : {},
            ]}
            onPress={() => setShowModal(true)}
            disabled={loading || !fotoExterior || !fotoInterior || !nombre || !zona || !ciudad || !cp || !colonia || !precioNoche || !habitaciones || !huespedes}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Revisar y Crear</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar</Text>
            <Text style={styles.modalMessage}>¿Deseas crear la propiedad "{nombre}"?</Text>

            <View style={styles.detailsList}>
              <Text style={styles.detailsItem}>📍 Zona: {zona}</Text>
              <Text style={styles.detailsItem}>💰 ${precioNoche}/noche</Text>
              <Text style={styles.detailsItem}>🛏️ {habitaciones} habitaciones</Text>
              <Text style={styles.detailsItem}>👥 {huespedes} huéspedes</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleGuardar}
              >
                <Text style={styles.modalButtonConfirmText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textLight,
  },
  header: {
    backgroundColor: colors.secondary,
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

form: {
    padding: 15,
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

textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  divider: {
    height: 2,
    backgroundColor: colors.secondary,
    marginBottom: 15,
    borderRadius: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  cpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cpButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: colors.textLight,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  button: {
    backgroundColor: colors.secondary,
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
  modalOverlay: {
    flex: 1,
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
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 15,
  },
  detailsList: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    gap: 8,
  },
  detailsItem: {
    fontSize: 13,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
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
    backgroundColor: colors.secondary,
  },
  modalButtonConfirmText: {
    color: colors.white,
    fontWeight: '600',
  },
  emptyPhotos: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyPhotosText: {
    fontSize: 14,
    color: colors.textLight,
  },
  photosContainer: {
    gap: 10,
  },
  photoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoPlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoIcon: {
    fontSize: 24,
  },
  photoType: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  deletePhotoButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deletePhotoText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  photoHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
  },
  photoButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  photoButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  photosPreview: {
    marginTop: 10,
    marginBottom: 5,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  photoCount: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 5,
  },
  photoPreviewBox: {
  position: 'relative',
  width: 100,
  height: 100,
  marginBottom: 10,
},
deleteIcon: {
  position: 'absolute',
  top: -8,
  right: -8,
  backgroundColor: 'rgba(0,0,0,0.6)',
  borderRadius: 12,
  width: 24,
  height: 24,
  justifyContent: 'center',
  alignItems: 'center',
},
deleteIconText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
},  
});
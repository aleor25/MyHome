import React from 'react';
import * as ImagePicker from 'expo-image-picker';
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
  Switch,
  Image,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import { colors } from '../assets/colors/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { obtenerCiudadPorCP, validarCP } from '../utils/zipCodeUtils';
import zonesData from '../data/zones.json';

export const EditarPropiedad = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { propiedadId } = route.params as { propiedadId: number };

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  // Estados del formulario
  const [nombre, setNombre] = React.useState('');
  const [descripcion, setDescripcion] = React.useState('');
  const [zona, setZona] = React.useState('');
  const [precioNoche, setPrecioNoche] = React.useState('');
  const [habitaciones, setHabitaciones] = React.useState('');
  const [capacidad, setCapacidad] = React.useState('');
  const [calle, setCalle] = React.useState('');
  const [entreCalle, setEntreCalle] = React.useState('');
  const [yEntreCalle, setYEntreCalle] = React.useState('');
  const [cp, setCP] = React.useState('');
  const [colonia, setColonia] = React.useState('');
  const [ciudad, setCiudad] = React.useState('');
  const [estado, setEstado] = React.useState('');
  const [colonias, setColonias] = React.useState<string[]>([]);
  const [disponible, setDisponible] = React.useState(true);
  const [fotos, setFotos] = React.useState<any[]>([]);
  const [fotoExterior, setFotoExterior] = React.useState<string | null>(null);
  const [fotoInterior, setFotoInterior] = React.useState<string | null>(null);
  const [loadingCP, setLoadingCP] = React.useState(false);

  React.useEffect(() => {
    fetchPropiedad();
  }, []);

  const fetchPropiedad = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/propiedades/detalle/${propiedadId}`);
      const prop = response.data.propiedad;
      const fotosData = response.data.fotos || [];

      // Cargar datos existentes
      setNombre(prop.nombre || '');
      setDescripcion(prop.descripcion || '');
      setZona(prop.zona || '');
      setPrecioNoche(prop.precio_noche?.toString() || '');
      setHabitaciones(prop.cantidad_habitaciones?.toString() || '');
      setCapacidad(prop.cantidad_huespedes?.toString() || '');
      setCalle(prop.calle || '');
      setEntreCalle(prop.entre_calle || '');
      setYEntreCalle(prop.y_entre_calle || '');
      setCP(prop.cp || '');
      setColonia(prop.colonia || '');
      setCiudad(prop.ciudad || '');
      setEstado(prop.estado || '');
      setDisponible(prop.disponible ?? true);
      setFotos(fotosData);

      // Asignar las fotos existentes (exterior e interior)
      const fotoExt = fotosData.find((f: any) => f.tipo_foto === 'exterior');
      const fotoInt = fotosData.find((f: any) => f.tipo_foto === 'interior');

      setFotoExterior(fotoExt ? `http://192.168.0.103:5000${fotoExt.url_foto}` : null);
      setFotoInterior(fotoInt ? `http://192.168.0.103:5000${fotoInt.url_foto}` : null);

    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo cargar la propiedad');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarFoto = (fotoId: number) => {
    Alert.alert(
      'Eliminar Foto',
      '¿Estás seguro de que deseas eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarFoto(fotoId),
        },
      ]
    );
  };

  const eliminarFoto = async (fotoId: number) => {
    try {
      await api.delete(`/propiedades/foto/${fotoId}`);
      setFotos(fotos.filter(foto => foto.id !== fotoId));
      Alert.alert('Éxito', 'Foto eliminada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al eliminar foto');
    }
  };

  

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

    // Si Expo devuelve base64, guárdala como archivo temporal
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
    Alert.alert('Error', 'No se pudo seleccionar la imagen');
  }
};

const handleEliminarFotoLocal = (tipo: 'exterior' | 'interior') => {
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
    // Validaciones
    if (!nombre || !zona || !precioNoche || !habitaciones || !capacidad) {
      Alert.alert('Error', 'Por favor completa los campos requeridos: nombre, zona, precio, habitaciones y capacidad');
      return;
    }

    if (!descripcion) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }

    if (!calle || !ciudad) {
      Alert.alert('Error', 'Por favor completa los campos de ubicación: calle y ciudad');
      return;
    }

    setSaving(true);
try {
  // 1️⃣ Actualizar datos generales
  await api.put(`/propiedades/actualizar/${propiedadId}`, {
    nombre,
    descripcion,
    zona,
    precioNoche: parseFloat(precioNoche),
    cantidadHabitaciones: parseInt(habitaciones),
    cantidadHuespedes: parseInt(capacidad),
    calle,
    entreCalle,
    yEntreCalle,
    cp,
    colonia,
    ciudad,
    estado,
    disponible,
  });

  // 2️⃣ Limpiar fotos anteriores si se eliminaron o reemplazaron
  if (!fotoExterior || fotoExterior.startsWith("file://")) {
    await api.put(`/propiedades/${propiedadId}/limpiar-foto`, { tipo: "exterior" });
  }
  if (!fotoInterior || fotoInterior.startsWith("file://")) {
    await api.put(`/propiedades/${propiedadId}/limpiar-foto`, { tipo: "interior" });
  }

  // 3️⃣ Subir nuevas fotos (solo si hay nuevas)
  const subirFoto = async (uri: string, tipo: "exterior" | "interior") => {
    const formData = new FormData();
    const fileUri = uri.startsWith("file://") ? uri : `file://${uri}`;
    const filename = `${tipo}_${Date.now()}.jpg`;

    formData.append(
      "foto",
      { uri: fileUri, name: filename, type: "image/jpeg" } as any
    );
    formData.append("tipoFoto", tipo);

    await api.post(`/propiedades/${propiedadId}/agregar-foto`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (data) => data,
    });
  };

  if (fotoExterior?.startsWith("file://")) {
    await subirFoto(fotoExterior, "exterior");
  }
  if (fotoInterior?.startsWith("file://")) {
    await subirFoto(fotoInterior, "interior");
  }

  Alert.alert("Éxito", "Propiedad y fotos actualizadas correctamente 🎉", [
    {
      text: "OK",
      onPress: () => {
        setShowModal(false);
        navigation.goBack();
      },
    },
  ]);
} catch (error: any) {
  console.error("Error al actualizar propiedad:", error);
  Alert.alert("Error", error.response?.data?.error || "Error al actualizar propiedad");
} finally {
  setSaving(false);
}

  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando propiedad...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Editar Propiedad</Text>
          <Text style={styles.headerSubtitle}>Actualiza los detalles de tu propiedad</Text>
        </View>

        <View style={styles.form}>
          {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            <View style={styles.divider} />

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
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu propiedad en detalle..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Zona/Tipo de Ubicación *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={zona}
                  onValueChange={(itemValue) => setZona(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona una zona" value="" />
                  {zonesData.zones.map((zone) => (
                    <Picker.Item key={zone.id} label={zone.name} value={zone.name} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* SECCIÓN 2: FOTOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos de la Propiedad</Text>
            <View style={styles.divider} />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Foto Exterior *</Text>
              {fotoExterior ? (
                <View style={{ position: 'relative', width: 100, height: 100 }}>
                  <Image source={{ uri: fotoExterior }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => handleEliminarFotoLocal('exterior')}
                  >
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✖</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.secondary,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 5,
                  }}
                  onPress={() => handleSeleccionarFoto('exterior')}
                >
                  <Text style={{ color: colors.white }}>📸 Subir Foto Exterior</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Foto Interior *</Text>
              {fotoInterior ? (
                <View style={{ position: 'relative', width: 100, height: 100 }}>
                  <Image source={{ uri: fotoInterior }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => handleEliminarFotoLocal('interior')}
                  >
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✖</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.secondary,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 5,
                  }}
                  onPress={() => handleSeleccionarFoto('interior')}
                >
                  <Text style={{ color: colors.white }}>📸 Subir Foto Interior</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>


          {/* SECCIÓN 3: UBICACIÓN Y DIRECCIÓN */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación y Dirección</Text>
            <View style={styles.divider} />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Calle *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Calle Principal #123"
                value={calle}
                onChangeText={setCalle}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Entre Calle</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Avenida A"
                  value={entreCalle}
                  onChangeText={setEntreCalle}
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Y Entre Calle</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Avenida B"
                  value={yEntreCalle}
                  onChangeText={setYEntreCalle}
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Código Postal</Text>
                <View style={styles.cpInputContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Ej: 28001"
                    value={cp}
                    onChangeText={setCP}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholderTextColor={colors.textLight}
                  />
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
              </View>
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
                <Text style={styles.label}>Estado</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: '#f5f5f5' }]}
                  placeholder="Se llena automáticamente"
                  value={estado}
                  editable={false}
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            {colonias.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Colonia</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={colonia}
                    onValueChange={(itemValue) => setColonia(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecciona una colonia" value="" />
                    {colonias.map((col, index) => (
                      <Picker.Item key={index} label={col} value={col} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>

          {/* SECCIÓN 4: PRECIOS Y CAPACIDAD */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precios y Capacidad</Text>
            <View style={styles.divider} />

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
                  value={capacidad}
                  onChangeText={setCapacidad}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
          </View>

          {/* SECCIÓN 5: DISPONIBILIDAD */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
            <View style={styles.divider} />

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Disponibilidad</Text>
                  <Text style={styles.switchDescription}>
                    {disponible
                      ? 'La propiedad está disponible para reservas'
                      : 'La propiedad NO está disponible para reservas'}
                  </Text>
                </View>
                <Switch
                  value={disponible}
                  onValueChange={setDisponible}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={disponible ? colors.white : colors.textLight}
                />
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Los campos marcados con * son obligatorios.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (saving || !fotoExterior || !fotoInterior || !nombre || !zona || !precioNoche || !habitaciones || !capacidad || !descripcion || !calle || !ciudad) && styles.buttonDisabled,
            ]}
            onPress={() => setShowModal(true)}
            disabled={
              saving ||
              !fotoExterior ||
              !fotoInterior ||
              !nombre ||
              !zona ||
              !precioNoche ||
              !habitaciones ||
              !capacidad ||
              !descripcion ||
              !calle ||
              !ciudad
            }
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <View style={styles.spacing} />
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
            <Text style={styles.modalTitle}>Confirmar Cambios</Text>
            <Text style={styles.modalMessage}>
              ¿Deseas guardar los cambios en "{nombre}"?
            </Text>

            <View style={styles.detailsList}>
              <Text style={styles.detailsItem}>📍 Zona: {zona}</Text>
              <Text style={styles.detailsItem}>💰 ${precioNoche}/noche</Text>
              <Text style={styles.detailsItem}>🛏️ {habitaciones} habitaciones</Text>
              <Text style={styles.detailsItem}>👥 Capacidad: {capacidad} huéspedes</Text>
              <Text style={styles.detailsItem}>📍 {calle}</Text>
              <Text style={styles.detailsItem}>{ciudad}{cp ? ` - CP: ${cp}` : ''}</Text>
              <Text style={styles.detailsItem}>
                {disponible ? '✅ Disponible' : '❌ No disponible'}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowModal(false)}
                disabled={saving}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleGuardar}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Guardar</Text>
                )}
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
});

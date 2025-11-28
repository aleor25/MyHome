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
} from 'react-native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';
import { useNavigation, useRoute } from '@react-navigation/native';

export const CrearResenaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reservaId, propiedadId, propietarioId, propiedadNombre } = route.params as any;

  const [loading, setLoading] = React.useState(false);
  const [calificacion, setCalificacion] = React.useState(0);
  const [limpieza, setLimpieza] = React.useState(0);
  const [ubicacion, setUbicacion] = React.useState(0);
  const [comunicacion, setComunicacion] = React.useState(0);
  const [calidadPrecio, setCalidadPrecio] = React.useState(0);
  const [comentario, setComentario] = React.useState('');

  const handleSubmit = async () => {
    if (calificacion === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación general');
      return;
    }

    setLoading(true);
    try {
      await api.post('/resenas/crear', {
        reservaId,
        propiedadId,
        propietarioId,
        calificacion,
        comentario: comentario.trim(),
        limpieza: limpieza || null,
        ubicacion: ubicacion || null,
        comunicacion: comunicacion || null,
        relacionCalidadPrecio: calidadPrecio || null,
      });

      Alert.alert('Éxito', 'Reseña publicada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Error al publicar reseña');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value: number, setValue: (v: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setValue(star)}
            style={styles.starButton}
          >
            <Text style={[styles.star, value >= star && styles.starSelected]}>
              {value >= star ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Califica tu estadía</Text>
        <Text style={styles.headerSubtitle}>{propiedadNombre}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Calificación General *</Text>
        {renderStars(calificacion, setCalificacion)}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Limpieza (opcional)</Text>
        {renderStars(limpieza, setLimpieza)}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Ubicación (opcional)</Text>
        {renderStars(ubicacion, setUbicacion)}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Comunicación (opcional)</Text>
        {renderStars(comunicacion, setComunicacion)}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Relación Calidad-Precio (opcional)</Text>
        {renderStars(calidadPrecio, setCalidadPrecio)}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Comentario (opcional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Cuéntanos sobre tu experiencia..."
          value={comentario}
          onChangeText={setComentario}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          editable={!loading}
          placeholderTextColor={colors.textLight}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Publicar Reseña</Text>
        )}
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
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 32,
    color: colors.border,
  },
  starSelected: {
    color: '#FFB300',
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
    minHeight: 120,
  },
  button: {
    backgroundColor: colors.primary,
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacing: {
    height: 30,
  },
});

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
import { useNavigation } from '@react-navigation/native';

export const CambiarContrasenaScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);
  const [contrasenaActual, setContrasenaActual] = React.useState('');
  const [contrasenaNueva, setContrasenaNueva] = React.useState('');
  const [contrasenaConfirmar, setContrasenaConfirmar] = React.useState('');
  const [showActual, setShowActual] = React.useState(false);
  const [showNueva, setShowNueva] = React.useState(false);
  const [showConfirmar, setShowConfirmar] = React.useState(false);

  const handleCambiar = async () => {
    if (!contrasenaActual || !contrasenaNueva || !contrasenaConfirmar) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (contrasenaNueva !== contrasenaConfirmar) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (contrasenaNueva.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/cambiar-contrasena', {
        contrasenaActual,
        contrasenaNueva,
      });

      Alert.alert('Éxito', 'Contraseña cambiada correctamente', [
        {
          text: 'OK',
          onPress: () => {
            setContrasenaActual('');
            setContrasenaNueva('');
            setContrasenaConfirmar('');
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔐 Cambiar Contraseña</Text>
        <Text style={styles.headerSubtitle}>Actualiza tu contraseña de acceso</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Contraseña Actual *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Tu contraseña actual"
              value={contrasenaActual}
              onChangeText={setContrasenaActual}
              secureTextEntry={!showActual}
              editable={!loading}
              placeholderTextColor={colors.textLight}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowActual(!showActual)}
            >
              <Text style={styles.eyeIcon}>{showActual ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nueva Contraseña *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 6 caracteres"
              value={contrasenaNueva}
              onChangeText={setContrasenaNueva}
              secureTextEntry={!showNueva}
              editable={!loading}
              placeholderTextColor={colors.textLight}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNueva(!showNueva)}
            >
              <Text style={styles.eyeIcon}>{showNueva ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirmar Nueva Contraseña *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repite la nueva contraseña"
              value={contrasenaConfirmar}
              onChangeText={setContrasenaConfirmar}
              secureTextEntry={!showConfirmar}
              editable={!loading}
              placeholderTextColor={colors.textLight}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmar(!showConfirmar)}
            >
              <Text style={styles.eyeIcon}>{showConfirmar ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🔒 La contraseña debe tener al menos 6 caracteres. Usa combinación de letras, números y símbolos para mayor seguridad.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCambiar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  form: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: colors.text,
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
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

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import { colors } from '../assets/colors/colors';

interface RegisterScreenProps {
  onRegistered: () => void;
  onBackToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegistered,
  onBackToLogin,
}) => {
  const [nombre, setNombre] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [telefono, setTelefono] = React.useState('');
  const [tipoUsuario, setTipoUsuario] = React.useState('huesped');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Validar nombre
  const handleNombreChange = (text: string) => {
    // Reemplazar múltiples espacios consecutivos por uno solo
    const nombreConEspaciosCorrectos = text.replace(/\s{2,}/g, ' ');

    // Validar solo letras y no permitir números ni caracteres especiales (excepto acentos y espacios simples)
    const regex = /^[A-Za-zÁáÉéÍíÓóÚú\s]+$/;
    if (nombreConEspaciosCorrectos === '' || regex.test(nombreConEspaciosCorrectos)) {
      setNombre(nombreConEspaciosCorrectos);
    } else {
      //Alert.alert('Error', 'El nombre solo puede contener letras y espacios.');
    }
  };

  // Validar email al hacer clic en el botón de registro
  const handleEmailChange = (text: string) => {
    setEmail(text); // Solo se guarda el email, no se valida en tiempo real
  };

  // Validar teléfono: solo permitir hasta 10 números y sólo números
const handleTelefonoChange = (text: string) => {
  // Solo permitir números y hasta 10 caracteres
  if (/^[0-9]{0,10}$/.test(text)) { // Esta condición asegura que solo se permiten números y máximo 10 dígitos
    setTelefono(text);
  } else if (text.length > 10) {
    //Alert.alert('Error', 'El teléfono no puede tener más de 10 dígitos.');
  }
};


  // Validar contraseña
  const handlePasswordChange = (text: string) => {
    const regexPassword = /^[a-zA-Z0-9]*$/;
    if (!regexPassword.test(text)) {
      Alert.alert('Error', 'La contraseña solo puede contener números y letras.');
    } else if (
      text === '123456' ||
      text === '654321' ||
      /(\d)\1{2}/.test(text) || // Tres caracteres repetidos
      /([a-zA-Z])\1{2}/.test(text) || // Tres letras repetidas
      /(123|234|345|456|567|678|789)/.test(text) // Detectar secuencias numéricas en orden
    ) {
      Alert.alert('Error', 'Contraseña no válida. No puede ser una secuencia de números o letras repetidas.');
    } else {
      setPassword(text);
    }
  };

  // Validar confirmación de contraseña
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
  };

  const handleRegister = async () => {
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(email)) {
      Alert.alert('Error', 'Email no válido');
      return;
    }

    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/registro', {
        nombre,
        email,
        password,
        confirmPassword,
        telefono,
        tipoUsuario,
      });

      onRegistered();
    } catch (error: any) {
      console.error('Error en registro:', error);
      Alert.alert('Error', error.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏠 MyHome</Text>
        <Text style={styles.subtitle}>Crear Cuenta</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Juan Pérez"
          value={nombre}
          onChangeText={handleNombreChange}
          editable={!loading}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          editable={!loading}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Teléfono (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="5551234567"
          value={telefono}
          onChangeText={handleTelefonoChange}
          keyboardType="phone-pad"
          editable={!loading}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>¿Eres propietario o huésped?</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoUsuario}
            onValueChange={setTipoUsuario}
            enabled={!loading}
            style={styles.picker}
          >
            <Picker.Item label="👤 Huésped" value="huesped" />
            <Picker.Item label="🏘️ Propietario" value="propietario" />
          </Picker>
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!showPassword}
            editable={!loading}
            placeholderTextColor={colors.textLight}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
            placeholderTextColor={colors.textLight}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onBackToLogin}>
          <Text style={styles.link}>
            ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 5,
  },
  form: {
    gap: 15,
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 10,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
    marginTop: 20,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: 'bold',
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
});
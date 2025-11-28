import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import api from './src/services/api';
import { colors } from './src/assets/colors/colors';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { PropietarioNavigator, HuespedNavigator } from './src/navigation/MainNavigator';
import { LogoutProvider } from './src/context/LogoutContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [email, setEmail] = React.useState('');
const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [showRegister, setShowRegister] = React.useState(false);
  const [checkingSession, setCheckingSession] = React.useState(true);
  const navigationRef = React.useRef(null);

  React.useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        try {
          const response = await api.get('/auth/perfil');
          setUser(response.data);
          setIsLoggedIn(true);
        } catch (error) {
          console.log('Token inválido');
          await AsyncStorage.removeItem('userToken');
        }
      }
    } catch (error) {
      console.log('Error al verificar sesión:', error);
    } finally {
      setCheckingSession(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('userToken', response.data.token);
      setUser(response.data.usuario);
      setIsLoggedIn(true);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Error en login:', error);
      Alert.alert('Error', error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('handleLogout ejecutándose');
    try {
      await AsyncStorage.removeItem('userToken');
      console.log('Token removido del storage');
      setUser(null);
      setIsLoggedIn(false);
      setEmail('');
      setPassword('');
      console.log('Estado actualizado');
      //Alert.alert('Éxito', 'Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleRegistered = () => {
    setShowRegister(false);
    //Alert.alert('Éxito', 'Ahora inicia sesión con tus credenciales');
    setEmail('');
    setPassword('');
  };

  if (checkingSession) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showRegister) {
    return (
      <RegisterScreen
        onRegistered={handleRegistered}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏠 MyHome</Text>
          <Text style={styles.subtitle}>Gestión de Reservas</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            placeholderTextColor={colors.textLight}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowRegister(true)}>
            <Text style={styles.link}>
              ¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <LogoutProvider onLogout={handleLogout}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user.tipo_usuario === 'propietario' ? (
            <Stack.Screen name="PropietarioApp">
              {() => <PropietarioNavigator />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="HuespedApp">
              {() => <HuespedNavigator />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </LogoutProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  infoText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
  },
  credentialText: {
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 12,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 5,
    fontFamily: 'monospace',
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
});
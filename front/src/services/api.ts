import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.103:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentado de 10s a 30s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    console.log('==========================================');
    console.log('[API-REQUEST] Nueva petición:');
    console.log('[API-REQUEST] Método:', config.method?.toUpperCase());
    console.log('[API-REQUEST] URL:', config.baseURL + config.url);
    console.log('[API-REQUEST] Headers:', config.headers);
    console.log('[API-REQUEST] Body:', config.data);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API-REQUEST] ✓ Token agregado');
        console.log('[API-REQUEST] Token preview:', token.substring(0, 20) + '...');
      } else {
        console.log('[API-REQUEST] ⚠️ NO HAY TOKEN - Usuario no autenticado');
      }
    } catch (error) {
      console.error('[API-REQUEST] ✗ Error al obtener token:', error);
    }

    console.log('==========================================');
    return config;
  },
  (error) => {
    console.error('==========================================');
    console.error('[API-REQUEST] ✗ Error en request interceptor:', error);
    console.error('==========================================');
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    console.log('==========================================');
    console.log('[API-RESPONSE] Respuesta exitosa:');
    console.log('[API-RESPONSE] Status:', response.status);
    console.log('[API-RESPONSE] URL:', response.config.url);
    console.log('[API-RESPONSE] Data:', response.data);
    console.log('==========================================');
    return response;
  },
  async (error) => {
    console.error('==========================================');
    console.error('[API-RESPONSE] ✗ Error de respuesta:');
    console.error('[API-RESPONSE] Error message:', error.message);
    console.error('[API-RESPONSE] Error code:', error.code);

    if (error.response) {
      // El servidor respondió con un código de error
      console.error('[API-RESPONSE] Status:', error.response.status);
      console.error('[API-RESPONSE] Data:', error.response.data);
      console.error('[API-RESPONSE] Headers:', error.response.headers);

      if (error.response?.status === 401) {
        console.error('[API-RESPONSE] ⚠️ Token expirado o inválido');
        await AsyncStorage.removeItem('userToken');
      }
    } else if (error.request) {
      // La petición se envió pero no hubo respuesta
      console.error('[API-RESPONSE] ✗ NO SE RECIBIÓ RESPUESTA DEL SERVIDOR');
      console.error('[API-RESPONSE] Request:', error.request);
    } else {
      // Error al configurar la petición
      console.error('[API-RESPONSE] ✗ Error al configurar la petición:', error.message);
    }

    console.error('[API-RESPONSE] Config:', error.config);
    console.error('==========================================');
    return Promise.reject(error);
  }
);

export default api;
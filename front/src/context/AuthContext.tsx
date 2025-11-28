import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export interface User {
  id: number;
  nombre: string;
  email: string;
  tipo_usuario: 'propietario' | 'huesped';
  telefono?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (data: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay token guardado al iniciar
  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          setToken(savedToken);
          // Obtener datos del usuario
          const response = await api.get('/auth/perfil');
          setUser(response.data);
        }
      } catch (error) {
        console.log('Error al verificar token:', error);
        await AsyncStorage.removeItem('userToken');
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  const register = async (data: any) => {
    try {
      const response = await api.post('/auth/registro', data);
      setToken(response.data.token);
      setUser(response.data.usuario);
      await AsyncStorage.setItem('userToken', response.data.token);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error en el registro');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.usuario);
      await AsyncStorage.setItem('userToken', response.data.token);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error en el login');
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        isLoggedIn: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
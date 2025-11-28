/**
 * Utilidades para buscar información de Código Postal (CP)
 * Usa una API backend propia para máxima confiabilidad
 */
import api from '../services/api';

interface CPResponse {
  ciudad: string;
  estado: string;
  colonias: string[];
  error?: string;
}

/**
 * Busca la ciudad y colonias para un Código Postal
 * Utiliza el endpoint del backend que tiene una BD propia
 */
export const obtenerCiudadPorCP = async (cp: string): Promise<CPResponse> => {
  try {
    // Validar que el CP tenga el formato correcto (5 dígitos)
    if (!cp || !/^\d{5}$/.test(cp.trim())) {
      return {
        ciudad: '',
        colonias: [],
        error: 'El CP debe tener 5 dígitos'
      };
    }

    const cpLimpio = cp.trim();
    console.log(`🔍 Buscando CP: ${cpLimpio}`);

    // Llamar al backend
    const response = await api.get(`/zip-code/${cpLimpio}`);

    if (response.data && response.data.encontrado) {
      console.log('✅ CP encontrado:', response.data);
      return {
        ciudad: response.data.ciudad || '',
        estado: response.data.estado || '',
        colonias: response.data.colonias || [],
        error: undefined
      };
    }

    // CP no encontrado pero respuesta válida
    return {
      ciudad: '',
      estado: '',
      colonias: [],
      error: response.data?.error || 'CP no encontrado en la base de datos.'
    };

  } catch (error: any) {
    console.error('Error al buscar CP:', error);

    // Si es error 404, es normal (CP no existe)
    if (error.response?.status === 404) {
      return {
        ciudad: '',
        estado: '',
        colonias: [],
        error: error.response.data?.error || 'CP no encontrado en la base de datos.'
      };
    }

    // Otro tipo de error
    return {
      ciudad: '',
      estado: '',
      colonias: [],
      error: 'Error al consultar el CP. Intenta de nuevo.'
    };
  }
};

/**
 * Obtener colonias para una ciudad específica
 * Útil para mostrar opciones de colonias una vez seleccionada la ciudad
 */
export const obtenerColoniasPorCiudad = async (
  ciudad: string,
  cp?: string
): Promise<string[]> => {
  try {
    if (cp) {
      // Si tenemos CP, usarlo para obtener colonias
      const resultado = await obtenerCiudadPorCP(cp);
      return resultado.colonias || [];
    }

    // Si no tenemos CP, retornar lista vacía
    // El usuario debe llenar primero el CP o usar otro método
    return [];
  } catch (error) {
    console.error('Error al obtener colonias:', error);
    return [];
  }
};

/**
 * Validar si un CP es válido para México
 */
export const validarCP = (cp: string): boolean => {
  return /^\d{5}$/.test(cp.trim());
};

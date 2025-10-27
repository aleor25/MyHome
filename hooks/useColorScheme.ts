import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Hook que detecta el tema del dispositivo (light o dark).
 * Ya no fuerza el modo claro.
 */
export function useColorScheme() {
    // Simplemente devuelve el valor real del hook de React Native
    return useRNColorScheme();
}
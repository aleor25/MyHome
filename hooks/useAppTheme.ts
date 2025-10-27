import { ThemeColors } from '../constants/theme';
import { useColorScheme } from './useColorScheme';

/**
 * Devuelve el objeto de paleta de colores completo
 * (light o dark) según el tema del dispositivo.
 */
export const useAppTheme = () => {
    const scheme = useColorScheme();
    return scheme === 'dark' ? ThemeColors.dark : ThemeColors.light;
};
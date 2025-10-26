/**
 * Hook simplificado para obtener colores, asumiendo que solo existe el modo claro.
 */

import { Colors } from '@/constants/theme';
// Ya no necesitamos 'useColorScheme' porque siempre es 'light'.

export function useThemeColor(
  // 1. Eliminamos la prop 'dark'
  props: { light?: string },
  // 2. El tipo de 'colorName' solo necesita ser 'keyof Colors.light'
  colorName: keyof typeof Colors.light
) {
  // 3. Obtenemos el color directamente de 'props.light'
  const colorFromProps = props.light;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // 4. Obtenemos el color directamente de 'Colors.light'
    return Colors.light[colorName];
  }
}

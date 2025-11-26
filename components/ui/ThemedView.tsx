import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

// --- CORRECCIÓN 1: Añadir 'variant' a las props ---
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card'; // 'card' usa 'surface', 'default' usa 'background'
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default', // Añadimos valor por defecto
  ...otherProps
}: ThemedViewProps) {

  // --- CORRECCIÓN 2: Lógica de color correcta ---
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant === 'card' ? 'surface' : 'background' // Mapea variant a color
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

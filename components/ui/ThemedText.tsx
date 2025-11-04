import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

// --- CORRECCIÓN 1: Añadir 'label' y 'caption' ---
export type TextType = 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'label' | 'caption';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TextType;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {

  // --- CORRECCIÓN 2: Lógica de color correcta ---
  const colorName =
    type === 'link' ? 'primary' :
      (type === 'label' || type === 'caption') ? 'textSecondary' :
        'text'; // Default es 'text' (negro)

  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorName);

  return (
    <Text
      style={[
        { color }, // Aplica el color correcto
        // Aplica estilos de fuente según el 'type'
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'label' ? styles.label : undefined, // Añadido
        type === 'caption' ? styles.caption : undefined, // Añadido
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Tus estilos 'default', 'defaultSemiBold', 'title', 'subtitle' están bien
  default: { fontSize: 16, lineHeight: 24, fontFamily: 'NotoSans_400Regular' },
  defaultSemiBold: { fontSize: 16, lineHeight: 24, fontFamily: 'NotoSans_700Bold' },
  title: { fontSize: 32, fontFamily: 'NotoSans_700Bold', lineHeight: 32 },
  subtitle: { fontSize: 20, fontFamily: 'NotoSans_700Bold' },
  link: {
    // Ya no necesita 'color' aquí, se aplica arriba
    lineHeight: 30,
    fontSize: 16,
    fontFamily: 'NotoSans_400Regular'
  },
  // --- CORRECCIÓN 3: Añadir estilos para label y caption ---
  label: {
    fontSize: 14,
    // El color textSecondary se aplica arriba
    fontFamily: 'NotoSans_400Regular', // O NotoSans_700Bold si prefieres
  },
  caption: {
    fontSize: 12,
    // El color textSecondary se aplica arriba
    fontFamily: 'NotoSans_400Regular',
  },
});

// En: components/ui/Themed.tsx (o puedes tener ThemedText.tsx y ThemedView.tsx separados)

import { useThemeColor } from '@/hooks/useThemeColor'; // Asumo que este hook existe
import { StyleSheet, Text, TextProps, View, ViewProps } from 'react-native';

// --- THEMED VIEW ---
export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
    variant?: 'default' | 'card'; // 'card' para fondos blancos, 'default' para fondo gris
};

export function ThemedView({ style, lightColor, darkColor, variant = 'default', ...rest }: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        variant === 'card' ? 'surface' : 'background'
    );

    return <View style={[{ backgroundColor }, style]} {...rest} />;
}


// --- THEMED TEXT ---
type TextType = 'default' | 'title' | 'subtitle' | 'label' | 'link' | 'caption';

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: TextType;
};

export function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }: ThemedTextProps) {
    // Solo se permite 'text' o 'tint' como colorName
    const color = useThemeColor(
        { light: lightColor, dark: darkColor },
        type === 'link' ? 'primary' : 'text'
    );

    return (
        <Text
            style={[
                { color },
                styles.default,
                type === 'title' && styles.title,
                type === 'subtitle' && styles.subtitle,
                type === 'label' && styles.label,
                type === 'link' && styles.link,
                type === 'caption' && styles.caption,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        lineHeight: 24,
    },
    title: {
        fontSize: 28, // ej. "Tus tarjetas guardadas" [cite: 46]
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 20, // ej. "Agregar tarjeta" [cite: 58]
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        // El color se aplica mediante useThemeColor
    },
    link: {
        fontSize: 16,
        fontWeight: '500',
        // El color se aplica mediante useThemeColor
    },
    caption: {
        fontSize: 12,
        // El color se aplica mediante useThemeColor
    },
});
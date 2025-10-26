// En: components/ui/Button.tsx
import Colors from '@/constants/Colors'; // Importa la paleta
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

type ButtonProps = {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', loading, style }: ButtonProps) {
    const theme = 'light'; // O usa tu hook de tema

    const getColors = () => {
        switch(variant) {
            case 'primary':
                return { bg: Colors[theme].primary, text: '#FFF' };
            case 'secondary':
                return { bg: Colors[theme].secondary, text: Colors[theme].primary };
            case 'danger':
                return { bg: Colors[theme].danger, text: '#FFF' };
            case 'success':
                return { bg: Colors[theme].success, text: '#FFF' };
            case 'ghost':
                return { bg: 'transparent', text: Colors[theme].primary };
            default:
                return { bg: Colors[theme].primary, text: '#FFF' };
        }
    };

const { bg, text } = getColors();

return (
    <TouchableOpacity
        style={[styles.button, { backgroundColor: bg }, style]}
        onPress={onPress}
        disabled={loading}
    >
        {loading ? (
            <ActivityIndicator color={text} />
        ) : (
            <Text style={[styles.text, { color: text }]}>{title}</Text>
        )}
    </TouchableOpacity>
);
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 28, // Muy redondeado (píldora)
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    text: {
        fontSize: 17,
        fontWeight: '600',
    },
});
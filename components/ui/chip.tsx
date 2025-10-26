// En: components/ui/Chip.tsx
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './themed';

type ChipProps = {
    title: string;
    onPress: () => void;
    active?: boolean;
    style?: ViewStyle;
};

export function Chip({ title, onPress, active = false, style }: ChipProps) {
    // Colores basados en el estado 'active'
    const backgroundColor = useThemeColor(
        {
            light: active ? '#1C1C1E' : '#FFFFFF',
            dark: active ? '#E5E5E7' : '#2C2C2E'
        },
        'background'
    );

    const textColor = useThemeColor(
        {
            light: active ? '#FFFFFF' : '#1C1C1E',
            dark: active ? '#000000' : '#FFFFFF'
        },
        active ? 'background' : 'text'
    );

    return (
        <TouchableOpacity
            style={[styles.chip, { backgroundColor }, style]}
            onPress={onPress}
        >
            <ThemedText style={[styles.text, { color: textColor }]}>{title}</ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
    },
});
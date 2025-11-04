// En: components/ui/Chip.tsx
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

type ChipProps = {
    title: string;
    onPress: () => void;
    active?: boolean;
    style?: ViewStyle;
};

export function Chip({ title, onPress, active = false, style }: ChipProps) {
    const backgroundColor = useThemeColor(
        {},
        active ? 'primary' : 'surface'
    );

    const textColor = useThemeColor(
        {},
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
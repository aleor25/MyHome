import { useThemeColor } from '@/hooks/useThemeColor';
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
    const primaryColor = useThemeColor({}, 'primary');
    const secondaryColor = useThemeColor({}, 'secondary');
    const dangerColor = useThemeColor({}, 'danger');
    const successColor = useThemeColor({}, 'success');

    const getThemeColors = () => {
        switch (variant) {
            case 'primary':
                return { bg: primaryColor, text: '#FFFFFF' };
            case 'secondary':
                return { bg: secondaryColor, text: primaryColor };
            case 'danger':
                return { bg: dangerColor, text: '#FFFFFF' };
            case 'success':
                return { bg: successColor, text: '#FFFFFF' };
            case 'ghost':
                return { bg: 'transparent', text: primaryColor };
            default:
                return { bg: primaryColor, text: '#FFFFFF' };
        }
    };

    const { bg, text } = getThemeColors();

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
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    text: {
        fontSize: 17,
        fontWeight: '600',
    },
});

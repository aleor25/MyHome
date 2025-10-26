// En: components/ui/Input.tsx
import { ThemedText, ThemedView } from '@/components/ui/themed';
import Colors from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
    label: string;
};

export function Input({ label, style, ...rest }: InputProps) {
    const theme = 'light'; // O usa tu hook
    const borderColor = Colors[theme].border;
    const cardColor = Colors[theme].card;
    const placeholderColor = Colors[theme].textSecondary;

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="label" style={styles.label}>{label}</ThemedText>
            <TextInput
                style={[styles.input, { borderColor, backgroundColor: cardColor }, style]}
                placeholderTextColor={placeholderColor}
                {...rest}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        backgroundColor: 'transparent', // El contenedor no debe tener color
    },
    label: {
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 12, // Ligeramente redondeado
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000', // Asegurar que el texto del input sea el primario
    },
});
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
    label: string;
};

export function Input({ label, style, ...rest }: InputProps) {
    const borderColor = useThemeColor({}, 'border');
    const backgroundColor = useThemeColor({}, 'surface');
    // Usamos 'textSecondary' para el color del placeholder
    const placeholderColor = useThemeColor({}, 'textSecondary');

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="defaultSemiBold" style={styles.label}>{label}</ThemedText>
            <TextInput
                style={[styles.input, { borderColor, backgroundColor, color: useThemeColor({}, 'text') }, style]}
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
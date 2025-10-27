import { ThemedView, type ThemedViewProps } from '@/components/ui/ThemedView'; // <--- CORREGIDO
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenWrapperProps = ThemedViewProps & {
    scrollable?: boolean;
    children: React.ReactNode;
};

export function ScreenWrapper({ children, scrollable, style, ...rest }: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();

    const content = (
        <ThemedView
            style={[
                styles.container,
                { paddingTop: insets.top, paddingBottom: insets.bottom },
                style,
            ]}
            // Usar 'background' para el fondo de la pantalla (tu color menta)
            {...rest}
        >
            {children}
        </ThemedView>
    );

    if (scrollable) {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                {content}
            </ScrollView>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
});

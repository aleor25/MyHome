// MyHome/components/layouts/ScreenWrapper.tsx
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView, type ThemedViewProps } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

type ScreenWrapperProps = ThemedViewProps & {
    scrollable?: boolean;
    children: React.ReactNode;
};

export function ScreenWrapper({ children, scrollable, style, ...rest }: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor({}, 'background'); // 🎨 del parallax

    const content = (
        <ThemedView
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 16,
                    paddingBottom: insets.bottom + 16,
                    backgroundColor, // 🌗 fondo dinámico según tema
                },
                style,
            ]}
            variant="default"
            {...rest}
        >
            {children}
        </ThemedView>
    );

    if (scrollable) {
        return (
            <ScrollView
                style={[styles.scrollView, { backgroundColor }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {content}
            </ScrollView>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32, //si no me agrada puedo cambiarlo a 32
        gap: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
});

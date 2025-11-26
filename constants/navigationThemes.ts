import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { ThemeColors } from './theme';

export interface AppTheme extends Theme {
    colors: Theme['colors'] & {
        primary: string;
        secondary: string;
        surface: string;
        icon: string;
        danger: string;
        success: string;
        warning: string;
        textSecondary: string;
    };
}

export const AppLightTheme: AppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: ThemeColors.light.primary,
        secondary: ThemeColors.light.secondary,
        background: ThemeColors.light.background,
        surface: ThemeColors.light.surface,
        card: ThemeColors.light.surface,
        text: ThemeColors.light.text,
        textSecondary: ThemeColors.light.textSecondary,
        border: ThemeColors.light.border,
        icon: ThemeColors.light.icon,
        danger: ThemeColors.light.danger,
        success: ThemeColors.light.success,
        warning: ThemeColors.light.warning,
    },
};

export const AppDarkTheme: AppTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: ThemeColors.dark.primary,
        secondary: ThemeColors.dark.secondary,
        background: ThemeColors.dark.background,
        surface: ThemeColors.dark.surface,
        card: ThemeColors.dark.surface,
        text: ThemeColors.dark.text,
        textSecondary: ThemeColors.dark.textSecondary,
        border: ThemeColors.dark.border,
        icon: ThemeColors.dark.icon,
        danger: ThemeColors.dark.danger,
        success: ThemeColors.dark.success,
        warning: ThemeColors.dark.warning,
    },
};

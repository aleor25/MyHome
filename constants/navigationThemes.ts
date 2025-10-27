// constants/navigation-themes.ts

import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { ThemeColors } from './theme';

export const AppLightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: ThemeColors.light.primary,
        background: ThemeColors.light.background,
        card: ThemeColors.light.surface,
        text: ThemeColors.light.text,
        border: ThemeColors.light.border,
    },
};

export const AppDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: ThemeColors.dark.primary,
        background: ThemeColors.dark.background,
        card: ThemeColors.dark.surface,
        text: ThemeColors.dark.text,
        border: ThemeColors.dark.border,
    },
};
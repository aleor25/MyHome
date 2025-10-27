import { ThemeColors } from '@/constants/theme';
import { useColorScheme } from './useColorScheme';

type Props = {
  light?: string;
  dark?: string;
};

export function useThemeColor(
  props: Props,
  colorName: keyof typeof ThemeColors.light
) {
  const colorScheme = useColorScheme() ?? 'light';
  const colorFromProps = props[colorScheme];
  
  return colorFromProps || ThemeColors[colorScheme][colorName];
}
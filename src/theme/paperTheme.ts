import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

// 品牌蓝主色的 Material Design 3 色板（tonal palette 手工推导）
export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976D2',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D3E4FD',
    onPrimaryContainer: '#0A3060',
    secondary: '#546E7A',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#DCE7EE',
    onSecondaryContainer: '#122A35',
    tertiary: '#00897B',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#B2DFDB',
    onTertiaryContainer: '#00352F',
    background: '#F8F9FC',
    surface: '#FCFCFF',
    surfaceVariant: '#E0E4EC',
    onSurfaceVariant: '#44474E',
    outline: '#74777F',
  },
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A4C9FB',
    onPrimary: '#0A3060',
    primaryContainer: '#2A4E7E',
    onPrimaryContainer: '#D3E4FD',
    secondary: '#B4C9D4',
    onSecondary: '#1F333D',
    secondaryContainer: '#3A4C56',
    onSecondaryContainer: '#DCE7EE',
    tertiary: '#82CFC5',
    onTertiary: '#00352F',
    tertiaryContainer: '#005046',
    onTertiaryContainer: '#B2DFDB',
    background: '#111418',
    surface: '#191C20',
    surfaceVariant: '#44474E',
    onSurfaceVariant: '#C4C6CF',
    outline: '#8E9099',
  },
};

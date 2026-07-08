import React, { createContext, useContext, PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, lightTheme, darkTheme } from '@/theme/tokens';
import { useSettingsStore } from '@/store/settingsStore';

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const mode = useSettingsStore(s => s.themeMode);
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  return (
    <ThemeContext.Provider value={isDark ? darkTheme : lightTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): Theme => useContext(ThemeContext);

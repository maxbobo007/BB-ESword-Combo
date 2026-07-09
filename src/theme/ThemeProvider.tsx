import React, { createContext, useContext, PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { GameTheme, lightGameTheme, darkGameTheme } from '@/theme/tokens';
import { paperLightTheme, paperDarkTheme } from '@/theme/paperTheme';
import { useSettingsStore } from '@/store/settingsStore';

const GameThemeContext = createContext<GameTheme>(lightGameTheme);

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const mode = useSettingsStore(s => s.themeMode);
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  return (
    <GameThemeContext.Provider value={isDark ? darkGameTheme : lightGameTheme}>
      <PaperProvider theme={isDark ? paperDarkTheme : paperLightTheme}>{children}</PaperProvider>
    </GameThemeContext.Provider>
  );
}

/** 棋盘等游戏专用颜色；MD3 组件颜色请用 react-native-paper 的 useTheme */
export const useGameTheme = (): GameTheme => useContext(GameThemeContext);

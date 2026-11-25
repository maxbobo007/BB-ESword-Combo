import React, { createContext, useContext, PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { GameTheme, lightGameTheme, darkGameTheme } from '@/theme/tokens';
import { CupertinoTheme, cupertinoLight, cupertinoDark } from '@/theme/cupertino';
import { useSettingsStore } from '@/store/settingsStore';

const GameThemeContext = createContext<GameTheme>(lightGameTheme);
const CupertinoContext = createContext<CupertinoTheme>(cupertinoLight);

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const mode = useSettingsStore(s => s.themeMode);
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  return (
    <GameThemeContext.Provider value={isDark ? darkGameTheme : lightGameTheme}>
      <CupertinoContext.Provider value={isDark ? cupertinoDark : cupertinoLight}>
        {children}
      </CupertinoContext.Provider>
    </GameThemeContext.Provider>
  );
}

/** 棋盘等游戏专用颜色 */
export const useGameTheme = (): GameTheme => useContext(GameThemeContext);
/** Apple HIG 语义色 */
export const useCupertino = (): CupertinoTheme => useContext(CupertinoContext);

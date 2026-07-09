import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/services/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  themeMode: ThemeMode;
  ttsEnabled: boolean; // 完成单词时自动朗读
  useSystemKeyboard: boolean; // 用系统输入法代替内置小键盘
  setThemeMode: (mode: ThemeMode) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setUseSystemKeyboard: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      themeMode: 'system',
      ttsEnabled: true,
      useSystemKeyboard: false,
      setThemeMode: mode => set({ themeMode: mode }),
      setTtsEnabled: enabled => set({ ttsEnabled: enabled }),
      setUseSystemKeyboard: enabled => set({ useSystemKeyboard: enabled }),
    }),
    {
      name: '@bb_esword_settings',
      version: 1,
      storage: createJSONStorage(() => storage),
    },
  ),
);

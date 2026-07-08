import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/services/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  themeMode: ThemeMode;
  ttsEnabled: boolean; // 完成单词时自动朗读
  setThemeMode: (mode: ThemeMode) => void;
  setTtsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      themeMode: 'system',
      ttsEnabled: true,
      setThemeMode: mode => set({ themeMode: mode }),
      setTtsEnabled: enabled => set({ ttsEnabled: enabled }),
    }),
    {
      name: '@bb_esword_settings',
      version: 1,
      storage: createJSONStorage(() => storage),
    },
  ),
);

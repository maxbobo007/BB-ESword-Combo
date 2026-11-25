import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tense } from '@/conjugation/engine';
import { DEFAULT_TENSES, TENSES } from '@/conjugation/tenses';

const STORAGE_KEY = '@bb_esword_settings';

interface SettingsData {
  tenses: Tense[]; // 变位模式要练的时态
  vosotros: boolean; // 西班牙西语默认包含 vosotros
}

interface SettingsState extends SettingsData {
  loaded: boolean;
  load: () => Promise<void>;
  toggleTense: (tense: Tense) => void;
  setVosotros: (on: boolean) => void;
}

const DEFAULTS: SettingsData = { tenses: DEFAULT_TENSES, vosotros: true };

const persist = (data: SettingsData) =>
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(e =>
    console.error('Failed to save settings:', e)
  );

// 只保留认识的时态，并按 TENSES 的顺序排列
const normalize = (tenses: Tense[]): Tense[] =>
  TENSES.map(t => t.id).filter(id => tenses.includes(id));

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Partial<SettingsData>;
        const tenses = normalize(data.tenses ?? DEFAULTS.tenses);
        set({
          tenses: tenses.length > 0 ? tenses : DEFAULTS.tenses,
          vosotros: data.vosotros ?? DEFAULTS.vosotros,
        });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      set({ loaded: true });
    }
  },

  // 至少保留一个时态
  toggleTense: tense => {
    const { tenses, vosotros } = get();
    const next = tenses.includes(tense) ? tenses.filter(t => t !== tense) : normalize([...tenses, tense]);
    if (next.length === 0) return;
    set({ tenses: next });
    persist({ tenses: next, vosotros });
  },

  setVosotros: on => {
    set({ vosotros: on });
    persist({ tenses: get().tenses, vosotros: on });
  },
}));

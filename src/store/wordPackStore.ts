import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Word, WordPack } from '@/core/types/game';
import { BUILTIN_PACKS } from '@/core/data/words';
import { parsePackText } from '@/core/data/importPack';
import { storage } from '@/services/storage';

interface WordPackState {
  /** 包 ID → 是否启用；缺省视为启用 */
  packEnabled: Record<string, boolean>;
  customPacks: WordPack[];

  togglePack: (id: string) => void;
  importPack: (text: string, name: string) => { ok: boolean; error?: string; count?: number };
  removeCustomPack: (id: string) => void;
}

export const useWordPackStore = create<WordPackState>()(
  persist(
    (set, get) => ({
      packEnabled: {},
      customPacks: [],

      togglePack: id => {
        const { packEnabled } = get();
        const current = packEnabled[id] ?? true;
        set({ packEnabled: { ...packEnabled, [id]: !current } });
      },

      importPack: (text, name) => {
        const id = `custom_${Date.now()}`;
        const result = parsePackText(text, id, name);
        if (!result.ok) {
          return { ok: false, error: result.error };
        }
        set({ customPacks: [...get().customPacks, result.pack] });
        return { ok: true, count: result.pack.words.length };
      },

      removeCustomPack: id => {
        const { customPacks, packEnabled } = get();
        const rest = { ...packEnabled };
        delete rest[id];
        set({
          customPacks: customPacks.filter(p => p.id !== id),
          packEnabled: rest,
        });
      },
    }),
    {
      name: '@bb_esword_wordpacks',
      version: 1,
      storage: createJSONStorage(() => storage),
    },
  ),
);

export function isPackEnabled(state: WordPackState, id: string): boolean {
  return state.packEnabled[id] ?? true;
}

export function getAllPacks(state: WordPackState): WordPack[] {
  return [...BUILTIN_PACKS, ...state.customPacks];
}

export function getActivePacks(state: WordPackState): WordPack[] {
  return getAllPacks(state).filter(p => isPackEnabled(state, p.id));
}

/** 当前启用的全部单词（自由模式选词的词池） */
export function getActiveWords(state: WordPackState): Word[] {
  return getActivePacks(state).flatMap(p => p.words);
}

export function findPack(state: WordPackState, id: string): WordPack | undefined {
  return getAllPacks(state).find(p => p.id === id);
}

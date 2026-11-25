import {
  LEVEL_PACKS,
  SCENE_PACKS,
  ALL_BUILTIN_WORDS,
  filterWords,
  pickRandomWords,
} from '@/core/data/words';
import { LanguageLevel, WordCategory } from '@/core/types/game';
import { mulberry32 } from '@/core/engine/random';

const LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const CATEGORIES: WordCategory[] = [
  'food',
  'family',
  'travel',
  'work',
  'health',
  'nature',
  'education',
  'sports',
  'technology',
  'culture',
];

describe('内置词库包数据集约束', () => {
  it('6 个等级包 + 8 个场景包', () => {
    expect(LEVEL_PACKS.map(p => p.id)).toEqual(
      LEVELS.map(level => `builtin_${level.toLowerCase()}`),
    );
    expect(SCENE_PACKS).toHaveLength(8);
    for (const pack of [...LEVEL_PACKS, ...SCENE_PACKS]) {
      expect(pack.builtin).toBe(true);
      expect(pack.name.length).toBeGreaterThan(0);
      expect(pack.words.length).toBeGreaterThan(0);
    }
    for (const pack of SCENE_PACKS) {
      expect(pack.id.startsWith('builtin_scene_')).toBe(true);
      expect(pack.words.length).toBeGreaterThanOrEqual(30);
    }
  });

  it('ID 全局唯一', () => {
    const ids = ALL_BUILTIN_WORDS.map(w => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('西语单词为单个小写词，3-12 个字母（适配 15×15 网格）', () => {
    for (const w of ALL_BUILTIN_WORDS) {
      expect(w.spanish).toMatch(/^[a-záéíóúüñ]{3,12}$/);
    }
  });

  it('level/category 合法，每词有英文中文', () => {
    for (const w of ALL_BUILTIN_WORDS) {
      expect(LEVELS).toContain(w.level);
      expect(CATEGORIES).toContain(w.category);
      expect(w.english.length).toBeGreaterThan(0);
      expect(w.chinese.length).toBeGreaterThan(0);
    }
  });

  it('等级包内每个 等级×类别 组合至少 8 个单词', () => {
    const levelWords = LEVEL_PACKS.flatMap(p => p.words);
    for (const level of LEVELS) {
      for (const category of CATEGORIES) {
        const count = filterWords(levelWords, level, category).length;
        expect(`${level}/${category}:${count >= 8 ? 'ok' : count}`).toBe(`${level}/${category}:ok`);
      }
    }
  });

  it('A1/A2 等级包扩充到至少 160 词', () => {
    expect(LEVEL_PACKS[0].words.length).toBeGreaterThanOrEqual(160);
    expect(LEVEL_PACKS[1].words.length).toBeGreaterThanOrEqual(160);
  });

  it('同一包内西语单词不重复', () => {
    for (const pack of [...LEVEL_PACKS, ...SCENE_PACKS]) {
      const words = pack.words.map(w => w.spanish);
      expect(new Set(words).size).toBe(words.length);
    }
  });

  it('pickRandomWords 同种子结果确定', () => {
    const pool = filterWords(ALL_BUILTIN_WORDS, 'A1', 'food');
    const a = pickRandomWords(pool, 8, mulberry32(7));
    const b = pickRandomWords(pool, 8, mulberry32(7));
    expect(a).toEqual(b);
  });
});

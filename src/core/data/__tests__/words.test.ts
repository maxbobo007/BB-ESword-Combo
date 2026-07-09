import { BUILTIN_PACKS, ALL_BUILTIN_WORDS, filterWords, pickRandomWords } from '@/core/data/words';
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
  it('共 6 个内置包，ID 与等级对应', () => {
    expect(BUILTIN_PACKS.map(p => p.id)).toEqual(
      LEVELS.map(level => `builtin_${level.toLowerCase()}`),
    );
    for (const pack of BUILTIN_PACKS) {
      expect(pack.builtin).toBe(true);
      expect(pack.name.length).toBeGreaterThan(0);
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

  it('每个单词都有英文、中文和例句', () => {
    for (const w of ALL_BUILTIN_WORDS) {
      expect(w.english.length).toBeGreaterThan(0);
      expect(w.chinese.length).toBeGreaterThan(0);
      expect(w.exampleSentence && w.exampleSentence.length).toBeGreaterThan(0);
    }
  });

  it('每个 等级×类别 组合至少 8 个单词', () => {
    for (const level of LEVELS) {
      for (const category of CATEGORIES) {
        const count = filterWords(ALL_BUILTIN_WORDS, level, category).length;
        expect(`${level}/${category}:${count >= 8 ? 'ok' : count}`).toBe(`${level}/${category}:ok`);
      }
    }
  });

  it('同一等级内西语单词不重复', () => {
    for (const pack of BUILTIN_PACKS) {
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

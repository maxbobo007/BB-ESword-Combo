import { ALL_WORDS, WORDS_BY_LEVEL, getWords, getRandomWords } from '@/core/data/words';
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

describe('词库数据集约束', () => {
  it('ID 全局唯一', () => {
    const ids = ALL_WORDS.map(w => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('西语单词为单个小写词，3-12 个字母（适配 15×15 网格）', () => {
    for (const w of ALL_WORDS) {
      expect(w.spanish).toMatch(/^[a-záéíóúüñ]{3,12}$/);
    }
  });

  it('每个单词都有英文、中文和例句', () => {
    for (const w of ALL_WORDS) {
      expect(w.english.length).toBeGreaterThan(0);
      expect(w.chinese.length).toBeGreaterThan(0);
      expect(w.exampleSentence && w.exampleSentence.length).toBeGreaterThan(0);
    }
  });

  it('level/category 字段与所在文件和 ID 前缀一致', () => {
    for (const level of LEVELS) {
      for (const w of WORDS_BY_LEVEL[level]) {
        expect(w.level).toBe(level);
        expect(w.id.startsWith(`${level.toLowerCase()}_${w.category}_`)).toBe(true);
      }
    }
  });

  it('每个 等级×类别 组合至少 8 个单词', () => {
    for (const level of LEVELS) {
      for (const category of CATEGORIES) {
        const count = getWords(level, category).length;
        expect(`${level}/${category}:${count >= 8 ? 'ok' : count}`).toBe(`${level}/${category}:ok`);
      }
    }
  });

  it('同一等级内西语单词不重复', () => {
    for (const level of LEVELS) {
      const words = WORDS_BY_LEVEL[level].map(w => w.spanish);
      expect(new Set(words).size).toBe(words.length);
    }
  });

  it('getRandomWords 同种子结果确定', () => {
    const a = getRandomWords(8, 'A1', 'food', mulberry32(7));
    const b = getRandomWords(8, 'A1', 'food', mulberry32(7));
    expect(a).toEqual(b);
  });
});

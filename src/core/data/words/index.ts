import { Word, WordPack, LanguageLevel, WordCategory } from '@/core/types/game';
import { Rng, shuffle } from '@/core/engine/random';

// 内置词库包：JSON 资源（Metro/jest 原生支持），未来可替换为服务器下发
/* eslint-disable @typescript-eslint/no-var-requires */
const RAW_PACKS = [
  require('./packs/a1.json'),
  require('./packs/a2.json'),
  require('./packs/b1.json'),
  require('./packs/b2.json'),
  require('./packs/c1.json'),
  require('./packs/c2.json'),
];
/* eslint-enable @typescript-eslint/no-var-requires */

export const BUILTIN_PACKS: WordPack[] = RAW_PACKS.map(p => ({
  ...(p as Omit<WordPack, 'builtin'>),
  builtin: true,
}));

// 每日挑战固定使用全部内置词（不受包开关影响），保证全球同题
export const ALL_BUILTIN_WORDS: Word[] = BUILTIN_PACKS.flatMap(p => p.words);

// —— 纯函数选词：词池由调用方（启用的词库包）提供 ——

export function filterWords(
  pool: Word[],
  level?: LanguageLevel,
  category?: WordCategory,
): Word[] {
  let words = pool;
  if (level) {
    words = words.filter(word => word.level === level);
  }
  if (category) {
    words = words.filter(word => word.category === category);
  }
  return words;
}

export function countWords(pool: Word[], level?: LanguageLevel, category?: WordCategory): number {
  return filterWords(pool, level, category).length;
}

export function pickRandomWords(pool: Word[], count: number, rng: Rng = Math.random): Word[] {
  return shuffle(pool, rng).slice(0, count);
}

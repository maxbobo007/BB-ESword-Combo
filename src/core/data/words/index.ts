import { Word, LanguageLevel, WordCategory } from '@/core/types/game';
import { Rng, shuffle } from '@/core/engine/random';
import { A1_WORDS } from './a1';
import { A2_WORDS } from './a2';
import { B1_WORDS } from './b1';
import { B2_WORDS } from './b2';
import { C1_WORDS } from './c1';
import { C2_WORDS } from './c2';

export const WORDS_BY_LEVEL: Record<LanguageLevel, Word[]> = {
  A1: A1_WORDS,
  A2: A2_WORDS,
  B1: B1_WORDS,
  B2: B2_WORDS,
  C1: C1_WORDS,
  C2: C2_WORDS,
};

export const ALL_WORDS: Word[] = Object.values(WORDS_BY_LEVEL).flat();

export function getWords(level?: LanguageLevel, category?: WordCategory): Word[] {
  let words = level ? WORDS_BY_LEVEL[level] : ALL_WORDS;
  if (category) {
    words = words.filter(word => word.category === category);
  }
  return words;
}

export function getWordCount(level?: LanguageLevel, category?: WordCategory): number {
  return getWords(level, category).length;
}

export function getRandomWords(
  count: number,
  level?: LanguageLevel,
  category?: WordCategory,
  rng: Rng = Math.random,
): Word[] {
  return shuffle(getWords(level, category), rng).slice(0, count);
}

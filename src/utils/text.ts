import type { Difficulty } from '../types/game';

const COMBINING_MARKS = /[̀-ͯ]/g;

/** 转成大写的西语字母（按西语规则处理大小写）。 */
export const toSpanishUpper = (text: string): string => text.toLocaleUpperCase('es-ES');

/**
 * 去掉重音，但保留 Ñ（Ñ 在西语里是独立字母，不是 N 加符号）。
 * Á → A, É → E, Ü → U, Ñ → Ñ
 */
export const baseLetter = (letter: string): string => {
  const upper = toSpanishUpper(letter);
  if (upper === 'Ñ') return 'Ñ';
  return upper.normalize('NFD').replace(COMBINING_MARKS, '');
};

/** 困难模式要求精确输入重音；简单、中等模式输入 E 也算 É 正确。 */
export const isStrictAccents = (difficulty: Difficulty): boolean => difficulty === 'hard';

export const lettersMatch = (input: string, correct: string, strict: boolean): boolean => {
  if (!input || !correct) return false;
  const a = toSpanishUpper(input);
  const b = toSpanishUpper(correct);
  return strict ? a === b : baseLetter(a) === baseLetter(b);
};

/** 拆成网格用的字母数组（按 Unicode 码点拆，保证 É、Ñ 各占一格）。 */
export const toGridLetters = (word: string): string[] =>
  Array.from(toSpanishUpper(word.normalize('NFC')));

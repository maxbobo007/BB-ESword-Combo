// 把西语单词转成填字用的大写字母：去掉重音（á→A, ü→U），保留 Ñ。
// Crossword letters: strip accents (á→A, ü→U) but keep Ñ as its own letter.
export const normalizeLetter = (ch: string): string => {
  const upper = ch.toUpperCase();
  if (upper === 'Ñ') return 'Ñ';
  return upper.normalize('NFD').replace(/[̀-ͯ]/g, '');
};

export const normalizeWord = (word: string): string =>
  Array.from(word).map(normalizeLetter).join('');

export const SPANISH_ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

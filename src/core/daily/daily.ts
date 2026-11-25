import { CrosswordPuzzle } from '@/core/types/game';
import { PuzzleGenerator } from '@/core/engine/puzzleGenerator';
import { normalizeWord } from '@/core/engine/normalize';
import { hashSeed, mulberry32, shuffle } from '@/core/engine/random';
import { ALL_BUILTIN_WORDS } from '@/core/data/words';

export const DAILY_PUZZLE_PREFIX = 'daily_';

// 同一天生成的谜题完全一致：选词、布局、提示字母全部由日期种子驱动
export function getDailyPuzzle(dateStr: string): CrosswordPuzzle {
  const rng = mulberry32(hashSeed(`bbesword-daily-${dateStr}`));
  const pool = ALL_BUILTIN_WORDS.filter(w => normalizeWord(w.spanish).length <= 10);
  const words = shuffle(pool, rng).slice(0, 12);
  return new PuzzleGenerator(15, rng).generatePuzzle(words, 'medium', `${DAILY_PUZZLE_PREFIX}${dateStr}`);
}

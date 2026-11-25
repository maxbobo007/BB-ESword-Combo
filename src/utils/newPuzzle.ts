import { getRandomWords, MIN_WORDS_PER_PUZZLE } from '@/data/words';
import { GameSettings } from '@/types/game';
import { PuzzleGenerator } from '@/utils/puzzleGenerator';

// 按设置抽词并生成关卡；窄屏用小一点的网格，保证格子不小于可点击下限
export const generateForSettings = (settings: GameSettings, narrow: boolean) => {
  const words = getRandomWords(8, settings.level, settings.category);
  if (words.length < MIN_WORDS_PER_PUZZLE) return null;
  return new PuzzleGenerator(narrow ? 13 : 15).generatePuzzle(words, {
    difficulty: settings.difficulty,
  });
};

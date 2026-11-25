import { getTopicWords, MIN_WORDS_PER_PUZZLE, shuffle } from '@/data/words';
import { BoardSize, CrosswordPuzzle, GameSettings } from '@/types/game';
import { PuzzleGenerator } from '@/utils/puzzleGenerator';

// 棋盘越大，放的词越多
export const BOARD_SIZES: { size: BoardSize; label: string; maxWords: number }[] = [
  { size: 7, label: '小', maxWords: 6 },
  { size: 9, label: '中', maxWords: 9 },
  { size: 11, label: '大', maxWords: 13 },
];

// 只用所选主题的词，在正方形棋盘上尽量多放。
// 放词顺序对结果影响很大，所以多试几种顺序，留下放词最多的那个棋盘。
const ATTEMPTS = 12;

export const generateForSettings = (settings: GameSettings) => {
  const pool = getTopicWords(settings.mode, settings.level, settings.topic);
  if (pool.length < MIN_WORDS_PER_PUZZLE) return null;
  const board = BOARD_SIZES.find(b => b.size === settings.boardSize) ?? BOARD_SIZES[1];

  let best: CrosswordPuzzle | null = null;
  for (let i = 0; i < ATTEMPTS; i++) {
    const puzzle = new PuzzleGenerator(board.size).generatePuzzle([], {
      difficulty: settings.difficulty,
      square: true,
      fillers: shuffle(pool),
      maxWords: board.maxWords,
    });
    if (!best || puzzle.words.length > best.words.length) best = puzzle;
    if (best.words.length >= board.maxWords) break;
  }
  return best;
};

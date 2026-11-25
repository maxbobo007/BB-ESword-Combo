import { CrosswordPuzzle } from '@/core/types/game';

export interface GameResult {
  score: number;
  accuracy: number; // 0-100
  timeTaken: number; // 秒
}

export function computeGameResult(
  puzzle: CrosswordPuzzle,
  mistakes: number,
  hintsUsed: number,
  startTime: number,
  endTime: number,
): GameResult {
  const timeTaken = Math.floor((endTime - startTime) / 1000);
  const totalLetters = puzzle.words.reduce((sum, w) => sum + w.wordData.spanish.length, 0);
  const rawAccuracy = totalLetters > 0 ? ((totalLetters - mistakes) / totalLetters) * 100 : 0;
  const accuracy = Math.max(0, Math.min(100, rawAccuracy));
  const score = Math.max(0, Math.floor(1000 - mistakes * 10 - hintsUsed * 20 - timeTaken * 0.5));
  return { score, accuracy, timeTaken };
}

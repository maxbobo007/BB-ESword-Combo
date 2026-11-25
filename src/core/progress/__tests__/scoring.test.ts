import { computeGameResult } from '@/core/progress/scoring';
import { CrosswordPuzzle, Word } from '@/core/types/game';

const word = (id: string, spanish: string): Word => ({
  id,
  spanish,
  english: id,
  chinese: id,
  level: 'A1',
  category: 'food',
});

const puzzle = {
  id: 'p1',
  level: 'A1',
  category: 'food',
  gridSize: 15,
  cells: [],
  difficulty: 'medium',
  estimatedTime: 60,
  words: [
    { id: 'w1', wordData: word('w1', 'agua'), startRow: 0, startCol: 0, direction: 'horizontal', clueNumber: 1, isCompleted: false },
    { id: 'w2', wordData: word('w2', 'pan'), startRow: 0, startCol: 0, direction: 'vertical', clueNumber: 2, isCompleted: false },
  ],
} as unknown as CrosswordPuzzle;

describe('computeGameResult', () => {
  it('零错误零提示满准确率', () => {
    const r = computeGameResult(puzzle, 0, 0, 0, 10_000);
    expect(r.accuracy).toBe(100);
    expect(r.timeTaken).toBe(10);
    expect(r.score).toBe(1000 - 5);
  });

  it('accuracy 钳位不为负', () => {
    const r = computeGameResult(puzzle, 100, 0, 0, 1000);
    expect(r.accuracy).toBe(0);
    expect(r.score).toBeGreaterThanOrEqual(0);
  });

  it('错误与提示扣分', () => {
    const r = computeGameResult(puzzle, 2, 1, 0, 20_000);
    expect(r.score).toBe(1000 - 20 - 20 - 10);
  });
});

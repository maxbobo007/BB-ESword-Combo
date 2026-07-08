import { applyGameCompletion, createDefaultProgress } from '@/store/progressStore';
import { CrosswordPuzzle, Word } from '@/core/types/game';

const word = (id: string): Word => ({
  id,
  spanish: id,
  english: id,
  chinese: id,
  level: 'A1',
  category: 'food',
});

const makePuzzle = (id: string, wordIds: string[]): CrosswordPuzzle =>
  ({
    id,
    level: 'A1',
    category: 'food',
    gridSize: 15,
    cells: [],
    difficulty: 'medium',
    estimatedTime: 60,
    words: wordIds.map((wid, i) => ({
      id: wid,
      wordData: word(wid),
      startRow: 0,
      startCol: 0,
      direction: 'horizontal',
      clueNumber: i + 1,
      isCompleted: true,
    })),
  }) as unknown as CrosswordPuzzle;

const result = { score: 500, accuracy: 90, timeTaken: 60 };

describe('applyGameCompletion', () => {
  it('累计新学单词、总分与局数', () => {
    const p = applyGameCompletion(
      createDefaultProgress(),
      makePuzzle('p1', ['w1', 'w2']),
      result,
      1,
      0,
      '2026-07-08',
    );
    expect(p.wordsLearned).toEqual(['w1', 'w2']);
    expect(p.totalScore).toBe(500);
    expect(p.statistics.totalGamesPlayed).toBe(1);
    expect(p.streak).toBe(1);
    expect(p.lastStudyDate).toBe('2026-07-08');
  });

  it('重复单词不重复计学', () => {
    let p = applyGameCompletion(
      createDefaultProgress(),
      makePuzzle('p1', ['w1', 'w2']),
      result,
      0,
      0,
      '2026-07-08',
    );
    p = applyGameCompletion(p, makePuzzle('p2', ['w2', 'w3']), result, 0, 0, '2026-07-08');
    expect(p.wordsLearned).toEqual(['w1', 'w2', 'w3']);
    expect(p.statistics.totalWordsLearned).toBe(3);
  });

  it('连续两天连击 +1，同天不变', () => {
    let p = applyGameCompletion(
      createDefaultProgress(),
      makePuzzle('p1', ['w1']),
      result,
      0,
      0,
      '2026-07-07',
    );
    p = applyGameCompletion(p, makePuzzle('p2', ['w2']), result, 0, 0, '2026-07-07');
    expect(p.streak).toBe(1);
    p = applyGameCompletion(p, makePuzzle('p3', ['w3']), result, 0, 0, '2026-07-08');
    expect(p.streak).toBe(2);
  });

  it('每日挑战按日期只记一次', () => {
    let p = applyGameCompletion(
      createDefaultProgress(),
      makePuzzle('daily_2026-07-08', ['w1']),
      result,
      0,
      0,
      '2026-07-08',
    );
    p = applyGameCompletion(p, makePuzzle('daily_2026-07-08', ['w2']), result, 0, 0, '2026-07-08');
    expect(p.dailyCompletedDates).toEqual(['2026-07-08']);
  });

  it('零错误零提示记 perfectGames', () => {
    const base = createDefaultProgress();
    const perfect = applyGameCompletion(base, makePuzzle('p1', ['w1']), result, 0, 0, '2026-07-08');
    expect(perfect.statistics.perfectGames).toBe(1);
    const flawed = applyGameCompletion(base, makePuzzle('p1', ['w1']), result, 1, 0, '2026-07-08');
    expect(flawed.statistics.perfectGames).toBe(0);
  });
});

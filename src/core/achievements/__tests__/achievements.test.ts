import { ACHIEVEMENTS } from '@/core/achievements/definitions';
import { getNewlyUnlocked } from '@/core/achievements/evaluate';
import { createDefaultProgress } from '@/store/progressStore';

describe('achievements', () => {
  it('定义 ID 唯一', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('初始进度不解锁任何成就', () => {
    expect(getNewlyUnlocked(createDefaultProgress())).toEqual([]);
  });

  it('首局解锁 first_game', () => {
    const p = createDefaultProgress();
    p.statistics.totalGamesPlayed = 1;
    expect(getNewlyUnlocked(p).map(a => a.id)).toContain('first_game');
  });

  it('已解锁的成就不重复返回', () => {
    const p = createDefaultProgress();
    p.statistics.totalGamesPlayed = 1;
    p.achievements = { first_game: 123 };
    expect(getNewlyUnlocked(p).map(a => a.id)).not.toContain('first_game');
  });

  it('解锁矩阵：各阈值成就按进度触发', () => {
    const p = createDefaultProgress();
    p.statistics.totalGamesPlayed = 5;
    p.statistics.totalWordsLearned = 50;
    p.statistics.perfectGames = 1;
    p.streak = 7;
    p.totalScore = 1200;
    p.dailyCompletedDates = ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05'];
    const ids = getNewlyUnlocked(p).map(a => a.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'first_game',
        'words_10',
        'words_50',
        'streak_3',
        'streak_7',
        'first_daily',
        'daily_5',
        'score_1000',
        'perfect_game',
      ]),
    );
    expect(ids).not.toContain('words_200');
    expect(ids).not.toContain('streak_30');
  });
});

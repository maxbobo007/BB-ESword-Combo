import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProgress, CrosswordPuzzle, AchievementDef } from '@/core/types/game';
import { GameResult } from '@/core/progress/scoring';
import { localDateString, nextStreak } from '@/core/progress/streak';
import { getNewlyUnlocked } from '@/core/achievements/evaluate';
import { storage } from '@/services/storage';

export function createDefaultProgress(): UserProgress {
  return {
    userId: `user_${Date.now()}`,
    wordsLearned: [],
    puzzlesCompleted: [],
    currentLevel: 'A1',
    totalScore: 0,
    streak: 0,
    lastStudyDate: '',
    dailyCompletedDates: [],
    achievements: {},
    statistics: {
      totalGamesPlayed: 0,
      totalWordsLearned: 0,
      averageAccuracy: 0,
      totalTimeSpent: 0,
      perfectGames: 0,
    },
  };
}

// 纯函数便于测试：把一局完成结果合并进用户进度
export function applyGameCompletion(
  progress: UserProgress,
  puzzle: CrosswordPuzzle,
  result: GameResult,
  mistakes: number,
  hintsUsed: number,
  today: string,
): UserProgress {
  const newWordsLearned = puzzle.words
    .map(w => w.wordData.id)
    .filter(id => !progress.wordsLearned.includes(id));
  const games = progress.statistics.totalGamesPlayed;
  const isDaily = puzzle.id.startsWith('daily_');
  const dailyDate = isDaily ? puzzle.id.slice('daily_'.length) : null;

  return {
    ...progress,
    wordsLearned: [...progress.wordsLearned, ...newWordsLearned],
    puzzlesCompleted: progress.puzzlesCompleted.includes(puzzle.id)
      ? progress.puzzlesCompleted
      : [...progress.puzzlesCompleted, puzzle.id],
    totalScore: progress.totalScore + result.score,
    streak: nextStreak(progress.streak, progress.lastStudyDate, today),
    lastStudyDate: today,
    dailyCompletedDates:
      dailyDate && !progress.dailyCompletedDates.includes(dailyDate)
        ? [...progress.dailyCompletedDates, dailyDate]
        : progress.dailyCompletedDates,
    statistics: {
      ...progress.statistics,
      totalGamesPlayed: games + 1,
      totalWordsLearned: progress.statistics.totalWordsLearned + newWordsLearned.length,
      averageAccuracy:
        (progress.statistics.averageAccuracy * games + result.accuracy) / (games + 1),
      totalTimeSpent: progress.statistics.totalTimeSpent + result.timeTaken,
      perfectGames:
        progress.statistics.perfectGames + (mistakes === 0 && hintsUsed === 0 ? 1 : 0),
    },
  };
}

interface ProgressState {
  progress: UserProgress;
  /** 记录一局完成，返回本局新解锁的成就 */
  recordGameCompletion: (
    puzzle: CrosswordPuzzle,
    result: GameResult,
    mistakes: number,
    hintsUsed: number,
  ) => AchievementDef[];
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: createDefaultProgress(),

      recordGameCompletion: (puzzle, result, mistakes, hintsUsed) => {
        const updated = applyGameCompletion(
          get().progress,
          puzzle,
          result,
          mistakes,
          hintsUsed,
          localDateString(),
        );
        const unlocked = getNewlyUnlocked(updated);
        if (unlocked.length > 0) {
          const achievements = { ...updated.achievements };
          for (const def of unlocked) {
            achievements[def.id] = Date.now();
          }
          set({ progress: { ...updated, achievements } });
        } else {
          set({ progress: updated });
        }
        return unlocked;
      },

      resetProgress: () => set({ progress: createDefaultProgress() }),
    }),
    {
      name: '@bb_esword_progress_v2',
      version: 1,
      storage: createJSONStorage(() => storage),
      // 未来结构变更在此 migrate；数据同步可替换 storage 实现或加中间层
      migrate: persisted => persisted as ProgressState,
    },
  ),
);

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSession, UserProgress, CrosswordPuzzle, CrosswordCell } from '@/types/game';

interface GameState {
  currentPuzzle: CrosswordPuzzle | null;
  currentSession: GameSession | null;
  userProgress: UserProgress | null;
  isLoading: boolean;

  // Actions
  startGame: (puzzle: CrosswordPuzzle) => void;
  updateCell: (row: number, col: number, letter: string) => void;
  useHint: () => void;
  checkCompletion: () => void;
  completeGame: () => void;
  loadUserProgress: () => Promise<void>;
  saveUserProgress: () => Promise<void>;
  resetGame: () => void;
}

const STORAGE_KEY = '@bb_esword_progress';

// 去掉重音符号（Á→A、Ü→U），但保留 Ñ，因为 Ñ 在西语里是独立字母
const baseLetter = (ch: string): string => {
  const upper = ch.toUpperCase();
  if (upper === 'Ñ') return upper;
  return upper.normalize('NFD').replace(/[̀-ͯ]/g, '');
};

const isSameLetter = (a: string, b: string): boolean => baseLetter(a) === baseLetter(b);

export const useGameStore = create<GameState>((set, get) => ({
  currentPuzzle: null,
  currentSession: null,
  userProgress: null,
  isLoading: false,

  startGame: (puzzle: CrosswordPuzzle) => {
    const session: GameSession = {
      puzzleId: puzzle.id,
      startTime: Date.now(),
      currentCells: JSON.parse(JSON.stringify(puzzle.cells)),
      hintsUsed: 0,
      mistakes: 0,
      isCompleted: false,
    };

    set({ currentPuzzle: puzzle, currentSession: session });
  },

  updateCell: (row: number, col: number, letter: string) => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle) return;

    const cell = currentSession.currentCells[row][col];

    if (cell.isFixed || !cell.correctLetter) return; // 不能修改提示字母或空白格

    const wasCorrect = cell.letter === cell.correctLetter;
    // 键盘没有重音字母：输入 E 可匹配 É，答对后显示带重音的正确字母
    const input = letter ? letter.toUpperCase() : null;
    const isCorrect = input !== null && isSameLetter(input, cell.correctLetter);
    const newLetter = isCorrect ? cell.correctLetter : input;

    const isMistake = !wasCorrect && !isCorrect && input !== null;

    const cells = currentSession.currentCells.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === col ? { ...c, letter: newLetter } : c)) : r
    );

    set({
      currentSession: {
        ...currentSession,
        currentCells: cells,
        mistakes: currentSession.mistakes + (isMistake ? 1 : 0),
      },
    });

    // 检查是否完成
    get().checkCompletion();
  },

  useHint: () => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle) return;

    const cells = currentSession.currentCells;
    const emptyCells: { row: number; col: number }[] = [];

    for (let row = 0; row < cells.length; row++) {
      for (let col = 0; col < cells[row].length; col++) {
        const cell = cells[row][col];
        if (!cell.isFixed && cell.correctLetter && cell.letter !== cell.correctLetter) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newCells = cells.map((r, ri) =>
        ri === target.row
          ? r.map((c, ci) =>
              ci === target.col ? { ...c, letter: c.correctLetter, isFixed: true } : c
            )
          : r
      );

      set({
        currentSession: {
          ...currentSession,
          currentCells: newCells,
          hintsUsed: currentSession.hintsUsed + 1,
        },
      });

      // 用提示填上最后一格时也要判定通关
      get().checkCompletion();
    }
  },

  checkCompletion: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    const cells = currentSession.currentCells;
    let isCompleted = true;

    for (const row of cells) {
      for (const cell of row) {
        if (cell.correctLetter && cell.letter !== cell.correctLetter) {
          isCompleted = false;
          break;
        }
      }
      if (!isCompleted) break;
    }

    if (isCompleted) {
      get().completeGame();
    }
  },

  completeGame: () => {
    const { currentSession, currentPuzzle, userProgress } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) return;

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - currentSession.startTime) / 1000);
    const accuracy =
      ((currentPuzzle.words.reduce((sum, w) => sum + w.wordData.spanish.length, 0) -
        currentSession.mistakes) /
        currentPuzzle.words.reduce((sum, w) => sum + w.wordData.spanish.length, 0)) *
      100;

    const score = Math.max(
      0,
      Math.floor(
        1000 -
          currentSession.mistakes * 10 -
          currentSession.hintsUsed * 20 -
          timeTaken * 0.5
      )
    );

    const updatedSession: GameSession = {
      ...currentSession,
      endTime,
      isCompleted: true,
      score,
    };

    if (userProgress) {
      const newWordsLearned = currentPuzzle.words
        .map(w => w.wordData.id)
        .filter(id => !userProgress.wordsLearned.includes(id));

      const updatedProgress: UserProgress = {
        ...userProgress,
        wordsLearned: [...userProgress.wordsLearned, ...newWordsLearned],
        puzzlesCompleted: [...userProgress.puzzlesCompleted, currentPuzzle.id],
        totalScore: userProgress.totalScore + score,
        statistics: {
          ...userProgress.statistics,
          totalGamesPlayed: userProgress.statistics.totalGamesPlayed + 1,
          totalWordsLearned:
            userProgress.statistics.totalWordsLearned + newWordsLearned.length,
          averageAccuracy:
            (userProgress.statistics.averageAccuracy *
              userProgress.statistics.totalGamesPlayed +
              accuracy) /
            (userProgress.statistics.totalGamesPlayed + 1),
          totalTimeSpent: userProgress.statistics.totalTimeSpent + timeTaken,
        },
      };

      set({ currentSession: updatedSession, userProgress: updatedProgress });
      get().saveUserProgress();
    } else {
      set({ currentSession: updatedSession });
    }
  },

  loadUserProgress: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const progress: UserProgress = JSON.parse(data);
        set({ userProgress: progress });
      } else {
        const defaultProgress: UserProgress = {
          userId: `user_${Date.now()}`,
          wordsLearned: [],
          puzzlesCompleted: [],
          currentLevel: 'A1',
          totalScore: 0,
          streak: 0,
          lastStudyDate: new Date().toISOString().split('T')[0],
          statistics: {
            totalGamesPlayed: 0,
            totalWordsLearned: 0,
            averageAccuracy: 0,
            totalTimeSpent: 0,
          },
        };
        set({ userProgress: defaultProgress });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProgress));
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveUserProgress: async () => {
    const { userProgress } = get();
    if (!userProgress) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (error) {
      console.error('Failed to save user progress:', error);
    }
  },

  resetGame: () => {
    set({
      currentPuzzle: null,
      currentSession: null,
    });
  },
}));

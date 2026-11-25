import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSession, UserProgress, CrosswordPuzzle, CrosswordCell } from '@/types/game';
import { normalizeLetter } from '@/utils/letters';

interface GameState {
  currentPuzzle: CrosswordPuzzle | null;
  currentSession: GameSession | null;
  userProgress: UserProgress | null;
  isLoading: boolean;

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

const cloneCells = (cells: CrosswordCell[][]): CrosswordCell[][] =>
  cells.map(row => row.map(cell => ({ ...cell, wordIds: [...cell.wordIds] })));

const todayString = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dayDiff = (from: string, to: string) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);

const countLetters = (cells: CrosswordCell[][]) =>
  cells.reduce((sum, row) => sum + row.filter(c => c.correctLetter).length, 0);

const defaultProgress = (): UserProgress => ({
  userId: `user_${Date.now()}`,
  wordsLearned: [],
  puzzlesCompleted: [],
  currentLevel: 'A1',
  totalScore: 0,
  streak: 0,
  lastStudyDate: '',
  statistics: {
    totalGamesPlayed: 0,
    totalWordsLearned: 0,
    averageAccuracy: 0,
    totalTimeSpent: 0,
  },
});

export const useGameStore = create<GameState>((set, get) => ({
  currentPuzzle: null,
  currentSession: null,
  userProgress: null,
  isLoading: false,

  startGame: (puzzle: CrosswordPuzzle) => {
    set({
      currentPuzzle: puzzle,
      currentSession: {
        puzzleId: puzzle.id,
        startTime: Date.now(),
        currentCells: cloneCells(puzzle.cells),
        hintsUsed: 0,
        mistakes: 0,
        isCompleted: false,
      },
    });
  },

  updateCell: (row: number, col: number, letter: string) => {
    const { currentSession } = get();
    if (!currentSession || currentSession.isCompleted) return;

    const target = currentSession.currentCells[row]?.[col];
    if (!target || !target.correctLetter || target.isFixed) return;

    const value = letter ? normalizeLetter(letter) : null;
    const isMistake = value !== null && value !== target.correctLetter;

    const cells = cloneCells(currentSession.currentCells);
    cells[row][col].letter = value;

    set({
      currentSession: {
        ...currentSession,
        currentCells: cells,
        mistakes: currentSession.mistakes + (isMistake ? 1 : 0),
      },
    });

    get().checkCompletion();
  },

  useHint: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.isCompleted) return;

    const open: { row: number; col: number }[] = [];
    currentSession.currentCells.forEach((line, row) =>
      line.forEach((cell, col) => {
        if (!cell.isFixed && cell.correctLetter && cell.letter !== cell.correctLetter) {
          open.push({ row, col });
        }
      })
    );
    if (open.length === 0) return;

    const pick = open[Math.floor(Math.random() * open.length)];
    const cells = cloneCells(currentSession.currentCells);
    cells[pick.row][pick.col].letter = cells[pick.row][pick.col].correctLetter;
    cells[pick.row][pick.col].isFixed = true;

    set({
      currentSession: {
        ...currentSession,
        currentCells: cells,
        hintsUsed: currentSession.hintsUsed + 1,
      },
    });

    get().checkCompletion();
  },

  checkCompletion: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.isCompleted) return;

    const done = currentSession.currentCells.every(line =>
      line.every(cell => !cell.correctLetter || cell.letter === cell.correctLetter)
    );
    if (done) get().completeGame();
  },

  completeGame: () => {
    const { currentSession, currentPuzzle, userProgress } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) return;

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - currentSession.startTime) / 1000);
    const totalLetters = Math.max(1, countLetters(currentSession.currentCells));
    const accuracy = Math.max(0, ((totalLetters - currentSession.mistakes) / totalLetters) * 100);

    const score = Math.max(
      0,
      Math.floor(
        1000 - currentSession.mistakes * 10 - currentSession.hintsUsed * 20 - timeTaken * 0.5
      )
    );

    const updatedSession: GameSession = { ...currentSession, endTime, isCompleted: true, score };

    if (!userProgress) {
      set({ currentSession: updatedSession });
      return;
    }

    const newWords = currentPuzzle.words
      .map(w => w.wordData.id)
      .filter(id => !userProgress.wordsLearned.includes(id));

    // 连续学习天数 (daily streak)
    const today = todayString();
    let streak = userProgress.streak;
    if (!userProgress.lastStudyDate) streak = 1;
    else {
      const gap = dayDiff(userProgress.lastStudyDate, today);
      if (gap === 1) streak += 1;
      else if (gap > 1) streak = 1;
      else if (streak === 0) streak = 1;
    }

    const games = userProgress.statistics.totalGamesPlayed;
    const updatedProgress: UserProgress = {
      ...userProgress,
      wordsLearned: [...userProgress.wordsLearned, ...newWords],
      puzzlesCompleted: [...userProgress.puzzlesCompleted, currentPuzzle.id],
      totalScore: userProgress.totalScore + score,
      streak,
      lastStudyDate: today,
      statistics: {
        totalGamesPlayed: games + 1,
        totalWordsLearned: userProgress.statistics.totalWordsLearned + newWords.length,
        averageAccuracy: (userProgress.statistics.averageAccuracy * games + accuracy) / (games + 1),
        totalTimeSpent: userProgress.statistics.totalTimeSpent + timeTaken,
      },
    };

    set({ currentSession: updatedSession, userProgress: updatedProgress });
    get().saveUserProgress();
  },

  loadUserProgress: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ userProgress: { ...defaultProgress(), ...JSON.parse(data) } });
      } else {
        const progress = defaultProgress();
        set({ userProgress: progress });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
      set({ userProgress: defaultProgress() });
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

  resetGame: () => set({ currentPuzzle: null, currentSession: null }),
}));

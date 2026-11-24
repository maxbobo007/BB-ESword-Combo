import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  GameSession,
  UserProgress,
  CrosswordPuzzle,
  CrosswordCell,
  Difficulty,
  LanguageLevel,
  WordCategory,
} from '../types/game';
import { PuzzleGenerator, getWordCellCoords } from '../utils/puzzleGenerator';
import { getRandomWords, MIN_WORDS_PER_PUZZLE } from '../data/words';
import { isStrictAccents, lettersMatch } from '../utils/text';

export interface GameConfig {
  level: LanguageLevel;
  category: WordCategory;
  difficulty: Difficulty;
}

export interface GameResult {
  score: number;
  accuracy: number;
  timeTaken: number; // 秒
  learnedWordIds: string[]; // 本局没用提示、自己填出来的词
}

interface GameState {
  currentPuzzle: CrosswordPuzzle | null;
  currentSession: GameSession | null;
  lastConfig: GameConfig | null;
  lastResult: GameResult | null;
  userProgress: UserProgress | null;
  isLoading: boolean;

  startNewGame: (config: GameConfig) => boolean;
  startGame: (puzzle: CrosswordPuzzle) => void;
  updateCell: (row: number, col: number, letter: string) => void;
  revealHint: (wordId?: string) => void;
  checkCompletion: () => void;
  completeGame: () => void;
  loadUserProgress: () => Promise<void>;
  saveUserProgress: () => Promise<void>;
  resetGame: () => void;
}

const STORAGE_KEY = '@bb_esword_progress';
const WORDS_PER_PUZZLE = 8;

/** 本地日期 YYYY-MM-DD（不用 toISOString，那是 UTC，会在半夜跨错日期）。 */
export const localDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const yesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateString(d);
};

/** 显示用的连续天数：如果昨天和今天都没学，连续记录已经断了。 */
export const getCurrentStreak = (progress: UserProgress | null): number => {
  if (!progress) return 0;
  const { lastStudyDate, streak } = progress;
  return lastStudyDate === localDateString() || lastStudyDate === yesterdayString() ? streak : 0;
};

const createDefaultProgress = (): UserProgress => ({
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

const cloneCells = (cells: CrosswordCell[][]) => cells.map(row => row.map(cell => ({ ...cell })));

const isSolved = (cell: CrosswordCell) => !cell.correctLetter || cell.letter === cell.correctLetter;

/** 根据当前格子状态，重新标记每个词是否完成。 */
const refreshWordCompletion = (puzzle: CrosswordPuzzle, cells: CrosswordCell[][]): CrosswordPuzzle => ({
  ...puzzle,
  words: puzzle.words.map(w => ({
    ...w,
    isCompleted: getWordCellCoords(w).every(({ row, col }) => isSolved(cells[row][col])),
  })),
});

export const useGameStore = create<GameState>((set, get) => ({
  currentPuzzle: null,
  currentSession: null,
  lastConfig: null,
  lastResult: null,
  userProgress: null,
  isLoading: false,

  startNewGame: (config: GameConfig) => {
    const words = getRandomWords(WORDS_PER_PUZZLE, config.level, config.category);
    if (words.length < MIN_WORDS_PER_PUZZLE) return false;

    const puzzle = new PuzzleGenerator().generatePuzzle(words, config.difficulty);
    if (puzzle.words.length < MIN_WORDS_PER_PUZZLE) return false;

    set({ lastConfig: config });
    get().startGame(puzzle);
    return true;
  },

  startGame: (puzzle: CrosswordPuzzle) => {
    const session: GameSession = {
      puzzleId: puzzle.id,
      startTime: Date.now(),
      currentCells: cloneCells(puzzle.cells),
      hintsUsed: 0,
      mistakes: 0,
      totalEntries: 0,
      hintedWordIds: [],
      isCompleted: false,
    };
    set({ currentPuzzle: puzzle, currentSession: session, lastResult: null });
  },

  updateCell: (row: number, col: number, letter: string) => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) return;

    const target = currentSession.currentCells[row]?.[col];
    if (!target || !target.correctLetter || target.isFixed) return;

    const cells = cloneCells(currentSession.currentCells);
    const cell = cells[row][col];
    let { mistakes, totalEntries } = currentSession;

    if (!letter) {
      cell.letter = null;
    } else {
      const strict = isStrictAccents(currentPuzzle.difficulty);
      const correct = lettersMatch(letter, cell.correctLetter, strict);
      // 宽松模式下输入 E 也算对，但格子里显示带重音的 É，顺便教正确拼写
      cell.letter = correct ? cell.correctLetter : letter.toLocaleUpperCase('es-ES');
      totalEntries++;
      if (!correct) mistakes++;
    }

    set({
      currentPuzzle: refreshWordCompletion(currentPuzzle, cells),
      currentSession: { ...currentSession, currentCells: cells, mistakes, totalEntries },
    });
    get().checkCompletion();
  },

  revealHint: (wordId?: string) => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) return;

    const cells = currentSession.currentCells;
    const unsolved = (coords: { row: number; col: number }[]) =>
      coords.filter(({ row, col }) => !isSolved(cells[row][col]));

    // 优先揭开当前选中单词里的字母
    const word = currentPuzzle.words.find(w => w.id === wordId);
    let candidates = word ? unsolved(getWordCellCoords(word)) : [];
    if (candidates.length === 0) {
      candidates = unsolved(currentPuzzle.words.flatMap(w => getWordCellCoords(w)));
    }
    if (candidates.length === 0) return;

    const { row, col } = candidates[Math.floor(Math.random() * candidates.length)];
    const next = cloneCells(cells);
    const cell = next[row][col];
    cell.letter = cell.correctLetter;
    cell.isFixed = true;

    const hintedWordIds = [...new Set([...currentSession.hintedWordIds, ...cell.wordIds])];

    set({
      currentPuzzle: refreshWordCompletion(currentPuzzle, next),
      currentSession: {
        ...currentSession,
        currentCells: next,
        hintsUsed: currentSession.hintsUsed + 1,
        hintedWordIds,
      },
    });
    get().checkCompletion();
  },

  checkCompletion: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.isCompleted) return;
    if (currentSession.currentCells.every(row => row.every(isSolved))) {
      get().completeGame();
    }
  },

  completeGame: () => {
    const { currentSession, currentPuzzle, userProgress } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) return;

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - currentSession.startTime) / 1000);
    const { mistakes, hintsUsed, totalEntries } = currentSession;
    const accuracy = totalEntries > 0 ? ((totalEntries - mistakes) / totalEntries) * 100 : 100;
    const score = Math.max(0, Math.floor(1000 - mistakes * 10 - hintsUsed * 20 - timeTaken * 0.5));

    // 用过提示的词不算「学会」
    const learnedWordIds = currentPuzzle.words
      .map(w => w.id)
      .filter(id => !currentSession.hintedWordIds.includes(id));

    const result: GameResult = { score, accuracy, timeTaken, learnedWordIds };
    const session: GameSession = { ...currentSession, endTime, isCompleted: true, score };

    const progress = userProgress ?? createDefaultProgress();
    const today = localDateString();
    const streak =
      progress.lastStudyDate === today
        ? Math.max(progress.streak, 1)
        : progress.lastStudyDate === yesterdayString()
          ? progress.streak + 1
          : 1;

    const newWords = learnedWordIds.filter(id => !progress.wordsLearned.includes(id));
    const games = progress.statistics.totalGamesPlayed;

    const updatedProgress: UserProgress = {
      ...progress,
      wordsLearned: [...progress.wordsLearned, ...newWords],
      puzzlesCompleted: [...progress.puzzlesCompleted, currentPuzzle.id],
      totalScore: progress.totalScore + score,
      streak,
      lastStudyDate: today,
      statistics: {
        totalGamesPlayed: games + 1,
        totalWordsLearned: progress.wordsLearned.length + newWords.length,
        averageAccuracy: (progress.statistics.averageAccuracy * games + accuracy) / (games + 1),
        totalTimeSpent: progress.statistics.totalTimeSpent + timeTaken,
      },
    };

    set({ currentSession: session, lastResult: result, userProgress: updatedProgress });
    get().saveUserProgress();
  },

  loadUserProgress: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const defaults = createDefaultProgress();
      if (data) {
        const saved = JSON.parse(data) as Partial<UserProgress>;
        // 和默认值合并，兼容旧版本存下来的数据
        set({
          userProgress: {
            ...defaults,
            ...saved,
            statistics: { ...defaults.statistics, ...saved.statistics },
          },
        });
      } else {
        set({ userProgress: defaults });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
      set({ userProgress: createDefaultProgress() });
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
    set({ currentPuzzle: null, currentSession: null, lastResult: null });
  },
}));

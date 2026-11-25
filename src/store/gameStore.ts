import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CrosswordPuzzle, GameSession, GameSettings, UserProgress } from '@/types/game';
import { isSameLetter } from '@/utils/letters';
import { CellPos, isCellLocked, isWordCorrect, wordCells, wordStatus } from '@/utils/wordState';

interface GameState {
  currentPuzzle: CrosswordPuzzle | null;
  currentSession: GameSession | null;
  currentSettings: GameSettings | null;
  userProgress: UserProgress | null;
  isLoading: boolean;

  // Actions
  startGame: (puzzle: CrosswordPuzzle, settings?: GameSettings) => void;
  updateCell: (row: number, col: number, letter: string) => void;
  // 揭示指定格子；不传则揭示任意一个未答对的格子
  revealHint: (target?: CellPos) => CellPos | null;
  checkCompletion: () => void;
  completeGame: () => void;
  loadUserProgress: () => Promise<void>;
  saveUserProgress: () => Promise<void>;
  resetGame: () => void;
}

const STORAGE_KEY = '@bb_esword_progress';

const replaceCell = <T,>(grid: T[][], row: number, col: number, next: T) =>
  grid.map((r, ri) => (ri === row ? r.map((c, ci) => (ci === col ? next : c)) : r));

export const useGameStore = create<GameState>((set, get) => ({
  currentPuzzle: null,
  currentSession: null,
  currentSettings: null,
  userProgress: null,
  isLoading: false,

  startGame: (puzzle, settings) => {
    const session: GameSession = {
      puzzleId: puzzle.id,
      startTime: Date.now(),
      currentCells: JSON.parse(JSON.stringify(puzzle.cells)),
      hintsUsed: 0,
      mistakes: 0,
      wrongWordIds: [],
      hintedWordIds: [],
      isCompleted: false,
    };

    set({
      currentPuzzle: puzzle,
      currentSession: session,
      currentSettings: settings ?? get().currentSettings,
    });
  },

  updateCell: (row, col, letter) => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) return;

    const before = currentSession.currentCells;
    const cell = before[row][col];
    if (!cell.correctLetter || isCellLocked(before, currentPuzzle.words, { row, col })) return;

    // 键盘没有重音字母：输入 E 可匹配 É，答对后显示带重音的正确字母
    const input = letter ? letter.toUpperCase() : null;
    const newLetter = input !== null && isSameLetter(input, cell.correctLetter) ? cell.correctLetter : input;
    if (newLetter === cell.letter) return;

    const cells = replaceCell(before, row, col, { ...cell, letter: newLetter });

    // 不逐字判错：只有当一个单词刚好被填满且不正确时，才按错误字母数计错
    let mistakes = currentSession.mistakes;
    const wrongWordIds = [...currentSession.wrongWordIds];
    for (const word of currentPuzzle.words) {
      if (!cell.wordIds.includes(word.id)) continue;
      if (wordStatus(cells, word) === 'wrong') {
        mistakes += wordCells(word).filter(
          p => cells[p.row][p.col].letter !== cells[p.row][p.col].correctLetter
        ).length;
        if (!wrongWordIds.includes(word.id)) wrongWordIds.push(word.id);
      }
    }

    set({ currentSession: { ...currentSession, currentCells: cells, mistakes, wrongWordIds } });
    get().checkCompletion();
  },

  revealHint: target => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) return null;
    const cells = currentSession.currentCells;

    const canReveal = (p: CellPos) => {
      const c = cells[p.row]?.[p.col];
      return !!c && !!c.correctLetter && !c.isFixed && c.letter !== c.correctLetter;
    };

    let pos: CellPos | null = target && canReveal(target) ? target : null;
    if (!pos && !target) {
      const candidates = cells.flat().filter(c => canReveal(c));
      if (candidates.length > 0) {
        const c = candidates[Math.floor(Math.random() * candidates.length)];
        pos = { row: c.row, col: c.col };
      }
    }
    if (!pos) return null;

    const cell = cells[pos.row][pos.col];
    const newCells = replaceCell(cells, pos.row, pos.col, {
      ...cell,
      letter: cell.correctLetter,
      isFixed: true,
      revealed: true,
    });
    const hintedWordIds = [...new Set([...currentSession.hintedWordIds, ...cell.wordIds])];

    set({
      currentSession: {
        ...currentSession,
        currentCells: newCells,
        hintsUsed: currentSession.hintsUsed + 1,
        hintedWordIds,
      },
    });

    // 用提示填上最后一格时也要判定通关
    get().checkCompletion();
    return pos;
  },

  checkCompletion: () => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle) return;
    if (currentPuzzle.words.every(w => isWordCorrect(currentSession.currentCells, w))) {
      get().completeGame();
    }
  },

  completeGame: () => {
    const { currentSession, currentPuzzle, userProgress } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) return;

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - currentSession.startTime) / 1000);
    // 每个字母格只算一次（交叉格不重复计算）
    const totalLetters = currentSession.currentCells
      .flat()
      .filter(cell => cell.correctLetter).length;
    const accuracy =
      totalLetters > 0
        ? (Math.max(0, totalLetters - currentSession.mistakes) / totalLetters) * 100
        : 0;

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
      accuracy: Math.round(accuracy),
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

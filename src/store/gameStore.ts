import { create } from 'zustand';
import { GameSession, CrosswordPuzzle, CrosswordWord } from '@/core/types/game';
import { computeGameResult } from '@/core/progress/scoring';
import { useProgressStore } from '@/store/progressStore';

// 游戏进行中的临时状态：不持久化，退出即清空。
interface GameState {
  currentPuzzle: CrosswordPuzzle | null;
  currentSession: GameSession | null;
  recentlyCompletedWord: CrosswordWord | null; // 刚填完的单词（UI 用于展示带重音原词/朗读）

  startGame: (puzzle: CrosswordPuzzle) => void;
  updateCell: (row: number, col: number, letter: string) => void;
  /** 内部：重算包含指定格子的单词完成状态 */
  refreshWordCompletion: (row: number, col: number) => void;
  useHint: () => void;
  checkCompletion: () => void;
  completeGame: () => void;
  clearRecentlyCompletedWord: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentPuzzle: null,
  currentSession: null,
  recentlyCompletedWord: null,

  startGame: (puzzle: CrosswordPuzzle) => {
    const session: GameSession = {
      puzzleId: puzzle.id,
      startTime: Date.now(),
      currentCells: JSON.parse(JSON.stringify(puzzle.cells)),
      hintsUsed: 0,
      mistakes: 0,
      isCompleted: false,
    };
    set({ currentPuzzle: puzzle, currentSession: session, recentlyCompletedWord: null });
  },

  updateCell: (row: number, col: number, letter: string) => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) {
      return;
    }

    const cells = currentSession.currentCells;
    const cell = cells[row][col];
    if (cell.isFixed) {
      return; // 不能修改提示字母
    }

    const prevLetter = cell.letter;
    const wasWrong = prevLetter !== null && prevLetter !== '' && prevLetter !== cell.correctLetter;
    cell.letter = letter ? letter.toUpperCase() : null;
    const isCorrect = cell.letter === cell.correctLetter;

    // 只在 空→错 / 对→错 时计一次错误；在错误字母上反复改键不重复累计
    if (letter && !isCorrect && !wasWrong) {
      currentSession.mistakes++;
    }

    set({
      currentSession: { ...currentSession, currentCells: cells },
    });

    get().refreshWordCompletion(row, col);
    get().checkCompletion();
  },

  // 内部：重算包含 (row, col) 的单词的完成状态，捕获"刚完成"事件
  refreshWordCompletion(row: number, col: number) {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle) {
      return;
    }

    const cellWordIds = currentSession.currentCells[row][col].wordIds;
    let completed: CrosswordWord | null = null;

    const words = currentPuzzle.words.map(word => {
      if (!cellWordIds.includes(word.id)) {
        return word;
      }
      const dr = word.direction === 'vertical' ? 1 : 0;
      const dc = word.direction === 'horizontal' ? 1 : 0;
      const len = word.wordData.spanish.length;
      let isCompleted = true;
      for (let i = 0; i < len; i++) {
        const c = currentSession.currentCells[word.startRow + dr * i][word.startCol + dc * i];
        if (c.letter !== c.correctLetter) {
          isCompleted = false;
          break;
        }
      }
      if (isCompleted && !word.isCompleted) {
        completed = { ...word, isCompleted };
      }
      return word.isCompleted === isCompleted ? word : { ...word, isCompleted };
    });

    set({
      currentPuzzle: { ...currentPuzzle, words },
      ...(completed ? { recentlyCompletedWord: completed } : {}),
    });
  },

  useHint: () => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) {
      return;
    }

    const cells = currentSession.currentCells;
    const wrongCells: { row: number; col: number }[] = [];
    for (const rowCells of cells) {
      for (const cell of rowCells) {
        if (!cell.isFixed && cell.correctLetter && cell.letter !== cell.correctLetter) {
          wrongCells.push({ row: cell.row, col: cell.col });
        }
      }
    }
    if (wrongCells.length === 0) {
      return;
    }

    const target = wrongCells[Math.floor(Math.random() * wrongCells.length)];
    const cell = cells[target.row][target.col];
    cell.letter = cell.correctLetter;
    cell.isFixed = true;

    set({
      currentSession: {
        ...currentSession,
        currentCells: cells,
        hintsUsed: currentSession.hintsUsed + 1,
      },
    });

    get().refreshWordCompletion(target.row, target.col);
    get().checkCompletion();
  },

  checkCompletion: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.isCompleted) {
      return;
    }

    for (const row of currentSession.currentCells) {
      for (const cell of row) {
        if (cell.correctLetter && cell.letter !== cell.correctLetter) {
          return;
        }
      }
    }
    get().completeGame();
  },

  completeGame: () => {
    const { currentSession, currentPuzzle } = get();
    if (!currentSession || !currentPuzzle || currentSession.isCompleted) {
      return;
    }

    const endTime = Date.now();
    const result = computeGameResult(
      currentPuzzle,
      currentSession.mistakes,
      currentSession.hintsUsed,
      currentSession.startTime,
      endTime,
    );

    set({
      currentSession: {
        ...currentSession,
        endTime,
        isCompleted: true,
        score: result.score,
      },
    });

    useProgressStore
      .getState()
      .recordGameCompletion(
        currentPuzzle,
        result,
        currentSession.mistakes,
        currentSession.hintsUsed,
      );
  },

  clearRecentlyCompletedWord: () => set({ recentlyCompletedWord: null }),

  resetGame: () => {
    set({ currentPuzzle: null, currentSession: null, recentlyCompletedWord: null });
  },
}));

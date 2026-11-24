import type {
  Word,
  CrosswordPuzzle,
  CrosswordWord,
  CrosswordCell,
  Difficulty,
  Direction,
} from '../types/game';
import { toGridLetters } from './text';

interface Placement {
  word: Word;
  letters: string[];
  row: number;
  col: number;
  direction: Direction;
}

interface Layout {
  placements: Placement[];
  unplaced: Word[];
  intersections: number;
}

interface Spot {
  row: number;
  col: number;
  direction: Direction;
  crossings: number;
}

interface BoardCell {
  letter: string;
  horizontal: boolean; // 是否已被横向单词占用
  vertical: boolean; // 是否已被纵向单词占用
}

export interface GeneratorOptions {
  /** 网格最大列数（手机屏幕宽度有限） */
  maxCols?: number;
  /** 网格最大行数 */
  maxRows?: number;
  /** 尝试多少种布局，取最好的一种 */
  attempts?: number;
  /** 随机数函数，测试时可注入固定种子 */
  random?: () => number;
}

const HINT_RATIO: Record<Difficulty, number> = { easy: 0.4, medium: 0.25, hard: 0.15 };

const key = (row: number, col: number) => `${row},${col}`;
const step = (direction: Direction) =>
  direction === 'horizontal' ? { dr: 0, dc: 1 } : { dr: 1, dc: 0 };

/** 单次布局尝试：在一个无边界的稀疏棋盘上逐个放词。 */
class Board {
  cells = new Map<string, BoardCell>();
  placements: Placement[] = [];
  intersections = 0;
  minRow = 0;
  maxRow = -1;
  minCol = 0;
  maxCol = -1;

  constructor(private maxRows: number, private maxCols: number) {}

  get(row: number, col: number) {
    return this.cells.get(key(row, col));
  }

  /** 检查能否放置；能放返回交叉数，不能放返回 -1。 */
  score(letters: string[], row: number, col: number, direction: Direction): number {
    const { dr, dc } = step(direction);
    const len = letters.length;

    // 单词首尾外侧必须是空格，否则会和别的词连成一串
    if (this.get(row - dr, col - dc) || this.get(row + dr * len, col + dc * len)) return -1;

    // 裁剪后的网格不能超出手机能显示的大小
    if (this.placements.length > 0) {
      const minRow = Math.min(this.minRow, row);
      const minCol = Math.min(this.minCol, col);
      const maxRow = Math.max(this.maxRow, row + dr * (len - 1));
      const maxCol = Math.max(this.maxCol, col + dc * (len - 1));
      if (maxRow - minRow + 1 > this.maxRows || maxCol - minCol + 1 > this.maxCols) return -1;
    }

    let crossings = 0;
    for (let i = 0; i < len; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const cell = this.get(r, c);

      if (cell) {
        if (cell.letter !== letters[i]) return -1;
        if (direction === 'horizontal' ? cell.horizontal : cell.vertical) return -1;
        crossings++;
      } else {
        // 空格两侧（垂直方向）必须为空，避免和平行的词贴在一起
        const sideA = this.get(r - dc, c - dr);
        const sideB = this.get(r + dc, c + dr);
        if (sideA || sideB) return -1;
      }
    }

    if (this.placements.length > 0 && crossings === 0) return -1; // 必须和已有单词交叉
    if (crossings === len) return -1; // 完全重叠没有意义
    return crossings;
  }

  place(word: Word, letters: string[], row: number, col: number, direction: Direction, crossings: number) {
    const { dr, dc } = step(direction);
    letters.forEach((letter, i) => {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = this.get(r, c);
      const cell: BoardCell = existing ?? { letter, horizontal: false, vertical: false };
      if (direction === 'horizontal') cell.horizontal = true;
      else cell.vertical = true;
      this.cells.set(key(r, c), cell);
    });

    const endRow = row + dr * (letters.length - 1);
    const endCol = col + dc * (letters.length - 1);
    if (this.placements.length === 0) {
      [this.minRow, this.maxRow, this.minCol, this.maxCol] = [row, endRow, col, endCol];
    } else {
      this.minRow = Math.min(this.minRow, row);
      this.maxRow = Math.max(this.maxRow, endRow);
      this.minCol = Math.min(this.minCol, col);
      this.maxCol = Math.max(this.maxCol, endCol);
    }
    this.placements.push({ word, letters, row, col, direction });
    this.intersections += crossings;
  }

  /** 找出这个词所有合法位置中交叉最多的一个。 */
  bestPlacement(letters: string[], random: () => number): Spot | null {
    let best: Spot | null = null;
    let ties = 0;

    for (const [cellKey, cell] of this.cells) {
      const [r, c] = cellKey.split(',').map(Number);
      for (let i = 0; i < letters.length; i++) {
        if (letters[i] !== cell.letter) continue;
        const options: Omit<Spot, 'crossings'>[] = [];
        if (!cell.horizontal) options.push({ direction: 'horizontal', row: r, col: c - i });
        if (!cell.vertical) options.push({ direction: 'vertical', row: r - i, col: c });

        for (const opt of options) {
          const crossings = this.score(letters, opt.row, opt.col, opt.direction);
          if (crossings < 0) continue;
          if (!best || crossings > best.crossings) {
            best = { ...opt, crossings };
            ties = 1;
          } else if (crossings === best.crossings) {
            // 同分时随机选一个（蓄水池抽样），让每局布局不一样
            ties++;
            if (random() < 1 / ties) best = { ...opt, crossings };
          }
        }
      }
    }
    return best;
  }
}

export class PuzzleGenerator {
  private maxRows: number;
  private maxCols: number;
  private attempts: number;
  private random: () => number;

  constructor(options: GeneratorOptions = {}) {
    this.maxRows = options.maxRows ?? 13;
    this.maxCols = options.maxCols ?? 11;
    this.attempts = options.attempts ?? 40;
    this.random = options.random ?? Math.random;
  }

  generatePuzzle(words: Word[], difficulty: Difficulty = 'medium'): CrosswordPuzzle {
    const usable = words.filter(w => toGridLetters(w.spanish).length >= 2);

    let best: Layout | null = null;
    for (let i = 0; i < this.attempts; i++) {
      const layout = this.tryLayout(usable);
      if (!best || this.isBetter(layout, best)) best = layout;
      if (best.unplaced.length === 0 && i >= this.attempts / 4) break;
    }
    const layout = best ?? { placements: [], unplaced: usable, intersections: 0 };

    return this.buildPuzzle(layout, words, difficulty);
  }

  private isBetter(a: Layout, b: Layout) {
    if (a.placements.length !== b.placements.length) return a.placements.length > b.placements.length;
    return a.intersections > b.intersections;
  }

  private shuffle<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private tryLayout(words: Word[]): Layout {
    const board = new Board(this.maxRows, this.maxCols);
    // 打乱后再按长度排序：长词优先，同长度的顺序随机
    const queue = this.shuffle(words)
      .map(word => ({ word, letters: toGridLetters(word.spanish) }))
      .sort((a, b) => b.letters.length - a.letters.length);

    const first = queue.shift();
    if (!first) return { placements: [], unplaced: [], intersections: 0 };
    if (first.letters.length > this.maxCols) {
      return { placements: [], unplaced: words, intersections: 0 };
    }
    board.place(first.word, first.letters, 0, 0, 'horizontal', 0);

    // 放不进去的词留到后面再试一轮（别的词放好后可能出现新的交叉点）
    let pending = queue;
    for (let pass = 0; pass < 2 && pending.length > 0; pass++) {
      const remaining: typeof queue = [];
      for (const item of pending) {
        const spot = board.bestPlacement(item.letters, this.random);
        if (spot) board.place(item.word, item.letters, spot.row, spot.col, spot.direction, spot.crossings);
        else remaining.push(item);
      }
      pending = remaining;
    }

    // 把坐标平移到从 (0,0) 开始
    const placements = board.placements.map(p => ({
      ...p,
      row: p.row - board.minRow,
      col: p.col - board.minCol,
    }));
    return {
      placements,
      unplaced: pending.map(p => p.word),
      intersections: board.intersections,
    };
  }

  private buildPuzzle(layout: Layout, words: Word[], difficulty: Difficulty): CrosswordPuzzle {
    const rows = layout.placements.reduce(
      (m, p) => Math.max(m, p.row + (p.direction === 'vertical' ? p.letters.length : 1)),
      0
    );
    const cols = layout.placements.reduce(
      (m, p) => Math.max(m, p.col + (p.direction === 'horizontal' ? p.letters.length : 1)),
      0
    );

    const cells: CrosswordCell[][] = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({
        row,
        col,
        letter: null,
        correctLetter: '',
        isFixed: false,
        wordIds: [],
      }))
    );

    for (const p of layout.placements) {
      const { dr, dc } = step(p.direction);
      p.letters.forEach((letter, i) => {
        const cell = cells[p.row + dr * i][p.col + dc * i];
        cell.correctLetter = letter;
        cell.wordIds.push(p.word.id);
      });
    }

    // 标准填字编号：从上到下、从左到右；横竖起点相同的共用一个编号
    const starts = [...new Set(layout.placements.map(p => key(p.row, p.col)))]
      .map(k => k.split(',').map(Number))
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const numberAt = new Map(starts.map(([r, c], i) => [key(r, c), i + 1]));

    const crosswordWords: CrosswordWord[] = layout.placements
      .map(p => ({
        id: p.word.id,
        wordData: p.word,
        startRow: p.row,
        startCol: p.col,
        direction: p.direction,
        clueNumber: numberAt.get(key(p.row, p.col)) ?? 0,
        isCompleted: false,
      }))
      .sort((a, b) => a.clueNumber - b.clueNumber);

    this.addHintLetters(cells, crosswordWords, difficulty);

    return {
      id: `puzzle_${Date.now()}`,
      level: words[0]?.level ?? 'A1',
      category: words[0]?.category ?? 'food',
      rows,
      cols,
      words: crosswordWords,
      cells,
      difficulty,
      unplacedWordIds: layout.unplaced.map(w => w.id),
      estimatedTime: this.estimateCompletionTime(crosswordWords, difficulty),
    };
  }

  private wordCells(cells: CrosswordCell[][], w: CrosswordWord) {
    const { dr, dc } = step(w.direction);
    const len = toGridLetters(w.wordData.spanish).length;
    return Array.from({ length: len }, (_, i) => cells[w.startRow + dr * i][w.startCol + dc * i]);
  }

  private addHintLetters(cells: CrosswordCell[][], words: CrosswordWord[], difficulty: Difficulty) {
    const ratio = HINT_RATIO[difficulty];

    for (const w of words) {
      const wordCells = this.wordCells(cells, w);
      const count = Math.max(1, Math.floor(wordCells.length * ratio));
      for (const cell of this.shuffle(wordCells).slice(0, count)) {
        cell.isFixed = true;
        cell.letter = cell.correctLetter;
      }
    }

    // 交叉格可能让某个词的字母全被揭开，至少留一格给玩家填
    for (const w of words) {
      const wordCells = this.wordCells(cells, w);
      if (wordCells.every(c => c.isFixed)) {
        const cell = wordCells[Math.floor(this.random() * wordCells.length)];
        cell.isFixed = false;
        cell.letter = null;
      }
    }
  }

  private estimateCompletionTime(words: CrosswordWord[], difficulty: Difficulty): number {
    const totalLetters = words.reduce((sum, w) => sum + toGridLetters(w.wordData.spanish).length, 0);
    const multiplier = difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1.0 : 1.3;
    return Math.floor(totalLetters * 3 * multiplier);
  }
}

/** 返回某个单词在网格中占用的坐标。 */
export const getWordCellCoords = (w: CrosswordWord) => {
  const { dr, dc } = step(w.direction);
  const len = toGridLetters(w.wordData.spanish).length;
  return Array.from({ length: len }, (_, i) => ({ row: w.startRow + dr * i, col: w.startCol + dc * i }));
};

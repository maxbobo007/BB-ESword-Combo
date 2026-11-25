import { CrosswordCell, CrosswordPuzzle, CrosswordWord, Word } from '@/types/game';
import { toGridWord } from '@/utils/letters';

type Direction = 'horizontal' | 'vertical';
type Difficulty = 'easy' | 'medium' | 'hard';

interface PlacedWord {
  word: Word;
  letters: string[];
  startRow: number;
  startCol: number;
  direction: Direction;
  clueNumber: number;
}

interface Candidate {
  row: number;
  col: number;
  direction: Direction;
  intersections: number;
}

export interface GenerateOptions {
  difficulty?: Difficulty;
  // 相同的种子 + 相同的词 = 相同的关卡（以后多设备同步同一关时需要）
  seed?: number;
  // 工作网格边长；生成后会裁剪到实际用到的区域
  maxSize?: number;
  // 正方形棋盘：输出固定 maxSize × maxSize，内容居中，不裁剪
  square?: boolean;
  // 补位词：必选词放完后，用这些词尽量把棋盘铺满（不保证全部放入，也不算进 unplacedWords）
  fillers?: Word[];
  // 棋盘上最多放多少个词（含必选词和补位词）
  maxWords?: number;
}

// 小而稳定的伪随机数生成器（mulberry32），保证可复现
export const createRng = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const step = (direction: Direction) => (direction === 'horizontal' ? [0, 1] : [1, 0]);

export class PuzzleGenerator {
  private size: number;
  private grid: string[][] = [];
  // 记录每个格子被哪个方向的单词占用，防止两个同方向单词重叠
  private usedDirections: Set<Direction>[][] = [];
  private placedWords: PlacedWord[] = [];
  private rng: () => number = Math.random;

  constructor(maxSize: number = 15) {
    this.size = maxSize;
  }

  generatePuzzle(words: Word[], options: GenerateOptions | Difficulty = {}): CrosswordPuzzle {
    const opts: GenerateOptions = typeof options === 'string' ? { difficulty: options } : options;
    const difficulty = opts.difficulty ?? 'medium';
    const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
    if (opts.maxSize) this.size = opts.maxSize;

    this.reset(seed);

    // 长词优先放，交叉机会更多；同长度时按随机数打散
    const queue = words
      .map(word => ({ word, letters: toGridWord(word.spanish), r: this.rng() }))
      .filter(item => item.letters.length >= 2)
      .sort((a, b) => b.letters.length - a.letters.length || a.r - b.r);

    const unplaced: Word[] = words.filter(w => toGridWord(w.spanish).length < 2);
    let pending = queue.filter(item => item.letters.length <= this.size);
    unplaced.push(...queue.filter(item => item.letters.length > this.size).map(i => i.word));

    if (pending.length > 0) {
      const first = pending.shift()!;
      const row = Math.floor(this.size / 2);
      const col = Math.floor((this.size - first.letters.length) / 2);
      this.placeAt(first.word, first.letters, row, col, 'horizontal');
    }

    // 多轮尝试：前面放不下的词，可能在别的词放好后找到交叉点
    for (let pass = 0; pass < 3 && pending.length > 0; pass++) {
      const stillPending: typeof pending = [];
      for (const item of pending) {
        const best = this.findBestPlacement(item.letters);
        if (best) {
          this.placeAt(item.word, item.letters, best.row, best.col, best.direction);
        } else {
          stillPending.push(item);
        }
      }
      if (stillPending.length === pending.length) {
        pending = stillPending;
        break;
      }
      pending = stillPending;
    }
    unplaced.push(...pending.map(i => i.word));

    // 用补位词铺满棋盘：打乱后多轮尝试，优先交叉多的位置
    const maxWords = opts.maxWords ?? Infinity;
    const usedIds = new Set(words.map(w => w.id));
    let fillers = (opts.fillers ?? [])
      .filter(w => !usedIds.has(w.id))
      .map(word => ({ word, letters: toGridWord(word.spanish), r: this.rng() }))
      .filter(item => item.letters.length >= 2 && item.letters.length <= this.size)
      .sort((a, b) => a.r - b.r);
    for (let pass = 0; pass < 3 && fillers.length > 0; pass++) {
      const rest: typeof fillers = [];
      for (const item of fillers) {
        if (this.placedWords.length >= maxWords) break;
        if (this.placedWords.length === 0) {
          const row = Math.floor(this.size / 2);
          const col = Math.floor((this.size - item.letters.length) / 2);
          this.placeAt(item.word, item.letters, row, col, 'horizontal');
          continue;
        }
        const best = this.findBestPlacement(item.letters);
        if (best) this.placeAt(item.word, item.letters, best.row, best.col, best.direction);
        else rest.push(item);
      }
      if (rest.length === fillers.length || this.placedWords.length >= maxWords) break;
      fillers = rest;
    }

    const { rows, cols } = opts.square ? this.centerInBoard() : this.cropToContent();
    this.assignClueNumbers();
    const cells = this.buildCells(rows, cols, difficulty);

    const crosswordWords: CrosswordWord[] = this.placedWords.map(pw => ({
      id: pw.word.id,
      wordData: pw.word,
      startRow: pw.startRow,
      startCol: pw.startCol,
      direction: pw.direction,
      clueNumber: pw.clueNumber,
      isCompleted: false,
    }));

    return {
      id: `puzzle_${seed}`,
      level: words[0]?.level || 'A1',
      category: words[0]?.category || 'food',
      rows,
      cols,
      words: crosswordWords,
      unplacedWords: unplaced,
      cells,
      difficulty,
      estimatedTime: this.estimateCompletionTime(crosswordWords, difficulty),
    };
  }

  private reset(seed: number) {
    this.rng = createRng(seed);
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(''));
    this.usedDirections = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => new Set<Direction>())
    );
    this.placedWords = [];
  }

  private inBounds(row: number, col: number) {
    return row >= 0 && col >= 0 && row < this.size && col < this.size;
  }

  private letterAt(row: number, col: number) {
    return this.inBounds(row, col) ? this.grid[row][col] : '';
  }

  // 遍历所有"已有字母 = 新词某个字母"的交叉点，按交叉数选最优位置
  private findBestPlacement(letters: string[]): Candidate | null {
    const candidates: Candidate[] = [];
    const seen = new Set<string>();

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const existing = this.grid[r][c];
        if (!existing) continue;
        for (let i = 0; i < letters.length; i++) {
          if (letters[i] !== existing) continue;
          for (const direction of ['horizontal', 'vertical'] as Direction[]) {
            const [dr, dc] = step(direction);
            const row = r - dr * i;
            const col = c - dc * i;
            const key = `${row},${col},${direction}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const intersections = this.validate(letters, row, col, direction);
            if (intersections > 0) candidates.push({ row, col, direction, intersections });
          }
        }
      }
    }

    if (candidates.length === 0) return null;
    const most = Math.max(...candidates.map(c => c.intersections));
    const best = candidates.filter(c => c.intersections === most);
    return best[Math.floor(this.rng() * best.length)];
  }

  // 按标准填字规则检查位置，合法时返回交叉格数量，不合法返回 0
  private validate(letters: string[], row: number, col: number, direction: Direction): number {
    const [dr, dc] = step(direction);
    const endRow = row + dr * (letters.length - 1);
    const endCol = col + dc * (letters.length - 1);
    if (!this.inBounds(row, col) || !this.inBounds(endRow, endCol)) return 0;

    // 单词前后一格必须为空，否则会和别的字母连成更长的"伪单词"
    if (this.letterAt(row - dr, col - dc) || this.letterAt(endRow + dr, endCol + dc)) return 0;

    let intersections = 0;
    for (let i = 0; i < letters.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = this.grid[r][c];

      if (existing) {
        // 交叉格：字母必须完全一致（É 不和 E 交叉），且不能和同方向单词重叠
        if (existing !== letters[i] || this.usedDirections[r][c].has(direction)) return 0;
        intersections++;
      } else {
        // 新填的格子：垂直方向两侧必须为空，避免贴边形成伪单词
        if (this.letterAt(r + dc, c + dr) || this.letterAt(r - dc, c - dr)) return 0;
      }
    }

    // 所有格子都是交叉格说明完全覆盖了已有单词，也不允许
    if (intersections === letters.length) return 0;
    return intersections;
  }

  private placeAt(word: Word, letters: string[], row: number, col: number, direction: Direction) {
    const [dr, dc] = step(direction);
    letters.forEach((letter, i) => {
      this.grid[row + dr * i][col + dc * i] = letter;
      this.usedDirections[row + dr * i][col + dc * i].add(direction);
    });
    this.placedWords.push({ word, letters, startRow: row, startCol: col, direction, clueNumber: 0 });
  }

  // 裁剪掉四周的空行空列，手机上格子能更大
  private cropToContent(): { rows: number; cols: number } {
    if (this.placedWords.length === 0) {
      this.grid = [];
      return { rows: 0, cols: 0 };
    }
    let minR = this.size, minC = this.size, maxR = -1, maxC = -1;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c]) {
          minR = Math.min(minR, r);
          minC = Math.min(minC, c);
          maxR = Math.max(maxR, r);
          maxC = Math.max(maxC, c);
        }
      }
    }
    this.grid = this.grid.slice(minR, maxR + 1).map(row => row.slice(minC, maxC + 1));
    for (const pw of this.placedWords) {
      pw.startRow -= minR;
      pw.startCol -= minC;
    }
    return { rows: maxR - minR + 1, cols: maxC - minC + 1 };
  }

  // 正方形棋盘：保持 size × size，把内容整体移到正中间
  private centerInBoard(): { rows: number; cols: number } {
    const n = this.size;
    if (this.placedWords.length === 0) return { rows: n, cols: n };
    let minR = n, minC = n, maxR = -1, maxC = -1;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (this.grid[r][c]) {
          minR = Math.min(minR, r);
          minC = Math.min(minC, c);
          maxR = Math.max(maxR, r);
          maxC = Math.max(maxC, c);
        }
      }
    }
    const dr = Math.floor((n - (maxR - minR + 1)) / 2) - minR;
    const dc = Math.floor((n - (maxC - minC + 1)) / 2) - minC;
    const next: string[][] = Array.from({ length: n }, () => Array(n).fill(''));
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) next[r + dr][c + dc] = this.grid[r][c];
    }
    this.grid = next;
    for (const pw of this.placedWords) {
      pw.startRow += dr;
      pw.startCol += dc;
    }
    return { rows: n, cols: n };
  }

  // 按位置编号（从上到下、从左到右），同一起点的横纵单词共用一个编号
  private assignClueNumbers() {
    const starts = [...new Set(this.placedWords.map(pw => `${pw.startRow},${pw.startCol}`))]
      .map(key => key.split(',').map(Number))
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const numberAt = new Map(starts.map(([r, c], i) => [`${r},${c}`, i + 1]));
    for (const pw of this.placedWords) {
      pw.clueNumber = numberAt.get(`${pw.startRow},${pw.startCol}`)!;
    }
  }

  private buildCells(rows: number, cols: number, difficulty: Difficulty): CrosswordCell[][] {
    const cells: CrosswordCell[][] = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({
        row,
        col,
        letter: null,
        correctLetter: this.grid[row][col] || '',
        isFixed: false,
        wordIds: [],
      }))
    );

    for (const pw of this.placedWords) {
      const [dr, dc] = step(pw.direction);
      pw.letters.forEach((_, i) => {
        cells[pw.startRow + dr * i][pw.startCol + dc * i].wordIds.push(pw.word.id);
      });
    }

    this.addHintLetters(cells, difficulty);
    return cells;
  }

  private addHintLetters(cells: CrosswordCell[][], difficulty: Difficulty) {
    const hintRatio = difficulty === 'easy' ? 0.4 : difficulty === 'medium' ? 0.25 : 0.15;

    for (const pw of this.placedWords) {
      const [dr, dc] = step(pw.direction);
      const hintsCount = Math.max(1, Math.floor(pw.letters.length * hintRatio));
      const indices = pw.letters.map((_, i) => i);
      // Fisher–Yates 洗牌，用可复现的随机数
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(this.rng() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      for (const idx of indices.slice(0, hintsCount)) {
        const cell = cells[pw.startRow + dr * idx][pw.startCol + dc * idx];
        cell.isFixed = true;
        cell.letter = cell.correctLetter;
      }
    }
  }

  private estimateCompletionTime(words: CrosswordWord[], difficulty: Difficulty): number {
    const totalLetters = words.reduce((sum, w) => sum + toGridWord(w.wordData.spanish).length, 0);
    const multiplier = difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1.0 : 1.3;
    return Math.floor(totalLetters * 3 * multiplier);
  }
}

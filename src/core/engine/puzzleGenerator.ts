import {
  Word,
  CrosswordPuzzle,
  CrosswordWord,
  CrosswordCell,
  Difficulty,
  Direction,
} from '@/core/types/game';
import { normalizeWord } from '@/core/engine/normalize';
import { Rng, shuffle } from '@/core/engine/random';

interface PlacedWord {
  word: Word;
  normalized: string;
  startRow: number;
  startCol: number;
  direction: Direction;
}

interface Candidate {
  startRow: number;
  startCol: number;
  direction: Direction;
}

const HINT_RATIO: Record<Difficulty, number> = {
  easy: 0.4,
  medium: 0.25,
  hard: 0.15,
};

// 生成器整体运行 GENERATION_ATTEMPTS 次（每次不同的放词顺序），取放入单词最多的布局。
const GENERATION_ATTEMPTS = 10;

export class PuzzleGenerator {
  private grid: string[][] = [];
  private placedWords: PlacedWord[] = [];

  constructor(
    private gridSize: number = 15,
    private rng: Rng = Math.random,
  ) {}

  generatePuzzle(words: Word[], difficulty: Difficulty = 'medium', id?: string): CrosswordPuzzle {
    // 超出网格的单词无法放置，直接排除
    const usable = words.filter(w => normalizeWord(w.spanish).length <= this.gridSize);

    let best: PlacedWord[] = [];
    for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt++) {
      // 第一轮用最长优先（交叉机会最多），之后随机洗牌探索不同布局
      const order =
        attempt === 0
          ? [...usable].sort((a, b) => b.spanish.length - a.spanish.length)
          : shuffle(usable, this.rng);

      this.reset();
      for (const word of order) {
        this.placeWord(word);
      }

      if (this.placedWords.length > best.length) {
        best = this.placedWords;
        if (best.length === usable.length) {
          break; // 全部放下，无需继续尝试
        }
      }
    }

    // 用最优布局重建网格状态
    this.reset();
    for (const pw of best) {
      this.writeToGrid(pw);
    }
    this.placedWords = best;

    const cells = this.generateCells(difficulty);
    const crosswordWords: CrosswordWord[] = this.placedWords.map((pw, index) => ({
      id: pw.word.id,
      wordData: pw.word,
      startRow: pw.startRow,
      startCol: pw.startCol,
      direction: pw.direction,
      clueNumber: index + 1,
      isCompleted: false,
    }));

    return {
      id: id ?? `puzzle_${Date.now()}`,
      level: words[0]?.level || 'A1',
      category: words[0]?.category || 'food',
      gridSize: this.gridSize,
      words: crosswordWords,
      cells,
      difficulty,
      estimatedTime: this.estimateCompletionTime(crosswordWords, difficulty),
    };
  }

  private reset() {
    this.grid = Array(this.gridSize)
      .fill(null)
      .map(() => Array(this.gridSize).fill(''));
    this.placedWords = [];
  }

  private at(row: number, col: number): string {
    if (row < 0 || col < 0 || row >= this.gridSize || col >= this.gridSize) {
      return '';
    }
    return this.grid[row][col];
  }

  // 尝试放置单词：首词水平居中，其余枚举所有合法交叉位置后随机取一个
  private placeWord(word: Word): boolean {
    const normalized = normalizeWord(word.spanish);

    if (this.placedWords.length === 0) {
      const startRow = Math.floor(this.gridSize / 2);
      const startCol = Math.floor((this.gridSize - normalized.length) / 2);
      if (!this.canPlaceWord(normalized, startRow, startCol, 'horizontal', true)) {
        return false;
      }
      this.commitWord(word, normalized, startRow, startCol, 'horizontal');
      return true;
    }

    const candidates: Candidate[] = [];
    for (const placed of this.placedWords) {
      const direction: Direction = placed.direction === 'horizontal' ? 'vertical' : 'horizontal';
      for (let i = 0; i < normalized.length; i++) {
        for (let j = 0; j < placed.normalized.length; j++) {
          if (normalized[i] !== placed.normalized[j]) {
            continue;
          }
          const startRow =
            placed.direction === 'horizontal' ? placed.startRow - i : placed.startRow + j;
          const startCol =
            placed.direction === 'horizontal' ? placed.startCol + j : placed.startCol - i;
          if (this.canPlaceWord(normalized, startRow, startCol, direction)) {
            candidates.push({ startRow, startCol, direction });
          }
        }
      }
    }

    if (candidates.length === 0) {
      return false;
    }
    const pick = candidates[Math.floor(this.rng() * candidates.length)];
    this.commitWord(word, normalized, pick.startRow, pick.startCol, pick.direction);
    return true;
  }

  private canPlaceWord(
    word: string,
    row: number,
    col: number,
    direction: Direction,
    isFirst = false,
  ): boolean {
    const dr = direction === 'vertical' ? 1 : 0;
    const dc = direction === 'horizontal' ? 1 : 0;
    const len = word.length;

    if (row < 0 || col < 0) {
      return false;
    }
    if (row + dr * (len - 1) >= this.gridSize || col + dc * (len - 1) >= this.gridSize) {
      return false;
    }
    // 词首前、词尾后不能紧贴字母（避免拼出计划外的连写）
    if (this.at(row - dr, col - dc) !== '' || this.at(row + dr * len, col + dc * len) !== '') {
      return false;
    }

    let crossings = 0;
    for (let i = 0; i < len; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = this.grid[r][c];
      if (existing !== '') {
        if (existing !== word[i]) {
          return false; // 字母冲突
        }
        crossings++; // 合法交叉
      } else {
        // 非交叉格的垂直方向邻格必须为空，禁止平行单词贴边
        if (this.at(r - dc, c - dr) !== '' || this.at(r + dc, c + dr) !== '') {
          return false;
        }
      }
    }

    return isFirst || crossings > 0;
  }

  private commitWord(
    word: Word,
    normalized: string,
    startRow: number,
    startCol: number,
    direction: Direction,
  ) {
    const placed: PlacedWord = { word, normalized, startRow, startCol, direction };
    this.writeToGrid(placed);
    this.placedWords.push(placed);
  }

  private writeToGrid(pw: PlacedWord) {
    const dr = pw.direction === 'vertical' ? 1 : 0;
    const dc = pw.direction === 'horizontal' ? 1 : 0;
    for (let i = 0; i < pw.normalized.length; i++) {
      this.grid[pw.startRow + dr * i][pw.startCol + dc * i] = pw.normalized[i];
    }
  }

  private generateCells(difficulty: Difficulty): CrosswordCell[][] {
    const cells: CrosswordCell[][] = Array.from({ length: this.gridSize }, (_, row) =>
      Array.from({ length: this.gridSize }, (_, col) => ({
        row,
        col,
        letter: null,
        correctLetter: this.grid[row][col] || '',
        isFixed: false,
        wordIds: this.getWordIdsForCell(row, col),
      })),
    );

    this.addHintLetters(cells, difficulty);
    return cells;
  }

  private getWordIdsForCell(row: number, col: number): string[] {
    const wordIds: string[] = [];
    for (const pw of this.placedWords) {
      const dr = pw.direction === 'vertical' ? 1 : 0;
      const dc = pw.direction === 'horizontal' ? 1 : 0;
      const offset = dr ? row - pw.startRow : col - pw.startCol;
      const fixedMatches = dr ? col === pw.startCol : row === pw.startRow;
      if (fixedMatches && offset >= 0 && offset < pw.normalized.length) {
        wordIds.push(pw.word.id);
      }
    }
    return wordIds;
  }

  private addHintLetters(cells: CrosswordCell[][], difficulty: Difficulty) {
    const hintRatio = HINT_RATIO[difficulty];

    for (const pw of this.placedWords) {
      const wordLength = pw.normalized.length;
      const hintsCount = Math.max(1, Math.floor(wordLength * hintRatio));
      const indices = shuffle(
        Array.from({ length: wordLength }, (_, i) => i),
        this.rng,
      );

      for (const idx of indices.slice(0, hintsCount)) {
        const row = pw.direction === 'horizontal' ? pw.startRow : pw.startRow + idx;
        const col = pw.direction === 'horizontal' ? pw.startCol + idx : pw.startCol;
        cells[row][col].isFixed = true;
        cells[row][col].letter = cells[row][col].correctLetter;
      }
    }
  }

  private estimateCompletionTime(words: CrosswordWord[], difficulty: Difficulty): number {
    const totalLetters = words.reduce((sum, w) => sum + w.wordData.spanish.length, 0);
    const baseTime = totalLetters * 3; // 每个字母3秒
    const difficultyMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1.0 : 1.3;
    return Math.floor(baseTime * difficultyMultiplier);
  }
}

import { Word, CrosswordPuzzle, CrosswordWord, CrosswordCell } from '@/types/game';
import { normalizeWord } from '@/utils/letters';

type Direction = 'horizontal' | 'vertical';
type Difficulty = 'easy' | 'medium' | 'hard';

interface PlacedWord {
  word: Word;
  text: string; // 归一化后的字母 (normalized letters)
  startRow: number;
  startCol: number;
  direction: Direction;
  clueNumber: number;
}

const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export class PuzzleGenerator {
  private gridSize: number;
  private grid: string[][] = [];
  private placedWords: PlacedWord[] = [];

  constructor(gridSize: number = 15) {
    this.gridSize = gridSize;
    this.reset();
  }

  // 生成填字游戏 (generate a crossword)
  generatePuzzle(words: Word[], difficulty: Difficulty = 'medium'): CrosswordPuzzle {
    // 尝试几次，保留放下单词最多的一次 (keep the attempt that places the most words)
    let best: PlacedWord[] = [];
    let bestGrid: string[][] = [];
    for (let attempt = 0; attempt < 8; attempt++) {
      this.reset();
      this.placeAll(words);
      if (this.placedWords.length > best.length) {
        best = this.placedWords;
        bestGrid = this.grid;
      }
      if (best.length === words.length) break;
    }
    this.placedWords = best;
    this.grid = bestGrid;
    this.assignClueNumbers();

    const cells = this.generateCells(difficulty);

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
      id: `puzzle_${Date.now()}`,
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
    this.grid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(''));
    this.placedWords = [];
  }

  private placeAll(words: Word[]) {
    // 长词优先，同长度随机 (longest first, ties shuffled)
    const sorted = shuffle(words)
      .map(w => ({ word: w, text: normalizeWord(w.spanish) }))
      .filter(w => w.text.length > 1 && w.text.length <= this.gridSize)
      .sort((a, b) => b.text.length - a.text.length);

    if (sorted.length === 0) return;

    const first = sorted[0];
    const row = Math.floor(this.gridSize / 2);
    const col = Math.floor((this.gridSize - first.text.length) / 2);
    this.placeWordAt(first.word, first.text, row, col, 'horizontal');

    // 放不下的词再试一轮，因为后放的词可能提供新交叉点
    // Retry leftovers once: later words may create new crossings.
    let pending = sorted.slice(1);
    for (let pass = 0; pass < 2 && pending.length > 0; pass++) {
      pending = pending.filter(w => !this.tryPlace(w.word, w.text));
    }
  }

  // 找到第一个合法交叉位置并放下 (place at the first valid crossing)
  private tryPlace(word: Word, text: string): boolean {
    const candidates: { row: number; col: number; dir: Direction }[] = [];

    for (const placed of this.placedWords) {
      const dir: Direction = placed.direction === 'horizontal' ? 'vertical' : 'horizontal';
      for (let i = 0; i < text.length; i++) {
        for (let j = 0; j < placed.text.length; j++) {
          if (text[i] !== placed.text[j]) continue;
          if (dir === 'vertical') {
            candidates.push({ row: placed.startRow - i, col: placed.startCol + j, dir });
          } else {
            candidates.push({ row: placed.startRow + j, col: placed.startCol - i, dir });
          }
        }
      }
    }

    for (const c of shuffle(candidates)) {
      if (this.canPlaceWord(text, c.row, c.col, c.dir)) {
        this.placeWordAt(word, text, c.row, c.col, c.dir);
        return true;
      }
    }
    return false;
  }

  private cellAt(row: number, col: number): string {
    if (row < 0 || col < 0 || row >= this.gridSize || col >= this.gridSize) return '';
    return this.grid[row][col];
  }

  // 检查是否可以放置：不越界、字母一致、至少一个交叉、不与平行单词贴边
  // Valid if in bounds, letters agree, crosses at least once, and no side-by-side contact.
  private canPlaceWord(text: string, startRow: number, startCol: number, dir: Direction): boolean {
    const dr = dir === 'vertical' ? 1 : 0;
    const dc = dir === 'horizontal' ? 1 : 0;
    const endRow = startRow + dr * (text.length - 1);
    const endCol = startCol + dc * (text.length - 1);

    if (startRow < 0 || startCol < 0 || endRow >= this.gridSize || endCol >= this.gridSize) {
      return false;
    }
    // 词首前、词尾后必须为空 (cells before and after the word must be empty)
    if (this.cellAt(startRow - dr, startCol - dc) !== '') return false;
    if (this.cellAt(endRow + dr, endCol + dc) !== '') return false;

    let crossings = 0;
    for (let i = 0; i < text.length; i++) {
      const r = startRow + dr * i;
      const c = startCol + dc * i;
      const existing = this.grid[r][c];
      if (existing !== '') {
        if (existing !== text[i]) return false;
        crossings++;
      } else {
        // 空格子的两侧（垂直于方向）必须为空 (perpendicular neighbours must be empty)
        if (this.cellAt(r - dc, c - dr) !== '' || this.cellAt(r + dc, c + dr) !== '') {
          return false;
        }
      }
    }
    return crossings > 0 && crossings < text.length;
  }

  private placeWordAt(word: Word, text: string, startRow: number, startCol: number, dir: Direction) {
    for (let i = 0; i < text.length; i++) {
      const r = dir === 'vertical' ? startRow + i : startRow;
      const c = dir === 'horizontal' ? startCol + i : startCol;
      this.grid[r][c] = text[i];
    }
    this.placedWords.push({ word, text, startRow, startCol, direction: dir, clueNumber: 0 });
  }

  // 按位置编号（从上到下、从左到右），同一起点共用编号
  // Number clues by position, top-to-bottom then left-to-right; shared starts share a number.
  private assignClueNumbers() {
    const starts = new Map<string, number>();
    const ordered = [...this.placedWords].sort(
      (a, b) => a.startRow - b.startRow || a.startCol - b.startCol
    );
    let n = 1;
    for (const pw of ordered) {
      const key = `${pw.startRow}-${pw.startCol}`;
      if (!starts.has(key)) starts.set(key, n++);
      pw.clueNumber = starts.get(key)!;
    }
  }

  private generateCells(difficulty: Difficulty): CrosswordCell[][] {
    const cells: CrosswordCell[][] = [];
    for (let row = 0; row < this.gridSize; row++) {
      const line: CrosswordCell[] = [];
      for (let col = 0; col < this.gridSize; col++) {
        line.push({
          row,
          col,
          letter: null,
          correctLetter: this.grid[row][col] || '',
          isFixed: false,
          wordIds: this.getWordIdsForCell(row, col),
        });
      }
      cells.push(line);
    }
    this.addHintLetters(cells, difficulty);
    return cells;
  }

  private getWordIdsForCell(row: number, col: number): string[] {
    return this.placedWords
      .filter(pw =>
        pw.direction === 'horizontal'
          ? pw.startRow === row && col >= pw.startCol && col < pw.startCol + pw.text.length
          : pw.startCol === col && row >= pw.startRow && row < pw.startRow + pw.text.length
      )
      .map(pw => pw.word.id);
  }

  private addHintLetters(cells: CrosswordCell[][], difficulty: Difficulty) {
    const hintRatio = difficulty === 'easy' ? 0.4 : difficulty === 'medium' ? 0.25 : 0.15;

    for (const pw of this.placedWords) {
      const len = pw.text.length;
      const hintsCount = Math.max(1, Math.floor(len * hintRatio));
      const indices = shuffle(Array.from({ length: len }, (_, i) => i)).slice(0, hintsCount);

      for (const idx of indices) {
        const row = pw.direction === 'horizontal' ? pw.startRow : pw.startRow + idx;
        const col = pw.direction === 'horizontal' ? pw.startCol + idx : pw.startCol;
        cells[row][col].isFixed = true;
        cells[row][col].letter = cells[row][col].correctLetter;
      }
    }
  }

  private estimateCompletionTime(words: CrosswordWord[], difficulty: string): number {
    const totalLetters = words.reduce((sum, w) => sum + normalizeWord(w.wordData.spanish).length, 0);
    const multiplier = difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1.0 : 1.3;
    return Math.floor(totalLetters * 3 * multiplier);
  }
}

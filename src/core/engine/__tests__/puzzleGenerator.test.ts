import { PuzzleGenerator } from '@/core/engine/puzzleGenerator';
import { normalizeWord } from '@/core/engine/normalize';
import { mulberry32, hashSeed } from '@/core/engine/random';
import { Word, CrosswordPuzzle } from '@/core/types/game';

const makeWord = (id: string, spanish: string): Word => ({
  id,
  spanish,
  english: id,
  chinese: id,
  level: 'A1',
  category: 'food',
});

const TEST_WORDS: Word[] = [
  makeWord('w1', 'agua'),
  makeWord('w2', 'pan'),
  makeWord('w3', 'leche'),
  makeWord('w4', 'café'),
  makeWord('w5', 'fruta'),
  makeWord('w6', 'madre'),
  makeWord('w7', 'padre'),
  makeWord('w8', 'hermano'),
  makeWord('w9', 'avión'),
  makeWord('w10', 'proyecto'),
];

function readWordFromGrid(puzzle: CrosswordPuzzle, wordIndex: number): string {
  const w = puzzle.words[wordIndex];
  const dr = w.direction === 'vertical' ? 1 : 0;
  const dc = w.direction === 'horizontal' ? 1 : 0;
  const len = normalizeWord(w.wordData.spanish).length;
  let result = '';
  for (let i = 0; i < len; i++) {
    result += puzzle.cells[w.startRow + dr * i][w.startCol + dc * i].correctLetter;
  }
  return result;
}

describe('PuzzleGenerator', () => {
  it('同种子生成完全一致的谜题', () => {
    const p1 = new PuzzleGenerator(15, mulberry32(hashSeed('daily'))).generatePuzzle(
      TEST_WORDS,
      'medium',
      'fixed-id',
    );
    const p2 = new PuzzleGenerator(15, mulberry32(hashSeed('daily'))).generatePuzzle(
      TEST_WORDS,
      'medium',
      'fixed-id',
    );
    expect(p1).toEqual(p2);
  });

  it('每个已放单词都能从网格按归一化形式读回', () => {
    const puzzle = new PuzzleGenerator(15, mulberry32(1)).generatePuzzle(TEST_WORDS);
    expect(puzzle.words.length).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < puzzle.words.length; i++) {
      expect(readWordFromGrid(puzzle, i)).toBe(normalizeWord(puzzle.words[i].wordData.spanish));
    }
  });

  it('重音单词归一化后可解（correctLetter 不含重音字母）', () => {
    const puzzle = new PuzzleGenerator(15, mulberry32(2)).generatePuzzle(TEST_WORDS);
    const keyboard = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZÑ'.split(''));
    for (const row of puzzle.cells) {
      for (const cell of row) {
        if (cell.correctLetter) {
          expect(keyboard.has(cell.correctLetter)).toBe(true);
        }
      }
    }
  });

  it('除首词外每个单词至少有一个交叉点', () => {
    const puzzle = new PuzzleGenerator(15, mulberry32(3)).generatePuzzle(TEST_WORDS);
    const counts = new Map<string, number>();
    for (const row of puzzle.cells) {
      for (const cell of row) {
        if (cell.wordIds.length > 1) {
          for (const id of cell.wordIds) {
            counts.set(id, (counts.get(id) ?? 0) + 1);
          }
        }
      }
    }
    for (const w of puzzle.words.slice(1)) {
      expect(counts.get(w.id) ?? 0).toBeGreaterThanOrEqual(1);
    }
  });

  it('平行单词不贴边：非交叉格的邻格不属于其他单词', () => {
    for (let seed = 0; seed < 20; seed++) {
      const puzzle = new PuzzleGenerator(15, mulberry32(seed)).generatePuzzle(TEST_WORDS);
      const size = puzzle.gridSize;
      const at = (r: number, c: number) =>
        r >= 0 && c >= 0 && r < size && c < size ? puzzle.cells[r][c] : null;

      for (const w of puzzle.words) {
        const dr = w.direction === 'vertical' ? 1 : 0;
        const dc = w.direction === 'horizontal' ? 1 : 0;
        const len = normalizeWord(w.wordData.spanish).length;
        for (let i = 0; i < len; i++) {
          const r = w.startRow + dr * i;
          const c = w.startCol + dc * i;
          const cell = at(r, c)!;
          if (cell.wordIds.length > 1) {
            continue; // 交叉格允许有邻字母
          }
          // 非交叉格：垂直方向的两个邻格必须为空
          const n1 = at(r - dc, c - dr);
          const n2 = at(r + dc, c + dr);
          expect(n1?.correctLetter || '').toBe('');
          expect(n2?.correctLetter || '').toBe('');
        }
      }
    }
  });

  it('词首前与词尾后无紧贴字母', () => {
    for (let seed = 0; seed < 20; seed++) {
      const puzzle = new PuzzleGenerator(15, mulberry32(seed)).generatePuzzle(TEST_WORDS);
      const size = puzzle.gridSize;
      const letterAt = (r: number, c: number) =>
        r >= 0 && c >= 0 && r < size && c < size ? puzzle.cells[r][c].correctLetter : '';

      for (const w of puzzle.words) {
        const dr = w.direction === 'vertical' ? 1 : 0;
        const dc = w.direction === 'horizontal' ? 1 : 0;
        const len = normalizeWord(w.wordData.spanish).length;
        expect(letterAt(w.startRow - dr, w.startCol - dc)).toBe('');
        expect(letterAt(w.startRow + dr * len, w.startCol + dc * len)).toBe('');
      }
    }
  });

  it('放词率合理：10 个词至少放下 6 个', () => {
    let total = 0;
    for (let seed = 0; seed < 10; seed++) {
      const puzzle = new PuzzleGenerator(15, mulberry32(seed)).generatePuzzle(TEST_WORDS);
      total += puzzle.words.length;
    }
    expect(total / 10).toBeGreaterThanOrEqual(6);
  });

  it('每个单词按难度带提示字母', () => {
    const puzzle = new PuzzleGenerator(15, mulberry32(5)).generatePuzzle(TEST_WORDS, 'easy');
    for (const w of puzzle.words) {
      const dr = w.direction === 'vertical' ? 1 : 0;
      const dc = w.direction === 'horizontal' ? 1 : 0;
      const len = normalizeWord(w.wordData.spanish).length;
      let hints = 0;
      for (let i = 0; i < len; i++) {
        if (puzzle.cells[w.startRow + dr * i][w.startCol + dc * i].isFixed) {
          hints++;
        }
      }
      expect(hints).toBeGreaterThanOrEqual(1);
    }
  });

  it('超过网格宽度的单词被排除且不影响其他词', () => {
    const withHuge = [...TEST_WORDS, makeWord('huge', 'supercalifragilistico')];
    const puzzle = new PuzzleGenerator(15, mulberry32(1)).generatePuzzle(withHuge);
    expect(puzzle.words.find(w => w.id === 'huge')).toBeUndefined();
    expect(puzzle.words.length).toBeGreaterThanOrEqual(2);
  });
});

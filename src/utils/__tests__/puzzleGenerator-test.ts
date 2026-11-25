import { SAMPLE_WORDS } from '@/data/words';
import { CrosswordPuzzle, Word } from '@/types/game';
import { createRng, PuzzleGenerator } from '@/utils/puzzleGenerator';
import { toGridWord } from '@/utils/letters';

const makeWord = (id: string, spanish: string): Word => ({
  id,
  spanish,
  english: spanish,
  chinese: spanish,
  level: 'A1',
  category: 'food',
  pos: 'noun',
});

// 混入长的动词变位形式和带重音的词，模拟以后变位填字的压力
const STRESS_WORDS: Word[] = [
  'comprendiéramos', 'hablábamos', 'tuvimos', 'estuvieron', 'pidió', 'durmieron',
  'empezamos', 'vosotros', 'jugábamos', 'conduje', 'oímos', 'traje', 'año', 'niño',
].map((w, i) => makeWord(`s${i}`, w));

const POOL = [...SAMPLE_WORDS, ...STRESS_WORDS];

const pick = (rng: () => number, n: number) => {
  const copy = [...POOL];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

// 把网格里所有长度 ≥ 2 的连续字母段找出来
const runs = (puzzle: CrosswordPuzzle) => {
  const found: string[] = [];
  const grid = puzzle.cells.map(row => row.map(c => c.correctLetter));
  const scan = (get: (a: number, b: number) => string, outer: number, inner: number, dir: string) => {
    for (let a = 0; a < outer; a++) {
      let start = -1;
      for (let b = 0; b <= inner; b++) {
        const ch = b < inner ? get(a, b) : '';
        if (ch && start < 0) start = b;
        if (!ch && start >= 0) {
          if (b - start >= 2) found.push(dir === 'h' ? `${a},${start},h` : `${start},${a},v`);
          start = -1;
        }
      }
    }
  };
  scan((r, c) => grid[r][c], puzzle.rows, puzzle.cols, 'h');
  scan((c, r) => grid[r][c], puzzle.cols, puzzle.rows, 'v');
  return found.sort();
};

describe('PuzzleGenerator', () => {
  it('1000 个随机关卡：不出伪单词、不悄悄丢词、字母与答案一致', () => {
    const rng = createRng(12345);
    for (let i = 0; i < 1000; i++) {
      const words = pick(rng, 4 + Math.floor(rng() * 9));
      const puzzle = new PuzzleGenerator(15).generatePuzzle(words, { seed: i, difficulty: 'medium' });

      // 每个输入单词要么放进了网格，要么出现在 unplacedWords 里
      const placedIds = puzzle.words.map(w => w.id);
      const unplacedIds = puzzle.unplacedWords.map(w => w.id);
      expect([...placedIds, ...unplacedIds].sort()).toEqual(words.map(w => w.id).sort());
      expect(placedIds.length).toBeGreaterThan(0);

      // 已放置单词的每个字母都和格子一致
      for (const w of puzzle.words) {
        toGridWord(w.wordData.spanish).forEach((letter, k) => {
          const r = w.direction === 'horizontal' ? w.startRow : w.startRow + k;
          const c = w.direction === 'horizontal' ? w.startCol + k : w.startCol;
          expect(puzzle.cells[r][c].correctLetter).toBe(letter);
          expect(puzzle.cells[r][c].wordIds).toContain(w.id);
        });
      }

      // 网格里每一段连续字母都必须恰好是一个已放置的单词（没有伪单词）
      const expected = puzzle.words
        .map(w => `${w.startRow},${w.startCol},${w.direction === 'horizontal' ? 'h' : 'v'}`)
        .sort();
      expect(runs(puzzle)).toEqual(expected);
    }
  });

  it('相同种子生成相同关卡', () => {
    const words = SAMPLE_WORDS.slice(0, 8);
    const a = new PuzzleGenerator().generatePuzzle(words, { seed: 42 });
    const b = new PuzzleGenerator().generatePuzzle(words, { seed: 42 });
    expect(a.cells).toEqual(b.cells);
    expect(a.words).toEqual(b.words);
  });

  it('题号按位置从上到下、从左到右递增，同一起点共用编号', () => {
    for (let seed = 0; seed < 200; seed++) {
      const puzzle = new PuzzleGenerator().generatePuzzle(SAMPLE_WORDS.slice(0, 10), { seed });
      const starts = [...new Map(puzzle.words.map(w => [`${w.startRow},${w.startCol}`, w])).values()]
        .sort((x, y) => x.startRow - y.startRow || x.startCol - y.startCol);
      starts.forEach((w, i) => expect(w.clueNumber).toBe(i + 1));
    }
  });

  it('比网格还长的单词进入 unplacedWords，不会崩溃', () => {
    const words = [makeWord('long', 'comprendiéramos'), makeWord('a', 'agua'), makeWord('b', 'pan')];
    const puzzle = new PuzzleGenerator(10).generatePuzzle(words, { seed: 1 });
    expect(puzzle.unplacedWords.map(w => w.id)).toContain('long');
  });

  it('网格被裁剪到实际内容大小', () => {
    const puzzle = new PuzzleGenerator(15).generatePuzzle(SAMPLE_WORDS.slice(0, 5), { seed: 7 });
    expect(puzzle.cells).toHaveLength(puzzle.rows);
    expect(puzzle.cells.every(r => r.length === puzzle.cols)).toBe(true);
    expect(puzzle.cells[0].some(c => c.correctLetter)).toBe(true);
    expect(puzzle.cells[puzzle.rows - 1].some(c => c.correctLetter)).toBe(true);
  });
});

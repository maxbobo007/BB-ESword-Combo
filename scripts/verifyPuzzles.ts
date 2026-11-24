/**
 * 生成器自检：对每个可玩的 等级×主题×难度 组合生成很多局，检查不变量。
 * 运行：npm run verify（只需要 TypeScript，不需要装 React Native）
 */
declare const process: { exit(code: number): never };
import { PuzzleGenerator, getWordCellCoords } from '../src/utils/puzzleGenerator';
import { SAMPLE_WORDS, getRandomWords, countWords, MIN_WORDS_PER_PUZZLE } from '../src/data/words';
import { lettersMatch, baseLetter, toGridLetters } from '../src/utils/text';
import type { CrosswordPuzzle, Difficulty, LanguageLevel, WordCategory } from '../src/types/game';

let failures = 0;
const fail = (msg: string) => {
  failures++;
  if (failures <= 20) console.error('✗ ' + msg);
};
const assert = (cond: boolean, msg: string) => {
  if (!cond) fail(msg);
};

// 可复现的伪随机数（mulberry32）
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ---- 文字工具 ----
assert(baseLetter('É') === 'E', 'É → E');
assert(baseLetter('ñ') === 'Ñ', 'ñ 保留为 Ñ');
assert(baseLetter('ü') === 'U', 'ü → U');
assert(lettersMatch('E', 'É', false), '宽松模式 E 匹配 É');
assert(!lettersMatch('E', 'É', true), '严格模式 E 不匹配 É');
assert(!lettersMatch('N', 'Ñ', false), 'N 永远不匹配 Ñ');
assert(toGridLetters('café').join('') === 'CAFÉ', 'café 拆成 4 格');
assert(toGridLetters('café').length === 4, '分解形式的 é 也只占一格');

// ---- 词库 ----
const ids = new Set<string>();
for (const w of SAMPLE_WORDS) {
  assert(!ids.has(w.id), `重复 id: ${w.id}`);
  ids.add(w.id);
  assert(/^[a-záéíóúüñ]+$/.test(w.spanish), `单词含非法字符: ${w.spanish}`);
}
const seen = new Map<string, string>();
for (const w of SAMPLE_WORDS) {
  const k = `${w.level}|${w.spanish}`;
  assert(!seen.has(k), `同一等级重复单词: ${w.spanish}`);
  seen.set(k, w.id);
}

// ---- 生成器不变量 ----
const checkPuzzle = (p: CrosswordPuzzle, label: string) => {
  assert(p.cells.length === p.rows, `${label} 行数不一致`);
  assert(p.cells.every(r => r.length === p.cols), `${label} 列数不一致`);
  assert(p.cols <= 11 && p.rows <= 13, `${label} 网格过大 ${p.rows}x${p.cols}`);

  const covered = new Set<string>();
  for (const w of p.words) {
    const coords = getWordCellCoords(w);
    const letters = toGridLetters(w.wordData.spanish);
    coords.forEach(({ row, col }, i) => {
      const cell = p.cells[row]?.[col];
      assert(!!cell && cell.correctLetter === letters[i], `${label} ${w.wordData.spanish} 第${i}格字母错`);
      covered.add(`${row},${col}`);
    });
    // 首尾外侧必须为空
    const first = coords[0];
    const last = coords[coords.length - 1];
    const [dr, dc] = w.direction === 'horizontal' ? [0, 1] : [1, 0];
    const before = p.cells[first.row - dr]?.[first.col - dc];
    const after = p.cells[last.row + dr]?.[last.col + dc];
    assert(!before?.correctLetter && !after?.correctLetter, `${label} ${w.wordData.spanish} 首尾贴着别的字母`);
    assert(coords.some(({ row, col }) => !p.cells[row][col].isFixed), `${label} ${w.wordData.spanish} 全是提示字母`);
  }

  // 所有字母格都属于某个词；任何连续 ≥2 的字母串都必须是一个词（没有无意义的拼接）
  const wordStarts = new Set(p.words.map(w => `${w.direction}:${w.startRow},${w.startCol}`));
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      const cell = p.cells[r][c];
      if (!cell.correctLetter) continue;
      assert(covered.has(`${r},${c}`), `${label} (${r},${c}) 不属于任何词`);
      const left = p.cells[r][c - 1]?.correctLetter;
      const right = p.cells[r][c + 1]?.correctLetter;
      if (!left && right) assert(wordStarts.has(`horizontal:${r},${c}`), `${label} (${r},${c}) 横向出现无意义字母串`);
      const up = p.cells[r - 1]?.[c]?.correctLetter;
      const down = p.cells[r + 1]?.[c]?.correctLetter;
      if (!up && down) assert(wordStarts.has(`vertical:${r},${c}`), `${label} (${r},${c}) 纵向出现无意义字母串`);
    }
  }

  // 编号：从 1 开始连续，并按位置（先行后列）递增
  const nums = [...new Set(p.words.map(w => w.clueNumber))].sort((a, b) => a - b);
  assert(nums.every((n, i) => n === i + 1), `${label} 编号不连续 ${nums}`);
  const byNum = [...p.words].sort((a, b) => a.clueNumber - b.clueNumber);
  for (let i = 1; i < byNum.length; i++) {
    const a = byNum[i - 1];
    const b = byNum[i];
    if (a.clueNumber === b.clueNumber) {
      assert(a.startRow === b.startRow && a.startCol === b.startCol, `${label} 同编号起点不同`);
    } else {
      assert(a.startRow < b.startRow || (a.startRow === b.startRow && a.startCol < b.startCol), `${label} 编号顺序错`);
    }
  }
};

const levels: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const categories: WordCategory[] = ['food', 'family', 'travel', 'work', 'health', 'nature', 'education', 'sports', 'technology', 'culture'];
const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

let playable = 0;
let puzzles = 0;
let placedTotal = 0;
let requestedTotal = 0;
let fullyPlaced = 0;
for (const level of levels) {
  for (const category of categories) {
    if (countWords(level, category) < MIN_WORDS_PER_PUZZLE) continue;
    playable++;
    for (const difficulty of difficulties) {
      for (let seed = 1; seed <= 40; seed++) {
        const random = seeded(seed * 7919 + puzzles);
        const words = getRandomWords(8, level, category, random);
        const p = new PuzzleGenerator({ random }).generatePuzzle(words, difficulty);
        puzzles++;
        placedTotal += p.words.length;
        requestedTotal += words.length;
        if (p.unplacedWordIds.length === 0) fullyPlaced++;
        assert(p.words.length + p.unplacedWordIds.length === words.length, `${level}/${category} 词数对不上`);
        assert(p.words.length >= MIN_WORDS_PER_PUZZLE, `${level}/${category}/${difficulty}#${seed} 只放下了 ${p.words.length} 个词`);
        checkPuzzle(p, `${level}/${category}/${difficulty}#${seed}`);
      }
    }
  }
}

// 打印一局示例
const sample = new PuzzleGenerator({ random: seeded(42) }).generatePuzzle(getRandomWords(8, 'A1', 'food', seeded(42)), 'medium');
console.log(`示例网格 ${sample.rows}x${sample.cols}:`);
for (const row of sample.cells) console.log('  ' + row.map(c => c.correctLetter || '·').join(' '));
for (const w of sample.words) console.log(`  ${w.clueNumber}${w.direction === 'horizontal' ? '→' : '↓'} ${w.wordData.spanish}`);

console.log(`\n词库 ${SAMPLE_WORDS.length} 个词，可玩组合 ${playable} 个`);
console.log(`生成 ${puzzles} 局，平均放下 ${(placedTotal / puzzles).toFixed(2)}/${(requestedTotal / puzzles).toFixed(2)} 个词，全部放下的占 ${((fullyPlaced / puzzles) * 100).toFixed(1)}%`);
if (failures) {
  console.error(`\n${failures} 项检查失败`);
  process.exit(1);
}
console.log('全部检查通过 ✓');

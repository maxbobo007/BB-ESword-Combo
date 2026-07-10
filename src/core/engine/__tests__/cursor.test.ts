import { findWordAt, nextEditableCell, wordCells } from '@/core/engine/cursor';
import { CrosswordWord, CrosswordCell, Word } from '@/core/types/game';

const word = (id: string, spanish: string): Word => ({
  id,
  spanish,
  english: id,
  chinese: id,
  level: 'A1',
  category: 'food',
});

// 布局：GATO 横向从 (2,1)；TREN 纵向从 (0,3)，在 (2,3) 与 GATO 的 T 交叉
const WORDS: CrosswordWord[] = [
  {
    id: 'w1',
    wordData: word('w1', 'gato'),
    startRow: 2,
    startCol: 1,
    direction: 'horizontal',
    clueNumber: 1,
    isCompleted: false,
  },
  {
    id: 'w2',
    wordData: word('w2', 'tren'),
    startRow: 0,
    startCol: 3,
    direction: 'vertical',
    clueNumber: 2,
    isCompleted: false,
  },
];

const makeCells = (fixed: [number, number][] = []): CrosswordCell[][] =>
  Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => ({
      row,
      col,
      letter: null,
      correctLetter: 'A',
      isFixed: fixed.some(([r, c]) => r === row && c === col),
      wordIds: [],
    })),
  );

describe('cursor', () => {
  it('findWordAt 按偏好方向优先', () => {
    expect(findWordAt(WORDS, 2, 3, 'horizontal')?.id).toBe('w1');
    expect(findWordAt(WORDS, 2, 3, 'vertical')?.id).toBe('w2');
  });

  it('findWordAt 无偏好方向单词时回退另一方向', () => {
    expect(findWordAt(WORDS, 2, 1, 'vertical')?.id).toBe('w1');
    expect(findWordAt(WORDS, 0, 3, 'horizontal')?.id).toBe('w2');
  });

  it('findWordAt 不在任何单词上返回 undefined', () => {
    expect(findWordAt(WORDS, 5, 5, 'horizontal')).toBeUndefined();
  });

  it('nextEditableCell 沿词前进并跳过提示格', () => {
    const cells = makeCells([[2, 2]]); // GATO 的第二格是提示
    expect(nextEditableCell(WORDS[0], cells, 2, 1)).toEqual({ row: 2, col: 3 });
    expect(nextEditableCell(WORDS[0], cells, 2, 3)).toEqual({ row: 2, col: 4 });
  });

  it('nextEditableCell 到词尾返回 null', () => {
    const cells = makeCells();
    expect(nextEditableCell(WORDS[0], cells, 2, 4)).toBeNull();
    expect(nextEditableCell(WORDS[1], cells, 3, 3)).toBeNull();
  });

  it('wordCells 返回整词坐标', () => {
    expect(wordCells(WORDS[1])).toEqual([
      { row: 0, col: 3 },
      { row: 1, col: 3 },
      { row: 2, col: 3 },
      { row: 3, col: 3 },
    ]);
  });
});

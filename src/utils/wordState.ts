import { CrosswordCell, CrosswordWord } from '@/types/game';
import { toGridWord } from '@/utils/letters';

export interface CellPos {
  row: number;
  col: number;
}

// 单词覆盖的所有格子坐标
export const wordCells = (word: CrosswordWord): CellPos[] =>
  toGridWord(word.wordData.spanish).map((_, i) =>
    word.direction === 'horizontal'
      ? { row: word.startRow, col: word.startCol + i }
      : { row: word.startRow + i, col: word.startCol }
  );

export const isWordFull = (cells: CrosswordCell[][], word: CrosswordWord) =>
  wordCells(word).every(p => cells[p.row][p.col].letter);

export const isWordCorrect = (cells: CrosswordCell[][], word: CrosswordWord) =>
  wordCells(word).every(p => cells[p.row][p.col].letter === cells[p.row][p.col].correctLetter);

export type WordStatus = 'empty' | 'partial' | 'wrong' | 'correct';

export const wordStatus = (cells: CrosswordCell[][], word: CrosswordWord): WordStatus => {
  const ps = wordCells(word);
  const filled = ps.filter(p => cells[p.row][p.col].letter).length;
  if (filled === 0) return 'empty';
  if (filled < ps.length) return 'partial';
  return isWordCorrect(cells, word) ? 'correct' : 'wrong';
};

// 属于某个已答对单词的格子都锁定，不能再改
export const isCellLocked = (
  cells: CrosswordCell[][],
  words: CrosswordWord[],
  pos: CellPos
): boolean => {
  const cell = cells[pos.row][pos.col];
  if (cell.isFixed) return true;
  return words.some(w => cell.wordIds.includes(w.id) && isWordCorrect(cells, w));
};

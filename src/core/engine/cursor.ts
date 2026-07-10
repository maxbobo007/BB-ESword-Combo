import { CrosswordWord, CrosswordCell, Direction } from '@/core/types/game';

/** 找到经过 (row,col) 的指定方向单词；没有则返回另一方向的 */
export function findWordAt(
  words: CrosswordWord[],
  row: number,
  col: number,
  preferred: Direction,
): CrosswordWord | undefined {
  const at = words.filter(w => {
    const dr = w.direction === 'vertical' ? 1 : 0;
    const dc = w.direction === 'horizontal' ? 1 : 0;
    const len = w.wordData.spanish.length;
    const offset = dr ? row - w.startRow : col - w.startCol;
    const onLine = dr ? col === w.startCol : row === w.startRow;
    return onLine && offset >= 0 && offset < len;
  });
  return at.find(w => w.direction === preferred) ?? at[0];
}

/** 沿单词方向找 (row,col) 之后下一个可编辑（非提示）格；到词尾返回 null */
export function nextEditableCell(
  word: CrosswordWord,
  cells: CrosswordCell[][],
  row: number,
  col: number,
): { row: number; col: number } | null {
  const dr = word.direction === 'vertical' ? 1 : 0;
  const dc = word.direction === 'horizontal' ? 1 : 0;
  const len = word.wordData.spanish.length;
  let offset = dr ? row - word.startRow : col - word.startCol;
  while (++offset < len) {
    const r = word.startRow + dr * offset;
    const c = word.startCol + dc * offset;
    if (!cells[r][c].isFixed) {
      return { row: r, col: c };
    }
  }
  return null;
}

/** 单词内全部格子坐标（用于高亮当前单词） */
export function wordCells(word: CrosswordWord): { row: number; col: number }[] {
  const dr = word.direction === 'vertical' ? 1 : 0;
  const dc = word.direction === 'horizontal' ? 1 : 0;
  return Array.from({ length: word.wordData.spanish.length }, (_, i) => ({
    row: word.startRow + dr * i,
    col: word.startCol + dc * i,
  }));
}

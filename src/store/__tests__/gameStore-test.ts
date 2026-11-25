import { useGameStore } from '@/store/gameStore';
import { PuzzleGenerator } from '@/utils/puzzleGenerator';
import { Word } from '@/types/game';
import { wordCells } from '@/utils/wordState';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const word = (id: string, spanish: string): Word => ({
  id, spanish, english: spanish, chinese: spanish, level: 'A1', category: 'food',
  pos: 'noun',
});

const start = (seed = 3) => {
  const puzzle = new PuzzleGenerator().generatePuzzle(
    [word('a', 'café'), word('b', 'leche'), word('c', 'pan')],
    { seed, difficulty: 'hard' }
  );
  useGameStore.getState().startGame(puzzle);
  return puzzle;
};

const editableCells = () =>
  useGameStore.getState().currentSession!.currentCells.flat().filter(c => c.correctLetter && !c.isFixed);

describe('gameStore', () => {
  beforeEach(() => useGameStore.getState().resetGame());

  it('不带重音的输入算对，并显示带重音的正确字母', () => {
    // 找一个 É 不是提示字母的种子
    let accented;
    for (let seed = 0; seed < 50 && !accented; seed++) {
      start(seed);
      accented = editableCells().find(c => c.correctLetter === 'É');
    }
    if (!accented) throw new Error('没有找到可编辑的 É');
    useGameStore.getState().updateCell(accented.row, accented.col, 'e');
    const after = useGameStore.getState().currentSession!.currentCells[accented.row][accented.col];
    expect(after.letter).toBe('É');
    expect(useGameStore.getState().currentSession!.mistakes).toBe(0);
  });

  it('不逐字判错：整词填满且不对时才按错误字母数计错，且不修改原状态对象', () => {
    const puzzle = start();
    const before = useGameStore.getState().currentSession!;
    const word = puzzle.words[0];
    const editable = wordCells(word).filter(p => !before.currentCells[p.row][p.col].isFixed);
    const wrongLetter = (p: { row: number; col: number }) =>
      before.currentCells[p.row][p.col].correctLetter === 'Z' ? 'X' : 'Z';

    // 先填到只差一格：还不计错
    for (const p of editable.slice(0, -1)) useGameStore.getState().updateCell(p.row, p.col, wrongLetter(p));
    expect(useGameStore.getState().currentSession!.mistakes).toBe(0);

    // 填满：一次性计入所有错误字母
    const last = editable[editable.length - 1];
    useGameStore.getState().updateCell(last.row, last.col, wrongLetter(last));
    const after = useGameStore.getState().currentSession!;
    expect(after.mistakes).toBe(editable.length);
    expect(after.wrongWordIds).toContain(word.id);
    expect(before.currentCells[editable[0].row][editable[0].col].letter).toBeNull();
  });

  it('答对的单词被锁定，不能再改', () => {
    const puzzle = start();
    const word = puzzle.words[0];
    for (const p of wordCells(word)) {
      const c = useGameStore.getState().currentSession!.currentCells[p.row][p.col];
      if (!c.isFixed) useGameStore.getState().updateCell(p.row, p.col, c.correctLetter);
    }
    const p = wordCells(word).find(
      q => !puzzle.cells[q.row][q.col].isFixed
    )!;
    useGameStore.getState().updateCell(p.row, p.col, 'Z');
    const cell = useGameStore.getState().currentSession!.currentCells[p.row][p.col];
    expect(cell.letter).toBe(cell.correctLetter);
  });

  it('提示可以指定格子，并记录用过提示的单词', () => {
    const puzzle = start();
    const target = editableCells()[0];
    const pos = useGameStore.getState().revealHint({ row: target.row, col: target.col });
    expect(pos).toEqual({ row: target.row, col: target.col });
    const session = useGameStore.getState().currentSession!;
    const cell = session.currentCells[target.row][target.col];
    expect(cell.letter).toBe(cell.correctLetter);
    expect(cell.revealed).toBe(true);
    expect(session.hintedWordIds).toEqual(expect.arrayContaining(cell.wordIds));
    expect(puzzle.words.length).toBeGreaterThan(0);
  });

  it('全部填对后自动完成', () => {
    start();
    for (const c of editableCells()) useGameStore.getState().updateCell(c.row, c.col, c.correctLetter);
    const session = useGameStore.getState().currentSession!;
    expect(session.isCompleted).toBe(true);
    expect(session.score).toBeGreaterThan(0);
  });

  it('用提示填上最后一格也会判定通关', () => {
    start();
    const cells = editableCells();
    for (const c of cells.slice(1)) useGameStore.getState().updateCell(c.row, c.col, c.correctLetter);
    expect(useGameStore.getState().currentSession!.isCompleted).toBe(false);
    useGameStore.getState().revealHint();
    expect(useGameStore.getState().currentSession!.isCompleted).toBe(true);
  });
});

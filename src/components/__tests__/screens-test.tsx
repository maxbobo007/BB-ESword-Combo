import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { HomeScreen } from '@/components/HomeScreen';
import { GameScreen } from '@/components/GameScreen';
import { useGameStore } from '@/store/gameStore';
import { PuzzleGenerator } from '@/utils/puzzleGenerator';
import { SAMPLE_WORDS } from '@/data/words';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  useGameStore.getState().resetGame();
});

describe('HomeScreen', () => {
  it('只给有足够单词的组合，点开始后生成关卡并进入游戏页', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('食物')).toBeTruthy();
    expect(screen.getByText('家庭')).toBeTruthy();
    expect(screen.queryByText('旅行')).toBeNull(); // A1 没有旅行词

    await fireEvent.press(screen.getByText('A2 基础'));
    expect(screen.getByText('旅行')).toBeTruthy();

    await fireEvent.press(screen.getByText('开始游戏'));
    expect(mockPush).toHaveBeenCalledWith('/game');
    const puzzle = useGameStore.getState().currentPuzzle!;
    expect(puzzle.words.every(w => w.wordData.level === 'A2')).toBe(true);
  });
});

describe('GameScreen', () => {
  it('没有关卡时显示返回主页', async () => {
    await render(<GameScreen />);
    await fireEvent.press(screen.getByText('返回主页'));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('点线索、用屏幕键盘填完所有单词后弹出完成对话框', async () => {
    const words = SAMPLE_WORDS.filter(w => w.level === 'A1' && w.category === 'food');
    const puzzle = new PuzzleGenerator().generatePuzzle(words, { seed: 11, difficulty: 'easy' });
    useGameStore.getState().startGame(puzzle);
    await render(<GameScreen />);

    for (const word of [...puzzle.words].sort((a, b) => a.clueNumber - b.clueNumber)) {
      const clue = `${word.clueNumber}. ${word.wordData.english}（${word.wordData.chinese}）`;
      await fireEvent.press(screen.getByText(clue));
      // 依次按下这个单词里所有还没填的字母（自动跳过提示字母）
      const letters = [...word.wordData.spanish.normalize('NFC').toUpperCase()];
      for (const [i, letter] of letters.entries()) {
        const r = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
        const c = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
        const cell = useGameStore.getState().currentSession!.currentCells[r][c];
        if (cell.isFixed || cell.letter === cell.correctLetter) continue;
        // 键盘没有重音键：用不带重音的字母输入
        const key = letter.normalize('NFD').replace(/[̀-ͯ]/g, '') || letter;
        await fireEvent.press(screen.getByLabelText(letter === 'Ñ' ? 'Ñ' : key));
      }
    }

    const session = useGameStore.getState().currentSession!;
    expect(session.mistakes).toBe(0);
    expect(session.isCompleted).toBe(true);
    expect(screen.getByText('恭喜完成！')).toBeTruthy();

    await fireEvent.press(screen.getAllByText('返回主页')[0]);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});

import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '@/components/HomeScreen';
import { GameScreen } from '@/components/GameScreen';
import { useGameStore } from '@/store/gameStore';
import { PuzzleGenerator } from '@/utils/puzzleGenerator';
import { SAMPLE_WORDS } from '@/data/words';

const METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const render = (ui: React.ReactElement) =>
  rtlRender(<SafeAreaProvider initialMetrics={METRICS}>{ui}</SafeAreaProvider>);

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
    expect(screen.queryByText('工作')).toBeNull(); // A1 没有工作类的词

    await fireEvent.press(screen.getByText('A2'));
    expect(screen.getByText('工作')).toBeTruthy();

    await fireEvent.press(screen.getByText('旅行'));
    await fireEvent.press(screen.getByLabelText(/^开始，A2 旅行/));
    expect(mockPush).toHaveBeenCalledWith('/game');
    const puzzle = useGameStore.getState().currentPuzzle!;
    expect(puzzle.words.every(w => w.wordData.level === 'A2')).toBe(true);
    expect(useGameStore.getState().currentSettings).toMatchObject({
      mode: 'noun',
      level: 'A2',
      topic: 'travel',
      difficulty: 'medium',
    });
    expect(puzzle.rows).toBe(puzzle.cols);
  });

  it('动词模式按词尾分组，只出动词', async () => {
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByText('动词'));
    expect(screen.getByText('-AR 动词')).toBeTruthy();
    await fireEvent.press(screen.getByText('-ER 动词'));
    await fireEvent.press(screen.getByLabelText(/^开始，A1 -ER 动词/));
    const puzzle = useGameStore.getState().currentPuzzle!;
    expect(puzzle.words.every(w => w.wordData.pos === 'verb' && w.wordData.spanish.endsWith('er'))).toBe(true);
  });

  it('点"建设中"的等级只给提示，不切换', async () => {
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByText('C2'));
    expect(screen.getByText('C2 词库建设中，敬请期待')).toBeTruthy();
    expect(screen.getByLabelText(/^开始，A1/)).toBeTruthy();
  });
});

const DIR = { horizontal: '横', vertical: '纵' } as const;

describe('GameScreen', () => {
  it('没有关卡时显示返回主页', async () => {
    await render(<GameScreen />);
    await fireEvent.press(screen.getByText('返回主页'));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('通过线索列表选词、用屏幕键盘填完所有单词后显示结果页', async () => {
    const words = SAMPLE_WORDS.filter(w => w.level === 'A1' && w.category === 'food').slice(0, 6);
    const puzzle = new PuzzleGenerator(9).generatePuzzle([], {
      seed: 11,
      difficulty: 'easy',
      square: true,
      fillers: words,
    });
    useGameStore.getState().startGame(puzzle, {
      mode: 'noun',
      level: 'A1',
      topic: 'food',
      difficulty: 'easy',
      boardSize: 9,
    });
    await render(<GameScreen />);

    for (const word of [...puzzle.words].sort((a, b) => a.clueNumber - b.clueNumber)) {
      // 点线索条打开"全部线索"，再点目标单词
      await fireEvent.press(screen.getByLabelText(/^当前线索/));
      await fireEvent.press(
        screen.getByLabelText(new RegExp(`^${word.clueNumber}${DIR[word.direction]}，`))
      );
      const letters = [...word.wordData.spanish.normalize('NFC').toUpperCase()];
      for (const [i, letter] of letters.entries()) {
        const r = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
        const c = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
        const cell = useGameStore.getState().currentSession!.currentCells[r][c];
        if (cell.isFixed || cell.letter === cell.correctLetter) continue;
        // 键盘没有重音键：用不带重音的字母输入
        const key = letter === 'Ñ' ? 'Ñ，eñe' : letter.normalize('NFD').replace(/[̀-ͯ]/g, '');
        await fireEvent.press(screen.getByLabelText(key));
      }
    }

    const session = useGameStore.getState().currentSession!;
    expect(session.mistakes).toBe(0);
    expect(session.isCompleted).toBe(true);
    expect(screen.getByText('¡Muy bien! 完成了')).toBeTruthy();
    expect(screen.getAllByText('✓ 掌握')).toHaveLength(puzzle.words.length);

    // 再来一局：用同样的设置生成新关卡
    await fireEvent.press(screen.getByText('再来一局'));
    const next = useGameStore.getState();
    expect(next.currentSession!.isCompleted).toBe(false);
    expect(next.currentPuzzle!.id).not.toBe(puzzle.id);
    expect(next.currentPuzzle!.words.every(w => w.wordData.category === 'food')).toBe(true);
    expect(next.currentPuzzle!.rows).toBe(9);
  });
});

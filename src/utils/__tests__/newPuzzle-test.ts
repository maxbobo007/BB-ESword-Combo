import { getTopics } from '@/data/words';
import { BOARD_SIZES, generateForSettings } from '@/utils/newPuzzle';
import { GameSettings } from '@/types/game';

describe('generateForSettings', () => {
  it('正方形棋盘、只用所选主题的词、每个可选组合都能出题', () => {
    const counts: Record<number, number[]> = {};
    for (const mode of ['noun', 'verb'] as const) {
      for (const level of ['A1', 'A2', 'B1'] as const) {
        for (const topic of getTopics(mode, level)) {
          for (const { size } of BOARD_SIZES) {
            const settings: GameSettings = {
              mode,
              level,
              topic: topic.id,
              difficulty: 'medium',
              boardSize: size,
            };
            const puzzle = generateForSettings(settings)!;
            expect(puzzle.rows).toBe(size);
            expect(puzzle.cols).toBe(size);
            expect(puzzle.cells).toHaveLength(size);
            expect(puzzle.words.length).toBeGreaterThanOrEqual(3);
            for (const w of puzzle.words) {
              expect(w.wordData.pos).toBe(mode);
              expect(w.wordData.level).toBe(level);
            }
            (counts[size] ??= []).push(puzzle.words.length);
          }
        }
      }
    }
    // 打印每种棋盘的平均放词数，方便以后调参
    const avg = Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1)])
    );
    console.log('平均放词数', JSON.stringify(avg));
  });
});

import { getDailyPuzzle } from '@/core/daily/daily';

describe('daily puzzle', () => {
  it('同日期生成完全一致的谜题', () => {
    const a = getDailyPuzzle('2026-07-08');
    const b = getDailyPuzzle('2026-07-08');
    expect(a).toEqual(b);
  });

  it('不同日期生成不同谜题', () => {
    const a = getDailyPuzzle('2026-07-08');
    const b = getDailyPuzzle('2026-07-09');
    expect(a.id).not.toBe(b.id);
    const layout = (p: typeof a) =>
      p.words.map(w => `${w.wordData.id}:${w.startRow},${w.startCol},${w.direction}`).join('|');
    expect(layout(a)).not.toBe(layout(b));
  });

  it('谜题 ID 携带日期，可玩单词数量足够', () => {
    const p = getDailyPuzzle('2026-07-08');
    expect(p.id).toBe('daily_2026-07-08');
    expect(p.words.length).toBeGreaterThanOrEqual(6);
  });
});

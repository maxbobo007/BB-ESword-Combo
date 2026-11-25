import { localDateString, previousDateString, nextStreak } from '@/core/progress/streak';

describe('streak', () => {
  it('localDateString 输出本地 YYYY-MM-DD', () => {
    expect(localDateString(new Date(2026, 6, 8))).toBe('2026-07-08');
    expect(localDateString(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('previousDateString 处理跨月跨年', () => {
    expect(previousDateString('2026-07-08')).toBe('2026-07-07');
    expect(previousDateString('2026-07-01')).toBe('2026-06-30');
    expect(previousDateString('2026-01-01')).toBe('2025-12-31');
    expect(previousDateString('2026-03-01')).toBe('2026-02-28');
  });

  it('同一天重复学习不增加连击', () => {
    expect(nextStreak(3, '2026-07-08', '2026-07-08')).toBe(3);
  });

  it('昨天学过则连击 +1', () => {
    expect(nextStreak(3, '2026-07-07', '2026-07-08')).toBe(4);
  });

  it('断签重置为 1', () => {
    expect(nextStreak(10, '2026-07-01', '2026-07-08')).toBe(1);
  });

  it('首次学习从 1 开始', () => {
    expect(nextStreak(0, '', '2026-07-08')).toBe(1);
  });
});

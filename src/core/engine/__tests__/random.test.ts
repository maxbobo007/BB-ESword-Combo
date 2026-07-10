import { hashSeed, mulberry32, shuffle } from '@/core/engine/random';

describe('random', () => {
  it('同种子产生完全相同的序列', () => {
    const a = mulberry32(hashSeed('test-seed'));
    const b = mulberry32(hashSeed('test-seed'));
    for (let i = 0; i < 100; i++) {
      expect(a()).toBe(b());
    }
  });

  it('不同种子产生不同序列', () => {
    const a = mulberry32(hashSeed('seed-1'));
    const b = mulberry32(hashSeed('seed-2'));
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it('输出在 [0, 1) 区间', () => {
    const rng = mulberry32(hashSeed('range'));
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('shuffle 不修改原数组且保留全部元素', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const rng = mulberry32(1);
    const shuffled = shuffle(original, rng);
    expect(original).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...shuffled].sort((x, y) => x - y)).toEqual(original);
  });

  it('shuffle 同种子结果一致', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    expect(shuffle(arr, mulberry32(42))).toEqual(shuffle(arr, mulberry32(42)));
  });
});

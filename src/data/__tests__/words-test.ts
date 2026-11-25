import { getTopics, SAMPLE_WORDS, verbGroupOf } from '@/data/words';

describe('词库', () => {
  it('没有重复的西语单词，也没有重复的 id', () => {
    const spanish = SAMPLE_WORDS.map(w => w.spanish.normalize('NFC').toLowerCase());
    const dupes = spanish.filter((w, i) => spanish.indexOf(w) !== i);
    expect(dupes).toEqual([]);
    expect(new Set(SAMPLE_WORDS.map(w => w.id)).size).toBe(SAMPLE_WORDS.length);
  });

  it('每个词都是单个词（能放进填字格），名词有阴阳性，动词是 -ar/-er/-ir 原形', () => {
    for (const w of SAMPLE_WORDS) {
      expect(w.spanish).toMatch(/^[a-záéíóúüñ]+$/);
      expect(w.chinese.length).toBeGreaterThan(0);
      if (w.pos === 'noun') expect(['m', 'f']).toContain(w.gender);
      if (w.pos === 'verb') expect(verbGroupOf(w.spanish)).not.toBeNull();
    }
  });

  it('词汇量接近 CEFR 常用估计：A1 约 500，A2 累计约 1000', () => {
    const count = (level: string) => SAMPLE_WORDS.filter(w => w.level === level).length;
    const a1 = count('A1');
    const a2 = count('A2');
    console.log('词库规模', JSON.stringify({ A1: a1, A2: a2, 累计A2: a1 + a2, 总数: SAMPLE_WORDS.length }));
    expect(a1).toBeGreaterThanOrEqual(450);
    expect(a1 + a2).toBeGreaterThanOrEqual(950);
  });

  it('A1 和 A2 的每个名词主题都能开局', () => {
    expect(getTopics('noun', 'A1').length).toBeGreaterThanOrEqual(13);
    expect(getTopics('noun', 'A2').length).toBe(15);
    expect(getTopics('verb', 'A1').map(t => t.id)).toEqual(['ar', 'er', 'ir']);
    expect(getTopics('verb', 'A2').map(t => t.id)).toEqual(['ar', 'er', 'ir']);
  });
});

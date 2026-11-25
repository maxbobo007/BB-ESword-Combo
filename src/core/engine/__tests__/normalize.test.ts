import { normalizeLetter, normalizeWord } from '@/core/engine/normalize';

describe('normalize', () => {
  it('去除重音并大写', () => {
    expect(normalizeWord('café')).toBe('CAFE');
    expect(normalizeWord('avión')).toBe('AVION');
    expect(normalizeWord('reunión')).toBe('REUNION');
    expect(normalizeWord('pingüino')).toBe('PINGUINO');
  });

  it('保留 Ñ 为独立字母', () => {
    expect(normalizeWord('ñoño')).toBe('ÑOÑO');
    expect(normalizeWord('mañana')).toBe('MAÑANA');
    expect(normalizeLetter('ñ')).toBe('Ñ');
    expect(normalizeLetter('Ñ')).toBe('Ñ');
  });

  it('普通字母只做大写', () => {
    expect(normalizeWord('agua')).toBe('AGUA');
    expect(normalizeLetter('a')).toBe('A');
  });
});

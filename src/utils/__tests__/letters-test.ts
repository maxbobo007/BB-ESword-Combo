import { baseLetter, isSameLetter, toGridWord } from '@/utils/letters';

describe('letters', () => {
  it('去掉元音上的重音', () => {
    expect(['Á', 'É', 'Í', 'Ó', 'Ú', 'Ü'].map(baseLetter)).toEqual(['A', 'E', 'I', 'O', 'U', 'U']);
  });

  it('Ñ 是独立字母，不等于 N', () => {
    expect(baseLetter('ñ')).toBe('Ñ');
    expect(isSameLetter('N', 'Ñ')).toBe(false);
    expect(isSameLetter('ñ', 'Ñ')).toBe(true);
  });

  it('不带重音的输入可以匹配带重音的答案', () => {
    expect(isSameLetter('e', 'É')).toBe(true);
    expect(isSameLetter('O', 'Ó')).toBe(true);
    expect(isSameLetter('A', 'E')).toBe(false);
  });

  it('网格单词统一为大写，保留重音，按字符而不是 UTF-16 单元拆分', () => {
    expect(toGridWord('avión')).toEqual(['A', 'V', 'I', 'Ó', 'N']);
    // 组合字符形式（o + 重音符号）也会被规范成一个字母
    expect(toGridWord('avión')).toEqual(['A', 'V', 'I', 'Ó', 'N']);
    expect(toGridWord('año')).toEqual(['A', 'Ñ', 'O']);
  });
});

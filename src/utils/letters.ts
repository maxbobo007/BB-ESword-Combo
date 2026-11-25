// 西语字母比较工具。
// 去掉重音（Á→A、Ü→U）但保留 Ñ：Ñ 在西语里是独立字母，不是 N 加符号。
export const baseLetter = (ch: string): string => {
  const upper = ch.toUpperCase();
  if (upper === 'Ñ') return upper;
  return upper.normalize('NFD').replace(/[̀-ͯ]/g, '');
};

// 忽略重音比较两个字母（输入 E 可以匹配 É）
export const isSameLetter = (a: string, b: string): boolean => baseLetter(a) === baseLetter(b);

// 网格里统一使用大写形式，保留重音和 Ñ
export const toGridWord = (word: string): string[] => [...word.normalize('NFC').toUpperCase()];

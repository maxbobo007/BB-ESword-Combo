// 西语填字惯例：网格中忽略重音（á→A），但 Ñ 是独立字母需保留。
// 注意：不能用 NFD 剥离变音符，那会把 ñ 的波浪号也剥掉。
const ACCENT_MAP: Record<string, string> = {
  á: 'A',
  é: 'E',
  í: 'I',
  ó: 'O',
  ú: 'U',
  ü: 'U',
};

export function normalizeLetter(ch: string): string {
  const lower = ch.toLowerCase();
  if (lower === 'ñ') {
    return 'Ñ';
  }
  return (ACCENT_MAP[lower] ?? ch).toUpperCase();
}

export function normalizeWord(word: string): string {
  return Array.from(word).map(normalizeLetter).join('');
}

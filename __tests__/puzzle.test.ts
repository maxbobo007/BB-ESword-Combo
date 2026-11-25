import { PuzzleGenerator } from '../src/utils/puzzleGenerator';
import { normalizeLetter, normalizeWord } from '../src/utils/letters';
import { SAMPLE_WORDS, getCategoriesForLevel, getRandomWords } from '../src/data/words';
import { LanguageLevel } from '../src/types/game';

describe('letters', () => {
  it('strips accents but keeps Ñ', () => {
    expect(normalizeWord('café')).toBe('CAFE');
    expect(normalizeWord('pingüino')).toBe('PINGUINO');
    expect(normalizeWord('montaña')).toBe('MONTAÑA');
    expect(normalizeLetter('ñ')).toBe('Ñ');
  });
});

describe('word bank', () => {
  it('has unique ids and unique Spanish words', () => {
    expect(new Set(SAMPLE_WORDS.map(w => w.id)).size).toBe(SAMPLE_WORDS.length);
    expect(new Set(SAMPLE_WORDS.map(w => w.spanish)).size).toBe(SAMPLE_WORDS.length);
  });

  it('only uses single words that fit a 15x15 grid', () => {
    for (const w of SAMPLE_WORDS) {
      expect(normalizeWord(w.spanish)).toMatch(/^[A-ZÑ]{2,15}$/);
    }
  });

  it('offers at least two playable themes on every level', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as LanguageLevel[]) {
      expect(getCategoriesForLevel(level).length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('PuzzleGenerator', () => {
  const levels: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  it('builds valid, connected crosswords for every playable theme', () => {
    for (const level of levels) {
      for (const { category } of getCategoriesForLevel(level)) {
        for (let run = 0; run < 10; run++) {
          const words = getRandomWords(8, level, category);
          const puzzle = new PuzzleGenerator(15).generatePuzzle(words, 'medium');

          expect(puzzle.words.length).toBeGreaterThanOrEqual(3);

          // 每个单词的字母都和格子一致 (every placed word matches the grid)
          for (const w of puzzle.words) {
            const text = normalizeWord(w.wordData.spanish);
            for (let i = 0; i < text.length; i++) {
              const r = w.direction === 'horizontal' ? w.startRow : w.startRow + i;
              const c = w.direction === 'horizontal' ? w.startCol + i : w.startCol;
              expect(puzzle.cells[r][c].correctLetter).toBe(text[i]);
            }
          }

          // 每个字母格都属于至少一个单词，横向连续段必须是一个已放置的单词
          // Every letter cell belongs to a word; no accidental extra words.
          const letterCells = puzzle.cells.flat().filter(c => c.correctLetter);
          for (const cell of letterCells) expect(cell.wordIds.length).toBeGreaterThan(0);

          const placedRuns = new Set(
            puzzle.words.map(w => `${w.direction}-${w.startRow}-${w.startCol}`)
          );
          const size = puzzle.gridSize;
          const letter = (r: number, c: number) =>
            r >= 0 && c >= 0 && r < size && c < size && !!puzzle.cells[r][c].correctLetter;
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (!letter(r, c)) continue;
              if (!letter(r, c - 1) && letter(r, c + 1)) {
                expect(placedRuns.has(`horizontal-${r}-${c}`)).toBe(true);
              }
              if (!letter(r - 1, c) && letter(r + 1, c)) {
                expect(placedRuns.has(`vertical-${r}-${c}`)).toBe(true);
              }
            }
          }

          // 至少一个提示字母 (at least one given letter)
          expect(letterCells.some(c => c.isFixed && c.letter === c.correctLetter)).toBe(true);
        }
      }
    }
  });

  it('numbers clues by position', () => {
    const puzzle = new PuzzleGenerator(15).generatePuzzle(getRandomWords(8, 'A1', 'food'));
    const sorted = [...puzzle.words].sort(
      (a, b) => a.startRow - b.startRow || a.startCol - b.startCol
    );
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].clueNumber).toBeGreaterThanOrEqual(sorted[i - 1].clueNumber);
    }
    expect(sorted[0].clueNumber).toBe(1);
  });
});

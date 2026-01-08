import { Word, CrosswordPuzzle, CrosswordWord, CrosswordCell } from '@/types/game';

interface PlacedWord {
  word: Word;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
  clueNumber: number;
}

export class PuzzleGenerator {
  private gridSize: number;
  private grid: string[][];
  private placedWords: PlacedWord[] = [];
  private clueCounter = 1;

  constructor(gridSize: number = 15) {
    this.gridSize = gridSize;
    this.grid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(''));
  }

  // 生成填字游戏
  generatePuzzle(
    words: Word[],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): CrosswordPuzzle {
    this.reset();

    // 按单词长度排序（长的优先）
    const sortedWords = [...words].sort((a, b) => b.spanish.length - a.spanish.length);

    // 放置第一个单词（水平居中）
    if (sortedWords.length > 0) {
      this.placeFirstWord(sortedWords[0]);
    }

    // 尝试放置其他单词
    for (let i = 1; i < sortedWords.length; i++) {
      this.placeWord(sortedWords[i]);
    }

    // 生成单元格数据
    const cells = this.generateCells(difficulty);

    // 构建CrosswordWord数组
    const crosswordWords: CrosswordWord[] = this.placedWords.map(pw => ({
      id: pw.word.id,
      wordData: pw.word,
      startRow: pw.startRow,
      startCol: pw.startCol,
      direction: pw.direction,
      clueNumber: pw.clueNumber,
      isCompleted: false,
    }));

    return {
      id: `puzzle_${Date.now()}`,
      level: words[0]?.level || 'A1',
      category: words[0]?.category || 'food',
      gridSize: this.gridSize,
      words: crosswordWords,
      cells,
      difficulty,
      estimatedTime: this.estimateCompletionTime(crosswordWords, difficulty),
    };
  }

  private reset() {
    this.grid = Array(this.gridSize)
      .fill(null)
      .map(() => Array(this.gridSize).fill(''));
    this.placedWords = [];
    this.clueCounter = 1;
  }

  // 放置第一个单词
  private placeFirstWord(word: Word) {
    const wordLength = word.spanish.length;
    const startRow = Math.floor(this.gridSize / 2);
    const startCol = Math.floor((this.gridSize - wordLength) / 2);

    this.placeWordAt(word, startRow, startCol, 'horizontal');
  }

  // 尝试放置单词
  private placeWord(word: Word): boolean {
    const wordLength = word.spanish.length;
    const attempts = 100;

    for (let attempt = 0; attempt < attempts; attempt++) {
      // 随机选择方向
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';

      // 尝试找到交叉点
      for (const placedWord of this.placedWords) {
        const intersection = this.findIntersection(word.spanish, placedWord.word.spanish);

        if (intersection) {
          const { newWordIndex, existingWordIndex } = intersection;

          let startRow: number, startCol: number;

          if (placedWord.direction === 'horizontal' && direction === 'vertical') {
            startRow = placedWord.startRow - newWordIndex;
            startCol = placedWord.startCol + existingWordIndex;
          } else if (placedWord.direction === 'vertical' && direction === 'horizontal') {
            startRow = placedWord.startRow + existingWordIndex;
            startCol = placedWord.startCol - newWordIndex;
          } else {
            continue;
          }

          if (this.canPlaceWord(word.spanish, startRow, startCol, direction)) {
            this.placeWordAt(word, startRow, startCol, direction);
            return true;
          }
        }
      }
    }

    return false;
  }

  // 查找两个单词的交叉点
  private findIntersection(
    word1: string,
    word2: string
  ): { newWordIndex: number; existingWordIndex: number } | null {
    for (let i = 0; i < word1.length; i++) {
      for (let j = 0; j < word2.length; j++) {
        if (word1[i].toLowerCase() === word2[j].toLowerCase()) {
          return { newWordIndex: i, existingWordIndex: j };
        }
      }
    }
    return null;
  }

  // 检查是否可以放置单词
  private canPlaceWord(
    word: string,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical'
  ): boolean {
    const wordLength = word.length;

    if (direction === 'horizontal') {
      if (startCol < 0 || startCol + wordLength > this.gridSize || startRow < 0 || startRow >= this.gridSize) {
        return false;
      }

      for (let i = 0; i < wordLength; i++) {
        const currentCell = this.grid[startRow][startCol + i];
        if (currentCell !== '' && currentCell.toLowerCase() !== word[i].toLowerCase()) {
          return false;
        }
      }
    } else {
      if (startRow < 0 || startRow + wordLength > this.gridSize || startCol < 0 || startCol >= this.gridSize) {
        return false;
      }

      for (let i = 0; i < wordLength; i++) {
        const currentCell = this.grid[startRow + i][startCol];
        if (currentCell !== '' && currentCell.toLowerCase() !== word[i].toLowerCase()) {
          return false;
        }
      }
    }

    return true;
  }

  // 在指定位置放置单词
  private placeWordAt(
    word: Word,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical'
  ) {
    const wordText = word.spanish;

    if (direction === 'horizontal') {
      for (let i = 0; i < wordText.length; i++) {
        this.grid[startRow][startCol + i] = wordText[i].toUpperCase();
      }
    } else {
      for (let i = 0; i < wordText.length; i++) {
        this.grid[startRow + i][startCol] = wordText[i].toUpperCase();
      }
    }

    this.placedWords.push({
      word,
      startRow,
      startCol,
      direction,
      clueNumber: this.clueCounter++,
    });
  }

  // 生成单元格数据
  private generateCells(difficulty: 'easy' | 'medium' | 'hard'): CrosswordCell[][] {
    const cells: CrosswordCell[][] = Array(this.gridSize)
      .fill(null)
      .map(() =>
        Array(this.gridSize)
          .fill(null)
          .map(() => ({
            row: 0,
            col: 0,
            letter: null,
            correctLetter: '',
            isFixed: false,
            wordIds: [],
          }))
      );

    // 填充单元格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const letter = this.grid[row][col];
        cells[row][col] = {
          row,
          col,
          letter: null,
          correctLetter: letter || '',
          isFixed: false,
          wordIds: this.getWordIdsForCell(row, col),
        };
      }
    }

    // 根据难度添加提示字母
    this.addHintLetters(cells, difficulty);

    return cells;
  }

  // 获取单元格所属的单词ID
  private getWordIdsForCell(row: number, col: number): string[] {
    const wordIds: string[] = [];

    for (const pw of this.placedWords) {
      if (pw.direction === 'horizontal') {
        if (
          pw.startRow === row &&
          col >= pw.startCol &&
          col < pw.startCol + pw.word.spanish.length
        ) {
          wordIds.push(pw.word.id);
        }
      } else {
        if (
          pw.startCol === col &&
          row >= pw.startRow &&
          row < pw.startRow + pw.word.spanish.length
        ) {
          wordIds.push(pw.word.id);
        }
      }
    }

    return wordIds;
  }

  // 添加提示字母
  private addHintLetters(cells: CrosswordCell[][], difficulty: 'easy' | 'medium' | 'hard') {
    const hintRatio = difficulty === 'easy' ? 0.4 : difficulty === 'medium' ? 0.25 : 0.15;

    for (const pw of this.placedWords) {
      const wordLength = pw.word.spanish.length;
      const hintsCount = Math.max(1, Math.floor(wordLength * hintRatio));

      const indices = Array.from({ length: wordLength }, (_, i) => i);
      const shuffled = indices.sort(() => Math.random() - 0.5);
      const hintIndices = shuffled.slice(0, hintsCount);

      for (const idx of hintIndices) {
        const row = pw.direction === 'horizontal' ? pw.startRow : pw.startRow + idx;
        const col = pw.direction === 'horizontal' ? pw.startCol + idx : pw.startCol;

        cells[row][col].isFixed = true;
        cells[row][col].letter = cells[row][col].correctLetter;
      }
    }
  }

  // 估算完成时间
  private estimateCompletionTime(words: CrosswordWord[], difficulty: string): number {
    const totalLetters = words.reduce((sum, w) => sum + w.wordData.spanish.length, 0);
    const baseTime = totalLetters * 3; // 每个字母3秒
    const difficultyMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1.0 : 1.3;
    return Math.floor(baseTime * difficultyMultiplier);
  }
}

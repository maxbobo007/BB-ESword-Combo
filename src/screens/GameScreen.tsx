import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getWordCellCoords } from '../utils/puzzleGenerator';
import { isStrictAccents } from '../utils/text';
import type { CrosswordCell, CrosswordWord, Direction, Word } from '../types/game';

interface Selection {
  row: number;
  col: number;
  direction: Direction;
}

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];
const ACCENT_KEYS = ['Á', 'É', 'Í', 'Ó', 'Ú', 'Ü'];

const article = (word: Word) => (word.gender === 'm' ? 'el' : word.gender === 'f' ? 'la' : null);

export const clueText = (word: Word) => {
  const art = article(word);
  return `${word.chinese} · ${word.english}${art ? `（${art} …）` : ''}`;
};

export const GameScreen: React.FC = () => {
  const {
    currentPuzzle,
    currentSession,
    lastResult,
    lastConfig,
    updateCell,
    revealHint,
    resetGame,
    startNewGame,
  } = useGameStore();
  const { width } = useWindowDimensions();
  const [selection, setSelection] = useState<Selection | null>(null);

  // 按格子找所属单词，方便选中时高亮整词
  const wordsByCell = useMemo(() => {
    const map = new Map<string, CrosswordWord[]>();
    currentPuzzle?.words.forEach(w =>
      getWordCellCoords(w).forEach(({ row, col }) => {
        const k = `${row},${col}`;
        map.set(k, [...(map.get(k) ?? []), w]);
      })
    );
    return map;
  }, [currentPuzzle?.id]);

  const clueNumbers = useMemo(() => {
    const map = new Map<string, number>();
    currentPuzzle?.words.forEach(w => map.set(`${w.startRow},${w.startCol}`, w.clueNumber));
    return map;
  }, [currentPuzzle?.id]);

  if (!currentPuzzle || !currentSession) return null;

  const cells = currentSession.currentCells;
  const cellSize = Math.min(Math.floor((width - 32) / currentPuzzle.cols), 40);
  const strict = isStrictAccents(currentPuzzle.difficulty);

  const activeWord: CrosswordWord | undefined = selection
    ? (wordsByCell.get(`${selection.row},${selection.col}`) ?? []).find(
        w => w.direction === selection.direction
      )
    : undefined;
  const activeCells = new Set(
    activeWord ? getWordCellCoords(activeWord).map(({ row, col }) => `${row},${col}`) : []
  );

  const selectCell = (row: number, col: number) => {
    const words = wordsByCell.get(`${row},${col}`) ?? [];
    if (words.length === 0) return;
    const hasDir = (d: Direction) => words.some(w => w.direction === d);

    let direction: Direction = selection?.direction ?? words[0].direction;
    if (selection && selection.row === row && selection.col === col) {
      // 再点一次同一格：如果横竖都有词，切换方向
      const other: Direction = direction === 'horizontal' ? 'vertical' : 'horizontal';
      if (hasDir(other)) direction = other;
    } else if (!hasDir(direction)) {
      direction = words[0].direction;
    }
    setSelection({ row, col, direction });
  };

  const selectWord = (w: CrosswordWord) => {
    const coords = getWordCellCoords(w);
    const target =
      coords.find(({ row, col }) => !cells[row][col].isFixed && cells[row][col].letter !== cells[row][col].correctLetter) ??
      coords.find(({ row, col }) => !cells[row][col].isFixed) ??
      coords[0];
    setSelection({ ...target, direction: w.direction });
  };

  /** 在当前单词里移动到下一个/上一个可编辑的格子。 */
  const moveWithinWord = (stepBy: 1 | -1) => {
    if (!selection || !activeWord) return selection;
    const coords = getWordCellCoords(activeWord);
    let idx = coords.findIndex(c => c.row === selection.row && c.col === selection.col);
    for (idx += stepBy; idx >= 0 && idx < coords.length; idx += stepBy) {
      const { row, col } = coords[idx];
      if (!cells[row][col].isFixed) return { ...coords[idx], direction: selection.direction };
    }
    return selection;
  };

  const handleKey = (key: string) => {
    if (!selection || currentSession.isCompleted) return;
    const current = cells[selection.row][selection.col];

    if (key === 'DEL') {
      if (current.letter && !current.isFixed) {
        updateCell(selection.row, selection.col, '');
      } else {
        const prev = moveWithinWord(-1);
        if (prev && (prev.row !== selection.row || prev.col !== selection.col)) {
          updateCell(prev.row, prev.col, '');
          setSelection(prev);
        }
      }
      return;
    }

    if (!current.isFixed) updateCell(selection.row, selection.col, key);
    const next = moveWithinWord(1);
    if (next) setSelection(next);
  };

  const renderCell = (cell: CrosswordCell) => {
    const k = `${cell.row},${cell.col}`;
    if (!cell.correctLetter) {
      return <View key={k} style={{ width: cellSize, height: cellSize }} />;
    }
    const isSelected = selection?.row === cell.row && selection?.col === cell.col;
    const inWord = activeCells.has(k);
    // 简单模式下错字标红，帮初学者及时纠正
    const isWrong =
      currentPuzzle.difficulty === 'easy' && !!cell.letter && cell.letter !== cell.correctLetter;
    const number = clueNumbers.get(k);

    return (
      <Pressable
        key={k}
        onPress={() => selectCell(cell.row, cell.col)}
        style={[
          styles.cell,
          { width: cellSize, height: cellSize },
          cell.isFixed && styles.fixedCell,
          inWord && styles.wordCell,
          isSelected && styles.selectedCell,
        ]}
      >
        {number !== undefined && (
          <Text style={[styles.cellNumber, { fontSize: Math.max(8, cellSize * 0.26) }]}>{number}</Text>
        )}
        <Text
          style={[
            styles.cellText,
            { fontSize: cellSize * 0.55 },
            cell.isFixed && styles.fixedCellText,
            isWrong && styles.wrongCellText,
          ]}
        >
          {cell.letter ?? ''}
        </Text>
      </Pressable>
    );
  };

  const renderClueList = (direction: Direction, title: string) => (
    <View style={styles.clueSection}>
      <Text style={styles.clueTitle}>{title}</Text>
      {currentPuzzle.words
        .filter(w => w.direction === direction)
        .map(w => (
          <Pressable key={w.id} onPress={() => selectWord(w)}>
            <Text
              style={[
                styles.clue,
                activeWord?.id === w.id && styles.clueActive,
                w.isCompleted && styles.clueDone,
              ]}
            >
              {w.clueNumber}. {clueText(w.wordData)}
            </Text>
          </Pressable>
        ))}
    </View>
  );

  if (currentSession.isCompleted && lastResult) {
    const learned = new Set(lastResult.learnedWordIds);
    return (
      <ScrollView contentContainerStyle={styles.resultContainer}>
        <Text style={styles.resultTitle}>¡Muy bien! 完成</Text>
        <Text style={styles.resultScore}>{lastResult.score}</Text>
        <Text style={styles.resultMeta}>
          准确率 {Math.round(lastResult.accuracy)}% · 用时 {Math.floor(lastResult.timeTaken / 60)}:
          {String(lastResult.timeTaken % 60).padStart(2, '0')} · 错误 {currentSession.mistakes} · 提示{' '}
          {currentSession.hintsUsed}
        </Text>
        <View style={styles.resultWords}>
          {currentPuzzle.words.map(w => (
            <View key={w.id} style={styles.resultWordRow}>
              <Text style={styles.resultSpanish}>
                {article(w.wordData) ? `${article(w.wordData)} ` : ''}
                {w.wordData.spanish}
              </Text>
              <Text style={styles.resultMeaning}>{w.wordData.chinese}</Text>
              <Text style={learned.has(w.id) ? styles.badgeLearned : styles.badgeHinted}>
                {learned.has(w.id) ? '学会' : '用了提示'}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.resultButtons}>
          {lastConfig && (
            <Pressable style={styles.primaryButton} onPress={() => { setSelection(null); startNewGame(lastConfig); }}>
              <Text style={styles.primaryButtonText}>再来一局</Text>
            </Pressable>
          )}
          <Pressable style={styles.secondaryButton} onPress={resetGame}>
            <Text style={styles.secondaryButtonText}>返回主页</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={resetGame} hitSlop={12}>
          <Text style={styles.backText}>‹ 退出</Text>
        </Pressable>
        <Text style={styles.statText}>
          错误 {currentSession.mistakes} · 提示 {currentSession.hintsUsed}
          {strict ? ' · 重音必填' : ''}
        </Text>
        <Pressable style={styles.hintButton} onPress={() => revealHint(activeWord?.id)}>
          <Text style={styles.hintButtonText}>提示</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.gridContainer}>
          {cells.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map(renderCell)}
            </View>
          ))}
        </View>
        {renderClueList('horizontal', '横向 Horizontal')}
        {renderClueList('vertical', '纵向 Vertical')}
      </ScrollView>

      <View style={styles.clueBar}>
        <Text style={styles.clueBarText} numberOfLines={2}>
          {activeWord
            ? `${activeWord.clueNumber}${activeWord.direction === 'horizontal' ? '→' : '↓'} ${clueText(activeWord.wordData)} · ${getWordCellCoords(activeWord).length} 个字母`
            : '点一个格子或题目开始填'}
        </Text>
      </View>

      <View style={styles.keyboard}>
        <View style={styles.keyboardRow}>
          {ACCENT_KEYS.map(k => (
            <Pressable key={k} style={[styles.key, styles.accentKey]} onPress={() => handleKey(k)}>
              <Text style={styles.keyText}>{k}</Text>
            </Pressable>
          ))}
        </View>
        {KEY_ROWS.map((row, i) => (
          <View key={i} style={styles.keyboardRow}>
            {row.map(k => (
              <Pressable
                key={k}
                style={[styles.key, k === 'DEL' && styles.deleteKey]}
                onPress={() => handleKey(k)}
              >
                <Text style={styles.keyText}>{k === 'DEL' ? '⌫' : k}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backText: { fontSize: 16, color: '#1976D2', fontWeight: '600' },
  statText: { fontSize: 13, color: '#666' },
  hintButton: { backgroundColor: '#4CAF50', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  hintButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  gridContainer: { alignSelf: 'center' },
  row: { flexDirection: 'row' },
  cell: {
    borderWidth: 1,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginLeft: -1,
    marginTop: -1,
  },
  fixedCell: { backgroundColor: '#E3F2FD' },
  wordCell: { backgroundColor: '#FFF8E1' },
  selectedCell: { backgroundColor: '#90CAF9' },
  cellNumber: { position: 'absolute', top: 1, left: 2, color: '#555' },
  cellText: { fontWeight: '600', color: '#222' },
  fixedCellText: { color: '#1976D2' },
  wrongCellText: { color: '#D32F2F' },
  clueSection: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginTop: 16 },
  clueTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  clue: { fontSize: 14, color: '#555', paddingVertical: 4 },
  clueActive: { color: '#1976D2', fontWeight: '600' },
  clueDone: { color: '#9E9E9E', textDecorationLine: 'line-through' },
  clueBar: { backgroundColor: '#1976D2', paddingHorizontal: 16, paddingVertical: 8 },
  clueBarText: { color: '#fff', fontSize: 14 },
  keyboard: { backgroundColor: '#e8e8e8', paddingVertical: 6, paddingHorizontal: 3 },
  keyboardRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 5 },
  key: {
    flex: 1,
    maxWidth: 40,
    marginHorizontal: 2,
    backgroundColor: '#fff',
    paddingVertical: 11,
    borderRadius: 5,
    alignItems: 'center',
  },
  accentKey: { backgroundColor: '#FFF3E0' },
  deleteKey: { flex: 1.6, maxWidth: 64, backgroundColor: '#FFB74D' },
  keyText: { fontSize: 16, fontWeight: '600', color: '#333' },
  resultContainer: { padding: 24, alignItems: 'center' },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 16 },
  resultScore: { fontSize: 56, fontWeight: 'bold', color: '#1976D2', marginVertical: 8 },
  resultMeta: { fontSize: 14, color: '#666', textAlign: 'center' },
  resultWords: { alignSelf: 'stretch', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginTop: 20 },
  resultWordRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  resultSpanish: { fontSize: 16, fontWeight: '600', color: '#222', flex: 1 },
  resultMeaning: { fontSize: 14, color: '#666', flex: 1 },
  badgeLearned: { fontSize: 12, color: '#2E7D32' },
  badgeHinted: { fontSize: 12, color: '#EF6C00' },
  resultButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  primaryButton: { backgroundColor: '#1976D2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1976D2' },
  secondaryButtonText: { color: '#1976D2', fontSize: 16, fontWeight: '600' },
});

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { CrosswordCell, CrosswordWord } from '@/types/game';
import { Dialog } from '@/components/Dialog';
import { SPANISH_ALPHABET, normalizeLetter, normalizeWord } from '@/utils/letters';

type Direction = 'horizontal' | 'vertical';
interface Pos {
  row: number;
  col: number;
}

const KEY_ROWS = [SPANISH_ALPHABET.slice(0, 10), SPANISH_ALPHABET.slice(10, 19), SPANISH_ALPHABET.slice(19)];

const wordCells = (w: CrosswordWord): Pos[] =>
  Array.from({ length: normalizeWord(w.wordData.spanish).length }, (_, i) =>
    w.direction === 'horizontal'
      ? { row: w.startRow, col: w.startCol + i }
      : { row: w.startRow + i, col: w.startCol }
  );

export const GameScreen: React.FC = () => {
  const { currentPuzzle, currentSession, updateCell, useHint, resetGame } = useGameStore();
  const { width, height } = useWindowDimensions();

  const [selected, setSelected] = useState<Pos | null>(null);
  const [direction, setDirection] = useState<Direction>('horizontal');
  const [confirmQuit, setConfirmQuit] = useState(false);

  const cells = currentSession?.currentCells;
  const words = currentPuzzle?.words ?? [];

  // 只显示用到的区域 (crop the grid to the used area)
  const bounds = useMemo(() => {
    if (!cells) return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };
    let minRow = Infinity, maxRow = -1, minCol = Infinity, maxCol = -1;
    cells.forEach((line, r) =>
      line.forEach((cell, c) => {
        if (!cell.correctLetter) return;
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      })
    );
    return { minRow, maxRow, minCol, maxCol };
  }, [cells]);

  const cols = bounds.maxCol - bounds.minCol + 1;
  const rows = bounds.maxRow - bounds.minRow + 1;
  const contentWidth = Math.min(width, 720) - 40;
  const cellSize = Math.floor(Math.max(24, Math.min(contentWidth / cols, (height * 0.5) / rows, 48)));

  const clueNumbers = useMemo(() => {
    const map = new Map<string, number>();
    words.forEach(w => map.set(`${w.startRow}-${w.startCol}`, w.clueNumber));
    return map;
  }, [words]);

  const activeWord = useMemo(() => {
    if (!selected) return null;
    const containing = words.filter(w =>
      wordCells(w).some(p => p.row === selected.row && p.col === selected.col)
    );
    return containing.find(w => w.direction === direction) ?? containing[0] ?? null;
  }, [selected, direction, words]);

  const activeKeys = useMemo(
    () => new Set(activeWord ? wordCells(activeWord).map(p => `${p.row}-${p.col}`) : []),
    [activeWord]
  );

  const isPlayable = useCallback(
    (p: Pos) => {
      const cell = cells?.[p.row]?.[p.col];
      return !!cell && !!cell.correctLetter && !cell.isFixed;
    },
    [cells]
  );

  const selectCell = (p: Pos) => {
    const cell = cells?.[p.row]?.[p.col];
    if (!cell?.correctLetter) return;
    if (selected && selected.row === p.row && selected.col === p.col) {
      // 再次点击同一格：切换方向 (tap again to switch direction)
      setDirection(d => (d === 'horizontal' ? 'vertical' : 'horizontal'));
      return;
    }
    const owners = words.filter(w => cell.wordIds.includes(w.id));
    if (owners.length === 1) setDirection(owners[0].direction);
    setSelected(p);
  };

  const selectWord = (w: CrosswordWord) => {
    const path = wordCells(w);
    const firstOpen =
      path.find(p => isPlayable(p) && cells?.[p.row][p.col].letter !== cells?.[p.row][p.col].correctLetter) ??
      path.find(isPlayable) ??
      path[0];
    setDirection(w.direction);
    setSelected(firstOpen);
  };

  // 在当前单词内移动光标，跳过提示格 (move within the word, skipping fixed cells)
  const step = useCallback(
    (from: Pos, delta: 1 | -1): Pos | null => {
      if (!activeWord) return null;
      const path = wordCells(activeWord);
      let i = path.findIndex(p => p.row === from.row && p.col === from.col) + delta;
      while (i >= 0 && i < path.length) {
        if (isPlayable(path[i])) return path[i];
        i += delta;
      }
      return null;
    },
    [activeWord, isPlayable]
  );

  const inputLetter = useCallback(
    (letter: string) => {
      if (!selected || !isPlayable(selected)) return;
      updateCell(selected.row, selected.col, letter);
      const next = step(selected, 1);
      if (next) setSelected(next);
    },
    [selected, isPlayable, updateCell, step]
  );

  const deleteLetter = useCallback(() => {
    if (!selected) return;
    const cell = cells?.[selected.row]?.[selected.col];
    if (cell && !cell.isFixed && cell.letter) {
      updateCell(selected.row, selected.col, '');
      return;
    }
    const prev = step(selected, -1);
    if (prev) {
      updateCell(prev.row, prev.col, '');
      setSelected(prev);
    }
  }, [selected, cells, updateCell, step]);

  const moveArrow = useCallback(
    (dr: number, dc: number) => {
      if (!cells) return;
      let p = selected ?? { row: bounds.minRow, col: bounds.minCol };
      for (let i = 0; i < 15; i++) {
        p = { row: p.row + dr, col: p.col + dc };
        if (!cells[p.row]?.[p.col]) return;
        if (cells[p.row][p.col].correctLetter) {
          setDirection(dr !== 0 ? 'vertical' : 'horizontal');
          setSelected(p);
          return;
        }
      }
    },
    [cells, selected, bounds]
  );

  // 电脑键盘输入（仅 Web）(physical keyboard, web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (confirmQuit || currentSession?.isCompleted || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        deleteLetter();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveArrow(-1, 0);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveArrow(1, 0);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveArrow(0, -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveArrow(0, 1);
      } else if (e.key.length === 1 && SPANISH_ALPHABET.includes(normalizeLetter(e.key))) {
        e.preventDefault();
        inputLetter(e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputLetter, deleteLetter, moveArrow, confirmQuit, currentSession?.isCompleted]);

  if (!currentPuzzle || !currentSession || !cells) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>请从主菜单选择游戏</Text>
      </View>
    );
  }

  const renderCell = (cell: CrosswordCell) => {
    const key = `${cell.row}-${cell.col}`;
    if (!cell.correctLetter) {
      return <View key={key} style={{ width: cellSize, height: cellSize }} />;
    }
    const isSelected = selected?.row === cell.row && selected?.col === cell.col;
    const inWord = activeKeys.has(key);
    const isWrong = !!cell.letter && cell.letter !== cell.correctLetter;
    const number = clueNumbers.get(key);

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.cell,
          { width: cellSize, height: cellSize },
          cell.isFixed && styles.fixedCell,
          inWord && styles.wordCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => selectCell({ row: cell.row, col: cell.col })}
        accessibilityLabel={`${cell.row + 1}行${cell.col + 1}列 ${cell.letter ?? '空'}`}
      >
        {number !== undefined && (
          <Text style={[styles.cellNumber, { fontSize: Math.max(8, cellSize * 0.26) }]}>{number}</Text>
        )}
        <Text
          style={[
            styles.cellText,
            { fontSize: cellSize * 0.55 },
            cell.isFixed && styles.fixedCellText,
            isWrong && styles.wrongText,
          ]}
        >
          {cell.letter || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderClueList = (dir: Direction, label: string) => (
    <View style={styles.clueSection}>
      <Text style={styles.clueTitle}>{label}</Text>
      {words
        .filter(w => w.direction === dir)
        .sort((a, b) => a.clueNumber - b.clueNumber)
        .map(w => {
          const active = activeWord?.id === w.id;
          const solved = wordCells(w).every(
            p => cells[p.row][p.col].letter === cells[p.row][p.col].correctLetter
          );
          return (
            <TouchableOpacity key={w.id} onPress={() => selectWord(w)}>
              <Text style={[styles.clue, active && styles.clueActive, solved && styles.clueSolved]}>
                {w.clueNumber}. {w.wordData.english}（{w.wordData.chinese}）·{' '}
                {normalizeWord(w.wordData.spanish).length}
              </Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );

  const answers = [...words]
    .sort((a, b) => a.clueNumber - b.clueNumber)
    .map(w => `${w.wordData.spanish} — ${w.wordData.chinese}`)
    .join('\n');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setConfirmQuit(true)} accessibilityRole="button">
            <Text style={styles.backText}>‹ 返回</Text>
          </TouchableOpacity>
          <Text style={styles.title}>西语填字</Text>
          <View style={{ width: 56 }} />
        </View>
        <View style={styles.stats}>
          <Text style={styles.statText}>错误 Errores: {currentSession.mistakes}</Text>
          <Text style={styles.statText}>提示 Pistas: {currentSession.hintsUsed}</Text>
          <TouchableOpacity style={styles.hintButton} onPress={useHint} accessibilityRole="button">
            <Text style={styles.hintButtonText}>使用提示</Text>
          </TouchableOpacity>
        </View>
        {activeWord && (
          <Text style={styles.currentClue} numberOfLines={1}>
            {activeWord.clueNumber}
            {activeWord.direction === 'horizontal' ? '→' : '↓'} {activeWord.wordData.english}（
            {activeWord.wordData.chinese}）
          </Text>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.gridContainer}>
          {cells.slice(bounds.minRow, bounds.maxRow + 1).map((line, i) => (
            <View key={i} style={styles.row}>
              {line.slice(bounds.minCol, bounds.maxCol + 1).map(renderCell)}
            </View>
          ))}
        </View>

        <View style={styles.cluesContainer}>
          {renderClueList('horizontal', '横向 Horizontal →')}
          {renderClueList('vertical', '纵向 Vertical ↓')}
        </View>
      </ScrollView>

      <View style={styles.keyboard}>
        {KEY_ROWS.map((keys, i) => (
          <View key={i} style={styles.keyboardRow}>
            {keys.map(letter => (
              <TouchableOpacity key={letter} style={styles.key} onPress={() => inputLetter(letter)}>
                <Text style={styles.keyText}>{letter}</Text>
              </TouchableOpacity>
            ))}
            {i === KEY_ROWS.length - 1 && (
              <TouchableOpacity style={[styles.key, styles.deleteKey]} onPress={deleteLetter}>
                <Text style={styles.keyText}>⌫</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <Dialog
        visible={currentSession.isCompleted}
        title="¡Enhorabuena! 恭喜完成"
        message={`得分: ${currentSession.score ?? 0}\n错误: ${currentSession.mistakes}　提示: ${currentSession.hintsUsed}\n\n${answers}`}
        actions={[{ label: '返回主页', onPress: resetGame, primary: true }]}
        onRequestClose={resetGame}
      />

      <Dialog
        visible={confirmQuit && !currentSession.isCompleted}
        title="退出本局？"
        message="当前进度不会保存。"
        actions={[
          { label: '继续玩', onPress: () => setConfirmQuit(false) },
          {
            label: '退出',
            primary: true,
            onPress: () => {
              setConfirmQuit(false);
              resetGame();
            },
          },
        ]}
        onRequestClose={() => setConfirmQuit(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, color: '#1976D2', fontWeight: '600', width: 56 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  statText: { fontSize: 14, color: '#666' },
  hintButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  hintButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  currentClue: {
    marginTop: 8,
    fontSize: 15,
    color: '#0D47A1',
    backgroundColor: '#E3F2FD',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  scrollView: { flex: 1 },
  content: { padding: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  gridContainer: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: { flexDirection: 'row' },
  cell: {
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  wordCell: { backgroundColor: '#E3F2FD' },
  selectedCell: { backgroundColor: '#90CAF9' },
  fixedCell: { backgroundColor: '#F1F8FF' },
  cellNumber: { position: 'absolute', top: 1, left: 2, color: '#555' },
  cellText: { fontWeight: '600', color: '#333' },
  fixedCellText: { color: '#1976D2' },
  wrongText: { color: '#D32F2F' },
  cluesContainer: { marginTop: 24, gap: 16 },
  clueSection: { backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  clueTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  clue: { fontSize: 15, color: '#555', paddingVertical: 4 },
  clueActive: { color: '#0D47A1', fontWeight: '700' },
  clueSolved: { color: '#9E9E9E', textDecorationLine: 'line-through' },
  keyboard: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  keyboardRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 4, gap: 4 },
  key: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 4,
    minWidth: 30,
    flexShrink: 1,
    alignItems: 'center',
  },
  deleteKey: { backgroundColor: '#ff9800', minWidth: 44 },
  keyText: { fontSize: 16, fontWeight: '600', color: '#333' },
});

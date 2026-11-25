import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { CrosswordCell, CrosswordWord } from '@/types/game';
import { Dialog } from '@/components/Dialog';

type Direction = CrosswordWord['direction'];

const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'].map(r => r.split(''));
const MAX_CONTENT_WIDTH = 640;

// 单词覆盖的所有格子坐标
const cellsOf = (word: CrosswordWord) => {
  const length = [...word.wordData.spanish.normalize('NFC')].length;
  return Array.from({ length }, (_, i) =>
    word.direction === 'horizontal'
      ? { row: word.startRow, col: word.startCol + i }
      : { row: word.startRow + i, col: word.startCol }
  );
};

export const GameScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { currentPuzzle, currentSession, updateCell, revealHint, resetGame } = useGameStore();

  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<Direction>('horizontal');
  const [confirmExit, setConfirmExit] = useState(false);

  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const cols = currentPuzzle?.cols ?? 1;
  const cellSize = Math.max(22, Math.min(44, Math.floor((contentWidth - 40) / cols)));
  const keyWidth = Math.floor((contentWidth - 16 - 9 * 5) / 10);

  const goHome = useCallback(() => {
    setConfirmExit(false);
    resetGame();
    router.replace('/');
  }, [resetGame, router]);

  // 每个单词起点格子对应的题号
  const clueNumberAt = useMemo(() => {
    const map = new Map<string, number>();
    currentPuzzle?.words.forEach(w => map.set(`${w.startRow}-${w.startCol}`, w.clueNumber));
    return map;
  }, [currentPuzzle]);

  // 当前选中格子所在、并且方向匹配的单词
  const activeWord = useMemo(() => {
    if (!selected || !currentPuzzle) return null;
    const containing = currentPuzzle.words.filter(w =>
      cellsOf(w).some(c => c.row === selected.row && c.col === selected.col)
    );
    return containing.find(w => w.direction === direction) ?? containing[0] ?? null;
  }, [selected, direction, currentPuzzle]);

  const activeCells = useMemo(
    () => new Set(activeWord ? cellsOf(activeWord).map(c => `${c.row}-${c.col}`) : []),
    [activeWord]
  );

  const selectWord = (word: CrosswordWord) => {
    setDirection(word.direction);
    const cells = currentSession?.currentCells;
    const firstEditable = cellsOf(word).find(
      c => cells && !cells[c.row][c.col].isFixed && cells[c.row][c.col].letter === null
    );
    setSelected(firstEditable ?? cellsOf(word)[0]);
  };

  const handleCellPress = (cell: CrosswordCell) => {
    if (!cell.correctLetter) return;
    if (selected?.row === cell.row && selected?.col === cell.col && cell.wordIds.length > 1) {
      setDirection(d => (d === 'horizontal' ? 'vertical' : 'horizontal'));
      return;
    }
    if (activeWord && !activeCells.has(`${cell.row}-${cell.col}`)) {
      // 换到别的单词时，优先沿用该格子唯一所属单词的方向
      const owner = currentPuzzle?.words.find(w => w.id === cell.wordIds[0]);
      if (cell.wordIds.length === 1 && owner) setDirection(owner.direction);
    }
    setSelected({ row: cell.row, col: cell.col });
  };

  // 在当前单词里按方向找下一个/上一个可编辑格子
  const moveWithinWord = useCallback(
    (from: { row: number; col: number }, delta: 1 | -1) => {
      if (!activeWord || !currentSession) return null;
      const cells = cellsOf(activeWord);
      let i = cells.findIndex(c => c.row === from.row && c.col === from.col) + delta;
      while (i >= 0 && i < cells.length) {
        const c = cells[i];
        if (!currentSession.currentCells[c.row][c.col].isFixed) return c;
        i += delta;
      }
      return null;
    },
    [activeWord, currentSession]
  );

  const handleLetter = useCallback(
    (letter: string) => {
      if (!selected || !currentSession) return;
      const cell = currentSession.currentCells[selected.row][selected.col];
      const target = cell.isFixed ? moveWithinWord(selected, 1) : selected;
      if (!target) return;
      updateCell(target.row, target.col, letter);
      const next = moveWithinWord(target, 1);
      if (next) setSelected(next);
      else setSelected(target);
    },
    [selected, currentSession, moveWithinWord, updateCell]
  );

  const handleDelete = useCallback(() => {
    if (!selected || !currentSession) return;
    const cell = currentSession.currentCells[selected.row][selected.col];
    if (!cell.isFixed && cell.letter) {
      updateCell(selected.row, selected.col, '');
      return;
    }
    const prev = moveWithinWord(selected, -1);
    if (prev) {
      updateCell(prev.row, prev.col, '');
      setSelected(prev);
    }
  }, [selected, currentSession, moveWithinWord, updateCell]);

  // 电脑/网页端：支持实体键盘输入
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (/^[a-zA-ZñÑáéíóúüÁÉÍÓÚÜ]$/.test(e.key)) {
        handleLetter(e.key.toUpperCase());
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleLetter, handleDelete]);

  if (!currentPuzzle || !currentSession) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>没有进行中的关卡</Text>
        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={goHome}>
          <Text style={styles.primaryButtonText}>返回主页</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const byNumber = [...currentPuzzle.words].sort((a, b) => a.clueNumber - b.clueNumber);
  const clueText = (w: CrosswordWord) => `${w.wordData.english}（${w.wordData.chinese}）`;

  const renderCell = (cell: CrosswordCell) => {
    const key = `${cell.row}-${cell.col}`;
    if (!cell.correctLetter) {
      return <View key={key} style={{ width: cellSize, height: cellSize }} />;
    }
    const isSelected = selected?.row === cell.row && selected?.col === cell.col;
    const clueNumber = clueNumberAt.get(key);
    return (
      <Pressable
        key={key}
        accessibilityLabel={`第 ${cell.row + 1} 行第 ${cell.col + 1} 列`}
        onPress={() => handleCellPress(cell)}
        style={[
          styles.cell,
          { width: cellSize, height: cellSize },
          activeCells.has(key) && styles.activeCell,
          cell.isFixed && styles.fixedCell,
          isSelected && styles.selectedCell,
        ]}
      >
        {clueNumber !== undefined && (
          <Text style={[styles.clueNumber, { fontSize: Math.max(8, cellSize * 0.28) }]}>
            {clueNumber}
          </Text>
        )}
        <Text
          style={[
            styles.cellText,
            { fontSize: cellSize * 0.55 },
            cell.isFixed && styles.fixedCellText,
          ]}
        >
          {cell.letter || ''}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" style={styles.exitButton} onPress={() => setConfirmExit(true)}>
          <Text style={styles.exitText}>退出</Text>
        </Pressable>
        <Text style={styles.stat}>错误 {currentSession.mistakes}</Text>
        <Text style={styles.stat}>提示 {currentSession.hintsUsed}</Text>
        <Pressable accessibilityRole="button" style={styles.hintButton} onPress={revealHint}>
          <Text style={styles.hintText}>提示一个字母</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {currentSession.currentCells.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map(renderCell)}
            </View>
          ))}
        </View>

        <View style={styles.clues}>
          {(['horizontal', 'vertical'] as Direction[]).map(dir => (
            <View key={dir} style={styles.clueSection}>
              <Text style={styles.clueTitle}>{dir === 'horizontal' ? '横向' : '纵向'}</Text>
              {byNumber
                .filter(w => w.direction === dir)
                .map(w => (
                  <Pressable key={w.id} onPress={() => selectWord(w)}>
                    <Text style={[styles.clue, activeWord?.id === w.id && styles.clueActive]}>
                      {w.clueNumber}. {clueText(w)}
                    </Text>
                  </Pressable>
                ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.keyboardArea}>
        <Text style={styles.currentClue} numberOfLines={1}>
          {activeWord
            ? `${activeWord.clueNumber} ${activeWord.direction === 'horizontal' ? '横' : '纵'} · ${clueText(activeWord)}`
            : '点一个格子开始填写'}
        </Text>
        {KEY_ROWS.map((row, i) => (
          <View key={i} style={styles.keyRow}>
            {row.map(letter => (
              <Pressable
                key={letter}
                accessibilityRole="button"
                accessibilityLabel={letter}
                onPress={() => handleLetter(letter)}
                style={({ pressed }) => [styles.key, { width: keyWidth }, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyText}>{letter}</Text>
              </Pressable>
            ))}
            {i === KEY_ROWS.length - 1 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="删除"
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.key,
                  styles.deleteKey,
                  { width: keyWidth * 2 + 5 },
                  pressed && styles.keyPressed,
                ]}
              >
                <Text style={[styles.keyText, styles.deleteText]}>删除</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Dialog
        visible={confirmExit}
        title="退出本局？"
        message="当前进度不会保存。"
        onRequestClose={() => setConfirmExit(false)}
        actions={[
          { label: '继续游戏', onPress: () => setConfirmExit(false) },
          { label: '退出', variant: 'danger', onPress: goHome },
        ]}
      />
      <Dialog
        visible={currentSession.isCompleted}
        title="恭喜完成！"
        message={`得分：${currentSession.score ?? 0}\n错误：${currentSession.mistakes}\n提示：${currentSession.hintsUsed}`}
        onRequestClose={goHome}
        actions={[{ label: '返回主页', variant: 'primary', onPress: goHome }]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { fontSize: 17, color: '#555' },
  primaryButton: { backgroundColor: '#1976D2', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exitButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#1976D2' },
  exitText: { color: '#1976D2', fontSize: 14, fontWeight: '600' },
  stat: { fontSize: 14, color: '#666' },
  hintButton: { marginLeft: 'auto', backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  hintText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  scrollContent: { padding: 16, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  grid: { alignSelf: 'center', padding: 4, backgroundColor: '#fff', borderRadius: 8 },
  row: { flexDirection: 'row' },
  cell: {
    borderWidth: 1,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeCell: { backgroundColor: '#E3F2FD' },
  fixedCell: { backgroundColor: '#EEF4FB' },
  selectedCell: { backgroundColor: '#90CAF9' },
  clueNumber: { position: 'absolute', top: 0, left: 2, color: '#555' },
  cellText: { fontWeight: '600', color: '#222' },
  fixedCellText: { color: '#1976D2' },
  clues: { marginTop: 20, gap: 12 },
  clueSection: { backgroundColor: '#fff', padding: 14, borderRadius: 8 },
  clueTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  clue: { fontSize: 14, color: '#555', paddingVertical: 4 },
  clueActive: { color: '#1976D2', fontWeight: '700' },
  keyboardArea: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  currentClue: { fontSize: 14, color: '#1976D2', fontWeight: '600', marginBottom: 6, maxWidth: MAX_CONTENT_WIDTH },
  keyRow: { flexDirection: 'row', gap: 5, marginBottom: 6 },
  key: { backgroundColor: '#e3e6ea', paddingVertical: 11, borderRadius: 5, alignItems: 'center' },
  keyPressed: { backgroundColor: '#c5cad1' },
  deleteKey: { backgroundColor: '#ff9800' },
  keyText: { fontSize: 16, fontWeight: '600', color: '#333' },
  deleteText: { color: '#fff', fontSize: 14 },
});

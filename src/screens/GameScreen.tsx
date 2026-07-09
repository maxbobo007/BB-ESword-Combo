import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import {
  Appbar,
  Chip,
  Text,
  Button,
  Portal,
  Dialog,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useWordPackStore, getActiveWords, findPack } from '@/store/wordPackStore';
import { speech } from '@/services/speech';
import { PuzzleGenerator } from '@/core/engine/puzzleGenerator';
import { normalizeLetter } from '@/core/engine/normalize';
import { findWordAt, nextEditableCell, wordCells } from '@/core/engine/cursor';
import { Direction } from '@/core/types/game';
import { getDailyPuzzle } from '@/core/daily/daily';
import { filterWords, pickRandomWords } from '@/core/data/words';
import { localDateString } from '@/core/progress/streak';
import { RootStackParamList } from '@/navigation/types';
import { Grid } from '@/components/Grid';
import { Keyboard } from '@/components/Keyboard';
import { ClueList } from '@/components/ClueList';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const {
    currentPuzzle,
    currentSession,
    recentlyCompletedWord,
    startGame,
    updateCell,
    useHint,
    resetGame,
    clearRecentlyCompletedWord,
  } = useGameStore();
  const ttsEnabled = useSettingsStore(s => s.ttsEnabled);
  const useSystemKeyboard = useSettingsStore(s => s.useSystemKeyboard);
  const setUseSystemKeyboard = useSettingsStore(s => s.setUseSystemKeyboard);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<Direction>('horizontal');
  const [speechReady, setSpeechReady] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [generationFailed, setGenerationFailed] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);

  // 系统键盘模式下，选中格子即拉起输入法
  useEffect(() => {
    if (useSystemKeyboard && selectedCell) {
      hiddenInputRef.current?.focus();
    }
    if (!useSystemKeyboard) {
      hiddenInputRef.current?.blur();
    }
  }, [useSystemKeyboard, selectedCell]);

  useEffect(() => {
    let mounted = true;
    speech.init().then(ok => mounted && setSpeechReady(ok));
    return () => {
      mounted = false;
      speech.stop();
    };
  }, []);

  // 谜题在进入页面时生成；退出页面清空临时状态
  useEffect(() => {
    const params = route.params;
    const packState = useWordPackStore.getState();
    let puzzle;
    if (params.mode === 'daily') {
      puzzle = getDailyPuzzle(localDateString());
    } else if (params.mode === 'pack') {
      const pack = findPack(packState, params.packId);
      puzzle = new PuzzleGenerator(15).generatePuzzle(
        pickRandomWords(pack?.words ?? [], 8),
        params.difficulty,
      );
    } else {
      const pool = filterWords(getActiveWords(packState), params.level, params.category);
      puzzle = new PuzzleGenerator(15).generatePuzzle(pickRandomWords(pool, 8), params.difficulty);
    }

    if (puzzle.words.length < 4) {
      setGenerationFailed(true);
      return;
    }
    startGame(puzzle);
    return () => resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 单词首次填对：提示 + 按设置自动朗读带重音的原词
  useEffect(() => {
    if (!recentlyCompletedWord) {
      return;
    }
    const { wordData } = recentlyCompletedWord;
    setSnackbar(`✓ ${wordData.spanish} — ${wordData.chinese}`);
    if (speechReady && ttsEnabled) {
      speech.speak(wordData.spanish);
    }
    clearRecentlyCompletedWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentlyCompletedWord]);

  const completed = currentSession?.isCompleted ?? false;

  // 当前单词（沿其自动跳格 + 整词高亮）
  const activeWord = useMemo(() => {
    if (!currentPuzzle || !selectedCell) {
      return undefined;
    }
    return findWordAt(currentPuzzle.words, selectedCell.row, selectedCell.col, direction);
  }, [currentPuzzle, selectedCell, direction]);

  const activeWordKeys = useMemo(
    () =>
      activeWord ? new Set(wordCells(activeWord).map(p => `${p.row}-${p.col}`)) : undefined,
    [activeWord],
  );

  const handleCellPress = (row: number, col: number) => {
    if (!currentSession || !currentPuzzle) {
      return;
    }
    if (!currentSession.currentCells[row][col].correctLetter) {
      return;
    }
    // 重复点同一格：在横/纵单词间切换
    if (selectedCell?.row === row && selectedCell?.col === col) {
      const other: Direction = direction === 'horizontal' ? 'vertical' : 'horizontal';
      if (findWordAt(currentPuzzle.words, row, col, other)?.direction === other) {
        setDirection(other);
      }
      return;
    }
    setSelectedCell({ row, col });
    const word = findWordAt(currentPuzzle.words, row, col, direction);
    if (word && word.direction !== direction) {
      setDirection(word.direction);
    }
  };

  const handleLetterInput = (letter: string) => {
    if (!selectedCell || !currentSession) {
      return;
    }
    updateCell(selectedCell.row, selectedCell.col, letter);
    // 填入字母后沿当前单词跳到下一个可编辑格
    if (letter && activeWord) {
      const next = nextEditableCell(
        activeWord,
        currentSession.currentCells,
        selectedCell.row,
        selectedCell.col,
      );
      if (next) {
        setSelectedCell(next);
      }
    }
  };

  // 系统键盘：隐藏输入框保持一个哨兵空格，退格触发删除、其余取末位字符归一化
  const handleSystemInput = (text: string) => {
    if (text.length === 0) {
      handleLetterInput('');
      return;
    }
    const ch = normalizeLetter(text[text.length - 1]);
    if (/^[A-ZÑ]$/.test(ch)) {
      handleLetterInput(ch);
    }
  };

  const title =
    route.params.mode === 'daily'
      ? '今日挑战'
      : route.params.mode === 'pack'
        ? '自定义词库'
        : `${route.params.level} · ${route.params.difficulty === 'easy' ? '简单' : route.params.difficulty === 'medium' ? '中等' : '困难'}`;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <Appbar.Header mode="small" elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={title} />
        <Appbar.Action
          icon={useSystemKeyboard ? 'keyboard-outline' : 'keyboard-off-outline'}
          onPress={() => setUseSystemKeyboard(!useSystemKeyboard)}
          accessibilityLabel="切换系统键盘"
        />
        <Button
          mode="contained-tonal"
          compact
          icon="lightbulb-on-outline"
          onPress={useHint}
          disabled={!currentSession || completed}
        >
          提示
        </Button>
      </Appbar.Header>

      {!currentPuzzle || !currentSession ? (
        <View style={styles.loading}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {generationFailed ? '' : '正在生成谜题…'}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsBar}>
            <Chip compact icon="close-circle-outline">
              错误 {currentSession.mistakes}
            </Chip>
            <Chip compact icon="lightbulb-outline">
              提示 {currentSession.hintsUsed}
            </Chip>
            <Chip compact icon="check-circle-outline">
              {currentPuzzle.words.filter(w => w.isCompleted).length}/{currentPuzzle.words.length}
            </Chip>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Grid
              cells={currentSession.currentCells}
              selectedCell={selectedCell}
              activeWordKeys={activeWordKeys}
              onCellPress={handleCellPress}
            />
            <ClueList
              words={currentPuzzle.words}
              onSpeakWord={speechReady ? word => speech.speak(word.wordData.spanish) : undefined}
            />
          </ScrollView>

          {useSystemKeyboard ? (
            <TextInput
              ref={hiddenInputRef}
              style={styles.hiddenInput}
              value=" "
              onChangeText={handleSystemInput}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              caretHidden
              contextMenuHidden
            />
          ) : (
            <Keyboard onKeyPress={handleLetterInput} onDelete={() => handleLetterInput('')} />
          )}
        </>
      )}

      <Portal>
        <Dialog visible={completed} dismissable={false}>
          <Dialog.Icon icon="trophy" color={theme.colors.primary} />
          <Dialog.Title style={styles.centerText}>恭喜完成！</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge" style={styles.centerText}>
              得分 {currentSession?.score} · 错误 {currentSession?.mistakes} · 提示{' '}
              {currentSession?.hintsUsed}
            </Text>
            {useGameStore.getState().lastUnlockedAchievements.map(a => (
              <Text key={a.id} variant="bodyMedium" style={[styles.centerText, styles.achievement]}>
                🎉 解锁成就：{a.icon} {a.title}
              </Text>
            ))}
          </Dialog.Content>
          <Dialog.Actions style={styles.centerActions}>
            <Button mode="contained" onPress={() => navigation.goBack()}>
              返回主页
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={generationFailed} dismissable={false}>
          <Dialog.Title>无法生成谜题</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">该组合的可用单词不足，请换一个主题或词库。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => navigation.goBack()}>返回</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={snackbar !== ''} onDismiss={() => setSnackbar('')} duration={1800}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: { padding: 16, paddingTop: 4 },
  centerText: { textAlign: 'center' },
  centerActions: { justifyContent: 'center' },
  achievement: { marginTop: 8 },
  hiddenInput: {
    position: 'absolute',
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },
});

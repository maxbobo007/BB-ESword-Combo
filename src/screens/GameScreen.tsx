import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [speechReady, setSpeechReady] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [generationFailed, setGenerationFailed] = useState(false);

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

  const handleCellPress = (row: number, col: number) => {
    if (!currentSession) {
      return;
    }
    if (currentSession.currentCells[row][col].correctLetter) {
      setSelectedCell({ row, col });
    }
  };

  const handleLetterInput = (letter: string) => {
    if (selectedCell) {
      updateCell(selectedCell.row, selectedCell.col, letter);
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

          <ScrollView contentContainerStyle={styles.content}>
            <Grid
              cells={currentSession.currentCells}
              selectedCell={selectedCell}
              onCellPress={handleCellPress}
            />
            <ClueList
              words={currentPuzzle.words}
              onSpeakWord={speechReady ? word => speech.speak(word.wordData.spanish) : undefined}
            />
          </ScrollView>

          <Keyboard onKeyPress={handleLetterInput} onDelete={() => handleLetterInput('')} />
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
});

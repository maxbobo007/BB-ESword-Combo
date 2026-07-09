import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { speech } from '@/services/speech';
import { PuzzleGenerator } from '@/core/engine/puzzleGenerator';
import { getDailyPuzzle } from '@/core/daily/daily';
import { getRandomWords } from '@/core/data/words';
import { localDateString } from '@/core/progress/streak';
import { RootStackParamList } from '@/navigation/types';
import { Grid } from '@/components/Grid';
import { Keyboard } from '@/components/Keyboard';
import { ClueList } from '@/components/ClueList';
import { Theme } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  useEffect(() => {
    let mounted = true;
    speech.init().then(ok => mounted && setSpeechReady(ok));
    return () => {
      mounted = false;
      speech.stop();
    };
  }, []);

  // 单词首次填对：按设置自动朗读带重音的原词
  useEffect(() => {
    if (!recentlyCompletedWord) {
      return;
    }
    if (speechReady && ttsEnabled) {
      speech.speak(recentlyCompletedWord.wordData.spanish);
    }
    clearRecentlyCompletedWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentlyCompletedWord]);

  // 谜题在进入页面时生成；退出页面清空临时状态
  useEffect(() => {
    const params = route.params;
    const puzzle =
      params.mode === 'daily'
        ? getDailyPuzzle(localDateString())
        : new PuzzleGenerator(15).generatePuzzle(
            getRandomWords(8, params.level, params.category),
            params.difficulty,
          );

    if (puzzle.words.length < 4) {
      Alert.alert('提示', '该组合的单词数量不足，请选择其他主题', [
        { text: '返回', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    startGame(puzzle);
    return () => resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentSession?.isCompleted) {
      const unlocked = useGameStore.getState().lastUnlockedAchievements;
      const achievementLines =
        unlocked.length > 0
          ? `\n\n🎉 解锁成就:\n${unlocked.map(a => `${a.icon} ${a.title}`).join('\n')}`
          : '';
      Alert.alert(
        '恭喜完成!',
        `得分: ${currentSession.score}\n错误: ${currentSession.mistakes}\n提示使用: ${currentSession.hintsUsed}${achievementLines}`,
        [{ text: '返回', onPress: () => navigation.goBack() }],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.isCompleted]);

  if (!currentPuzzle || !currentSession) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>正在生成谜题…</Text>
      </View>
    );
  }

  const handleCellPress = (row: number, col: number) => {
    const cell = currentSession.currentCells[row][col];
    if (!cell.correctLetter) {
      return;
    }
    setSelectedCell({ row, col });
  };

  const handleLetterInput = (letter: string) => {
    if (!selectedCell) {
      return;
    }
    updateCell(selectedCell.row, selectedCell.col, letter);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stats}>
          <Text style={styles.statText}>错误: {currentSession.mistakes}</Text>
          <Text style={styles.statText}>提示: {currentSession.hintsUsed}</Text>
          <TouchableOpacity style={styles.hintButton} onPress={useHint}>
            <Text style={styles.hintButtonText}>使用提示</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    stats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    statText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    hintButton: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      marginLeft: 'auto',
    },
    hintButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
  });

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useWordPackStore, getActiveLevelWords, findPack } from '@/store/wordPackStore';
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
import { useCupertino } from '@/theme/ThemeProvider';
import { type } from '@/theme/cupertino';
import { NavBar, NavAction } from '@/components/cupertino/NavBar';
import { Icon } from '@/components/cupertino/Icon';
import { CAlert, CToast } from '@/components/cupertino/overlays';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useCupertino();
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
  const [toast, setToast] = useState('');
  const [generationFailed, setGenerationFailed] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);

  useEffect(() => {
    let mounted = true;
    speech.init().then(ok => mounted && setSpeechReady(ok));
    return () => {
      mounted = false;
      speech.stop();
    };
  }, []);

  // 系统键盘模式下，选中格子即拉起输入法
  useEffect(() => {
    if (useSystemKeyboard && selectedCell) {
      hiddenInputRef.current?.focus();
    }
    if (!useSystemKeyboard) {
      hiddenInputRef.current?.blur();
    }
  }, [useSystemKeyboard, selectedCell]);

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
      const pool = filterWords(getActiveLevelWords(packState), params.level, params.category);
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
    setToast(`✓ ${wordData.spanish} — ${wordData.chinese}`);
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
    () => (activeWord ? new Set(wordCells(activeWord).map(p => `${p.row}-${p.col}`)) : undefined),
    [activeWord],
  );

  const handleCellPress = (row: number, col: number) => {
    if (!currentSession || !currentPuzzle) {
      return;
    }
    if (!currentSession.currentCells[row][col].correctLetter) {
      return;
    }
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

  const title = useMemo(() => {
    const params = route.params;
    if (params.mode === 'daily') {
      return '今日挑战';
    }
    if (params.mode === 'pack') {
      const name = findPack(useWordPackStore.getState(), params.packId)?.name ?? '词库练习';
      return name.replace(/^场景：/, '');
    }
    return `${params.level} · ${params.difficulty === 'easy' ? '简单' : params.difficulty === 'medium' ? '中等' : '困难'}`;
  }, [route.params]);

  const stats = currentSession
    ? [
        { icon: 'close-circle', text: `错误 ${currentSession.mistakes}` },
        { icon: 'bulb', text: `提示 ${currentSession.hintsUsed}` },
        {
          icon: 'checkmark-circle',
          text: `${currentPuzzle?.words.filter(w => w.isCompleted).length ?? 0}/${currentPuzzle?.words.length ?? 0}`,
        },
      ]
    : [];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <NavBar
        title={title}
        onBack={() => navigation.goBack()}
        right={
          <>
            <NavAction
              icon={useSystemKeyboard ? 'keypad' : 'keypad-outline'}
              onPress={() => setUseSystemKeyboard(!useSystemKeyboard)}
              accessibilityLabel="切换系统键盘"
            />
            <NavAction icon="bulb-outline" onPress={useHint} accessibilityLabel="使用提示" />
          </>
        }
      />

      {!currentPuzzle || !currentSession ? (
        <View style={styles.loading}>
          <Text style={[type.body, { color: colors.secondaryLabel }]}>
            {generationFailed ? '' : '正在生成谜题…'}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsBar}>
            {stats.map(s => (
              <View key={s.text} style={[styles.statPill, { backgroundColor: colors.fill }]}>
                <Icon name={s.icon} size={13} color={colors.secondaryLabel} />
                <Text style={[type.footnote, { color: colors.secondaryLabel }]}>{s.text}</Text>
              </View>
            ))}
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

      <CAlert
        visible={completed}
        title="🏆 恭喜完成！"
        message={`得分 ${currentSession?.score} · 错误 ${currentSession?.mistakes} · 提示 ${currentSession?.hintsUsed}${useGameStore
          .getState()
          .lastUnlockedAchievements.map(a => `\n🎉 解锁成就：${a.icon} ${a.title}`)
          .join('')}`}
        actions={[{ text: '返回主页', style: 'cancel', onPress: () => navigation.goBack() }]}
      />

      <CAlert
        visible={generationFailed}
        title="无法生成谜题"
        message="该组合的可用单词不足，请换一个主题或词库。"
        actions={[{ text: '返回', onPress: () => navigation.goBack() }]}
      />

      <CToast message={toast} onHide={() => setToast('')} />
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
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
  },
  content: { padding: 16, paddingTop: 4 },
  hiddenInput: {
    position: 'absolute',
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },
});

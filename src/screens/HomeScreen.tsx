import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { PuzzleGenerator } from '@/utils/puzzleGenerator';
import {
  CATEGORY_LABELS,
  MIN_WORDS_PER_PUZZLE,
  getCategoriesForLevel,
  getRandomWords,
} from '@/data/words';
import { LanguageLevel, WordCategory } from '@/types/game';

type Difficulty = 'easy' | 'medium' | 'hard';

const LEVELS: { level: LanguageLevel; title: string; description: string }[] = [
  { level: 'A1', title: 'A1 初级', description: '适合零基础学习者' },
  { level: 'A2', title: 'A2 基础', description: '掌握基本词汇和语法' },
  { level: 'B1', title: 'B1 进阶', description: '能够进行日常交流' },
  { level: 'B2', title: 'B2 中高级', description: '流利表达复杂想法' },
  { level: 'C1', title: 'C1 高级', description: '接近母语水平' },
  { level: 'C2', title: 'C2 精通', description: '完全掌握西班牙语' },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: '简单 Fácil' },
  { value: 'medium', label: '中等 Medio' },
  { value: 'hard', label: '困难 Difícil' },
];

export const HomeScreen: React.FC = () => {
  const { userProgress, loadUserProgress, startGame } = useGameStore();
  const [level, setLevel] = useState<LanguageLevel | null>(null);
  const [category, setCategory] = useState<WordCategory | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  const categories = useMemo(() => (level ? getCategoriesForLevel(level) : []), [level]);

  const chooseLevel = (next: LanguageLevel) => {
    setLevel(prev => (prev === next ? null : next));
    setCategory(null);
    setError(null);
  };

  const handleStart = () => {
    if (!level || !category) return;
    const words = getRandomWords(8, level, category);
    if (words.length < MIN_WORDS_PER_PUZZLE) {
      setError('该组合的单词数量不足，请选择其他主题');
      return;
    }
    const puzzle = new PuzzleGenerator(15).generatePuzzle(words, difficulty);
    if (puzzle.words.length < 3) {
      setError('这次没能排出足够的交叉单词，请再点一次开始');
      return;
    }
    startGame(puzzle);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BB 西语填字</Text>
        <Text style={styles.subtitle}>用填字游戏学西班牙语 · Aprende español jugando</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {userProgress && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>学习进度</Text>
            <View style={styles.statsRow}>
              <Stat value={userProgress.totalScore} label="总分" />
              <Stat value={userProgress.statistics.totalWordsLearned} label="已学单词" />
              <Stat value={userProgress.statistics.totalGamesPlayed} label="完成游戏" />
              <Stat value={userProgress.streak} label="连续天数" />
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>选择等级</Text>

        {LEVELS.map(item => {
          const open = level === item.level;
          return (
            <View key={item.level} style={[styles.card, open && styles.cardOpen]}>
              <TouchableOpacity
                onPress={() => chooseLevel(item.level)}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>

              {open && (
                <View style={styles.picker}>
                  <Text style={styles.pickerLabel}>主题 Tema</Text>
                  <View style={styles.chips}>
                    {categories.map(({ category: c, count }) => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.chip, category === c && styles.chipActive]}
                        onPress={() => {
                          setCategory(c);
                          setError(null);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: category === c }}
                      >
                        <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                          {CATEGORY_LABELS[c]} · {count}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.pickerLabel}>难度 Dificultad</Text>
                  <View style={styles.chips}>
                    {DIFFICULTIES.map(d => (
                      <TouchableOpacity
                        key={d.value}
                        style={[styles.chip, difficulty === d.value && styles.chipActive]}
                        onPress={() => setDifficulty(d.value)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: difficulty === d.value }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            difficulty === d.value && styles.chipTextActive,
                          ]}
                        >
                          {d.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {error && <Text style={styles.error}>{error}</Text>}

                  <TouchableOpacity
                    style={[styles.startButton, !category && styles.startDisabled]}
                    onPress={handleStart}
                    disabled={!category}
                    accessibilityRole="button"
                  >
                    <Text style={styles.startText}>
                      {category ? '开始游戏 ¡Empezar!' : '先选一个主题'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>游戏说明</Text>
          <Text style={styles.infoText}>
            • 根据英文 / 中文提示填入西语单词{'\n'}• 横向和纵向的单词会有交叉{'\n'}•
            蓝色字母是提示，不可修改{'\n'}• 重音可省略：café 填 CAFE，Ñ 单独一个键{'\n'}•
            电脑上可直接用键盘输入，方向键移动
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const Stat: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 24, backgroundColor: '#1976D2', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#BBDEFB', textAlign: 'center' },
  scrollView: { flex: 1 },
  content: { padding: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  progressCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...shadow,
  },
  progressTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1976D2' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, ...shadow },
  cardOpen: { borderWidth: 2, borderColor: '#1976D2' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1976D2', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#666' },
  picker: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  pickerLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  chipText: { fontSize: 14, color: '#1976D2' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  error: { color: '#C62828', fontSize: 14, marginBottom: 8 },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  startDisabled: { backgroundColor: '#BDBDBD' },
  startText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoSection: { marginTop: 12, padding: 16, backgroundColor: '#E3F2FD', borderRadius: 12 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#1976D2', marginBottom: 12 },
  infoText: { fontSize: 14, color: '#333', lineHeight: 22 },
});

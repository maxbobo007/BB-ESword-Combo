import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { PuzzleGenerator } from '@/utils/puzzleGenerator';
import { getPlayableCategories, getRandomWords, MIN_WORDS_PER_PUZZLE } from '@/data/words';
import { LanguageLevel, WordCategory } from '@/types/game';

type Difficulty = 'easy' | 'medium' | 'hard';

const LEVELS: { id: LanguageLevel; title: string; description: string }[] = [
  { id: 'A1', title: 'A1 初级', description: '零基础' },
  { id: 'A2', title: 'A2 基础', description: '基本词汇' },
  { id: 'B1', title: 'B1 进阶', description: '日常交流' },
  { id: 'B2', title: 'B2 中高级', description: '复杂表达' },
  { id: 'C1', title: 'C1 高级', description: '接近母语' },
  { id: 'C2', title: 'C2 精通', description: '完全掌握' },
];

const CATEGORY_NAMES: Record<WordCategory, string> = {
  food: '食物',
  family: '家庭',
  travel: '旅行',
  work: '工作',
  health: '健康',
  nature: '自然',
  education: '教育',
  sports: '运动',
  technology: '科技',
  culture: '文化',
};

const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'easy', label: '简单', hint: '40% 字母提示' },
  { id: 'medium', label: '中等', hint: '25% 字母提示' },
  { id: 'hard', label: '困难', hint: '15% 字母提示' },
];

interface ChipProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, sublabel, selected, disabled, onPress }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected, disabled }}
    disabled={disabled}
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}
  >
    <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    {sublabel ? (
      <Text style={[styles.chipSub, selected && styles.chipLabelSelected]}>{sublabel}</Text>
    ) : null}
  </Pressable>
);

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { userProgress, loadUserProgress, startGame } = useGameStore();

  const [level, setLevel] = useState<LanguageLevel>('A1');
  const [category, setCategory] = useState<WordCategory | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  const categories = useMemo(() => getPlayableCategories(level) as WordCategory[], [level]);
  const selectedCategory = category && categories.includes(category) ? category : categories[0] ?? null;

  const handleStart = () => {
    if (!selectedCategory) return;
    const words = getRandomWords(8, level, selectedCategory);
    if (words.length < MIN_WORDS_PER_PUZZLE) return;
    const puzzle = new PuzzleGenerator(15).generatePuzzle(words, { difficulty });
    startGame(puzzle);
    router.push('/game');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>BB 西语填字</Text>
        <Text style={styles.subtitle}>用填字游戏学西班牙语</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {userProgress && (
          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>学习进度</Text>
            <View style={styles.statsRow}>
              <Stat value={userProgress.totalScore} label="总分" />
              <Stat value={userProgress.statistics.totalWordsLearned} label="见过的单词" />
              <Stat value={userProgress.statistics.totalGamesPlayed} label="完成游戏" />
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>1. 等级</Text>
        <View style={styles.chipRow}>
          {LEVELS.map(l => {
            const playable = getPlayableCategories(l.id).length > 0;
            return (
              <Chip
                key={l.id}
                label={l.title}
                sublabel={playable ? l.description : '词库建设中'}
                selected={level === l.id}
                disabled={!playable}
                onPress={() => setLevel(l.id)}
              />
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>2. 主题</Text>
        <View style={styles.chipRow}>
          {categories.length === 0 ? (
            <Text style={styles.empty}>这个等级还没有足够的单词</Text>
          ) : (
            categories.map(c => (
              <Chip
                key={c}
                label={CATEGORY_NAMES[c]}
                selected={selectedCategory === c}
                onPress={() => setCategory(c)}
              />
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>3. 难度</Text>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map(d => (
            <Chip
              key={d.id}
              label={d.label}
              sublabel={d.hint}
              selected={difficulty === d.id}
              onPress={() => setDifficulty(d.id)}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!selectedCategory}
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startButton,
            !selectedCategory && styles.startDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.startText}>开始游戏</Text>
        </Pressable>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>玩法</Text>
          <Text style={styles.infoText}>
            • 根据中英文提示，在格子里拼出西语单词{'\n'}
            • 点格子选中，再点一次切换横向/纵向{'\n'}
            • 蓝色字母是提示，不能修改{'\n'}
            • 重音可以先打不带重音的字母（E 代替 É）{'\n'}
            • 电脑上可以直接用键盘输入
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Stat: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingVertical: 20, paddingHorizontal: 16, backgroundColor: '#1976D2', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#BBDEFB' },
  content: { padding: 16, paddingBottom: 40, width: '100%', maxWidth: 640, alignSelf: 'center' },
  progressCard: { padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1976D2' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    minWidth: 92,
  },
  chipSelected: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  chipDisabled: { opacity: 0.45 },
  chipLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  chipLabelSelected: { color: '#fff' },
  chipSub: { fontSize: 11, color: '#777', marginTop: 2 },
  empty: { fontSize: 14, color: '#888' },
  startButton: {
    marginTop: 24,
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  startDisabled: { backgroundColor: '#9bb8d6' },
  pressed: { opacity: 0.8 },
  startText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  infoSection: { marginTop: 12, padding: 16, backgroundColor: '#fff', borderRadius: 12 },
  infoText: { fontSize: 14, color: '#555', lineHeight: 22 },
});

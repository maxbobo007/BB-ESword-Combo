import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useGameStore, getCurrentStreak } from '../store/gameStore';
import { countWords, MIN_WORDS_PER_PUZZLE } from '../data/words';
import type { Difficulty, LanguageLevel, WordCategory } from '../types/game';

const LEVELS: { level: LanguageLevel; label: string }[] = [
  { level: 'A1', label: '入门' },
  { level: 'A2', label: '基础' },
  { level: 'B1', label: '进阶' },
  { level: 'B2', label: '中高级' },
  { level: 'C1', label: '高级' },
  { level: 'C2', label: '精通' },
];

const CATEGORIES: { category: WordCategory; label: string; emoji: string }[] = [
  { category: 'food', label: '食物 Comida', emoji: '🍎' },
  { category: 'family', label: '家庭 Familia', emoji: '👨‍👩‍👧' },
  { category: 'travel', label: '旅行 Viajes', emoji: '✈️' },
  { category: 'work', label: '工作 Trabajo', emoji: '💼' },
  { category: 'health', label: '健康 Salud', emoji: '🩺' },
  { category: 'nature', label: '自然 Naturaleza', emoji: '🌳' },
  { category: 'education', label: '教育 Educación', emoji: '📚' },
  { category: 'sports', label: '运动 Deporte', emoji: '⚽' },
  { category: 'technology', label: '科技 Tecnología', emoji: '📱' },
  { category: 'culture', label: '文化 Cultura', emoji: '🎭' },
];

const DIFFICULTIES: { difficulty: Difficulty; label: string; note: string }[] = [
  { difficulty: 'easy', label: '简单', note: '40% 提示字母，错字标红' },
  { difficulty: 'medium', label: '中等', note: '25% 提示字母' },
  { difficulty: 'hard', label: '困难', note: '15% 提示字母，重音必须输对' },
];

const isPlayable = (level: LanguageLevel, category: WordCategory) =>
  countWords(level, category) >= MIN_WORDS_PER_PUZZLE;

export const HomeScreen: React.FC = () => {
  const { userProgress, loadUserProgress, startNewGame } = useGameStore();
  const [level, setLevel] = useState<LanguageLevel>('A1');
  const [category, setCategory] = useState<WordCategory | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProgress();
  }, []);

  const levelHasContent = CATEGORIES.some(c => isPlayable(level, c.category));

  const chooseLevel = (next: LanguageLevel) => {
    setLevel(next);
    if (category && !isPlayable(next, category)) setCategory(null);
    setError(null);
  };

  const start = () => {
    if (!category) return;
    const ok = startNewGame({ level, category, difficulty });
    if (!ok) setError('这个组合暂时生成不了填字，换一个主题试试');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BB 西语填字</Text>
        <Text style={styles.subtitle}>Aprende español jugando · 用填字游戏学西班牙语</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {userProgress && (
          <View style={styles.progressCard}>
            {[
              { value: userProgress.totalScore, label: '总分' },
              { value: userProgress.wordsLearned.length, label: '已学会' },
              { value: userProgress.statistics.totalGamesPlayed, label: '完成局数' },
              { value: getCurrentStreak(userProgress), label: '连续天数' },
            ].map(s => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>1. 等级 Nivel</Text>
        <View style={styles.chipRow}>
          {LEVELS.map(l => {
            const hasContent = CATEGORIES.some(c => isPlayable(l.level, c.category));
            return (
              <Pressable
                key={l.level}
                onPress={() => chooseLevel(l.level)}
                style={[styles.chip, level === l.level && styles.chipActive, !hasContent && styles.chipMuted]}
              >
                <Text style={[styles.chipText, level === l.level && styles.chipTextActive]}>{l.level}</Text>
                <Text style={[styles.chipSub, level === l.level && styles.chipTextActive]}>{l.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>2. 主题 Tema</Text>
        {!levelHasContent && <Text style={styles.emptyNote}>{level} 词库建设中，先从 A1–B1 开始吧</Text>}
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => {
            const count = countWords(level, c.category);
            const playable = count >= MIN_WORDS_PER_PUZZLE;
            const selected = category === c.category;
            return (
              <Pressable
                key={c.category}
                disabled={!playable}
                onPress={() => { setCategory(c.category); setError(null); }}
                style={[styles.categoryCard, selected && styles.categoryActive, !playable && styles.categoryDisabled]}
              >
                <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                <Text style={[styles.categoryLabel, selected && styles.chipTextActive]}>{c.label}</Text>
                <Text style={[styles.categoryCount, selected && styles.chipTextActive]}>
                  {playable ? `${count} 个词` : '即将推出'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>3. 难度 Dificultad</Text>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map(d => (
            <Pressable
              key={d.difficulty}
              onPress={() => setDifficulty(d.difficulty)}
              style={[styles.diffChip, difficulty === d.difficulty && styles.chipActive]}
            >
              <Text style={[styles.chipText, difficulty === d.difficulty && styles.chipTextActive]}>{d.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.diffNote}>{DIFFICULTIES.find(d => d.difficulty === difficulty)?.note}</Text>

        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable
          disabled={!category}
          onPress={start}
          style={[styles.startButton, !category && styles.startDisabled]}
        >
          <Text style={styles.startText}>{category ? '开始 ¡Vamos!' : '先选一个主题'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingVertical: 20, paddingHorizontal: 16, backgroundColor: '#1976D2', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: '#E3F2FD', marginTop: 4 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  progressCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1976D2' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, width: 52, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  chipMuted: { opacity: 0.45 },
  chipText: { fontSize: 15, fontWeight: '600', color: '#333' },
  chipSub: { fontSize: 10, color: '#888', marginTop: 2 },
  chipTextActive: { color: '#fff' },
  emptyNote: { fontSize: 13, color: '#888', marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryCard: { width: '48%', backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#ddd' },
  categoryActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  categoryDisabled: { opacity: 0.4 },
  categoryEmoji: { fontSize: 22 },
  categoryLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 4 },
  categoryCount: { fontSize: 12, color: '#888', marginTop: 2 },
  diffChip: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  diffNote: { fontSize: 12, color: '#666', marginTop: 8 },
  error: { color: '#D32F2F', marginTop: 12 },
  startButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  startDisabled: { backgroundColor: '#BDBDBD' },
  startText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

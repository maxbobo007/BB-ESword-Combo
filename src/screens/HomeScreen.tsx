import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProgressStore } from '@/store/progressStore';
import { getWordCount } from '@/core/data/words';
import { localDateString } from '@/core/progress/streak';
import { LanguageLevel, WordCategory, Difficulty } from '@/core/types/game';
import { RootStackParamList } from '@/navigation/types';
import { Theme } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const LEVELS: { level: LanguageLevel; title: string; description: string }[] = [
  { level: 'A1', title: 'A1 初级', description: '适合零基础学习者' },
  { level: 'A2', title: 'A2 基础', description: '掌握基本词汇和语法' },
  { level: 'B1', title: 'B1 进阶', description: '能够进行日常交流' },
  { level: 'B2', title: 'B2 中高级', description: '流利表达复杂想法' },
  { level: 'C1', title: 'C1 高级', description: '接近母语水平' },
  { level: 'C2', title: 'C2 精通', description: '完全掌握西班牙语' },
];

const CATEGORIES: { category: WordCategory; label: string; icon: string }[] = [
  { category: 'food', label: '食物', icon: '🍎' },
  { category: 'family', label: '家庭', icon: '👨‍👩‍👧' },
  { category: 'travel', label: '旅行', icon: '✈️' },
  { category: 'work', label: '工作', icon: '💼' },
  { category: 'health', label: '健康', icon: '💊' },
  { category: 'nature', label: '自然', icon: '🌿' },
  { category: 'education', label: '教育', icon: '📚' },
  { category: 'sports', label: '运动', icon: '⚽' },
  { category: 'technology', label: '科技', icon: '💻' },
  { category: 'culture', label: '文化', icon: '🎭' },
];

const MIN_WORDS = 6;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const userProgress = useProgressStore(s => s.progress);
  const [expandedLevel, setExpandedLevel] = useState<LanguageLevel | null>(null);
  const dailyDone = userProgress.dailyCompletedDates.includes(localDateString());

  const handleCategoryPress = (level: LanguageLevel, category: WordCategory, label: string) => {
    const chooseDifficulty = (difficulty: Difficulty) =>
      navigation.navigate('Game', { mode: 'free', level, category, difficulty });
    Alert.alert(`${level} · ${label}`, '选择难度', [
      { text: '简单', onPress: () => chooseDifficulty('easy') },
      { text: '中等', onPress: () => chooseDifficulty('medium') },
      { text: '困难', onPress: () => chooseDifficulty('hard') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const renderLevelCard = ({ level, title, description }: (typeof LEVELS)[number]) => {
    const expanded = expandedLevel === level;
    const levelTotal = getWordCount(level);
    return (
      <View key={level} style={styles.card}>
        <TouchableOpacity onPress={() => setExpandedLevel(expanded ? null : level)}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDescription}>{description}</Text>
            </View>
            <Text style={styles.cardMeta}>
              {levelTotal} 词 {expanded ? '▲' : '▼'}
            </Text>
          </View>
        </TouchableOpacity>
        {expanded && (
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(({ category, label, icon }) => {
              const count = getWordCount(level, category);
              const enabled = count >= MIN_WORDS;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, !enabled && styles.categoryChipDisabled]}
                  disabled={!enabled}
                  onPress={() => handleCategoryPress(level, category, label)}
                >
                  <Text style={styles.categoryIcon}>{icon}</Text>
                  <Text style={[styles.categoryLabel, !enabled && styles.categoryLabelDisabled]}>
                    {label}
                  </Text>
                  <Text style={styles.categoryCount}>{count} 词</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="设置"
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>BB 西语填字</Text>
        <Text style={styles.subtitle}>用填字游戏学西班牙语</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={[styles.dailyCard, dailyDone && styles.dailyCardDone]}
          onPress={() => navigation.navigate('Game', { mode: 'daily' })}
          disabled={dailyDone}
        >
          <Text style={styles.dailyIcon}>{dailyDone ? '✅' : '📅'}</Text>
          <View style={styles.dailyBody}>
            <Text style={[styles.dailyTitle, dailyDone && styles.dailyTextDone]}>今日挑战</Text>
            <Text style={[styles.dailySubtitle, dailyDone && styles.dailyTextDone]}>
              {dailyDone ? '今天已完成，明天再来！' : '每天一题，全球同题'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>学习进度</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
              <Text style={styles.achievementsLink}>🏆 成就 ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProgress.totalScore}</Text>
              <Text style={styles.statLabel}>总分</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProgress.statistics.totalWordsLearned}</Text>
              <Text style={styles.statLabel}>已学单词</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProgress.statistics.totalGamesPlayed}</Text>
              <Text style={styles.statLabel}>完成游戏</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProgress.streak}</Text>
              <Text style={styles.statLabel}>连续天数</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>选择等级和主题</Text>
        {LEVELS.map(renderLevelCard)}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>游戏说明</Text>
          <Text style={styles.infoText}>
            • 根据提示填入正确的西语单词{'\n'}
            • 横向和纵向的单词会有交叉{'\n'}
            • 高亮字母是提示，不可修改{'\n'}
            • 西语填字惯例：重音不计（é 填 E 即可），Ñ 是独立字母{'\n'}
            • 尽量减少错误以获得更高分数
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 24,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
    },
    settingsButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      padding: 8,
    },
    settingsButtonText: {
      fontSize: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.onPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onPrimary,
      opacity: 0.8,
    },
    dailyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      padding: 16,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
    },
    dailyCardDone: {
      backgroundColor: theme.colors.surface,
    },
    dailyIcon: {
      fontSize: 28,
      marginRight: 12,
    },
    dailyBody: {
      flex: 1,
    },
    dailyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onPrimary,
    },
    dailySubtitle: {
      fontSize: 13,
      color: theme.colors.onPrimary,
      opacity: 0.85,
      marginTop: 2,
    },
    dailyTextDone: {
      color: theme.colors.textPrimary,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    achievementsLink: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    progressCard: {
      marginBottom: 16,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardHeaderText: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    cardMeta: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 16,
    },
    categoryChip: {
      width: '31%',
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: theme.colors.primaryContainer,
    },
    categoryChipDisabled: {
      backgroundColor: theme.colors.background,
      opacity: 0.5,
    },
    categoryIcon: {
      fontSize: 20,
      marginBottom: 2,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    categoryLabelDisabled: {
      color: theme.colors.disabled,
    },
    categoryCount: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    infoSection: {
      marginTop: 12,
      padding: 16,
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 12,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 12,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      lineHeight: 22,
    },
  });

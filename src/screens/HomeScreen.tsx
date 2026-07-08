import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProgressStore } from '@/store/progressStore';
import { LanguageLevel } from '@/core/types/game';
import { RootStackParamList } from '@/navigation/types';
import { Theme } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const userProgress = useProgressStore(s => s.progress);

  const renderLevelCard = (level: LanguageLevel, title: string, description: string) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        Alert.alert(`选择${title}关卡`, '请选择主题和难度', [
          {
            text: '食物 - 简单',
            onPress: () =>
              navigation.navigate('Game', { mode: 'free', level, category: 'food', difficulty: 'easy' }),
          },
          {
            text: '家庭 - 中等',
            onPress: () =>
              navigation.navigate('Game', { mode: 'free', level, category: 'family', difficulty: 'medium' }),
          },
          {
            text: '旅行 - 困难',
            onPress: () =>
              navigation.navigate('Game', { mode: 'free', level, category: 'travel', difficulty: 'hard' }),
          },
          { text: '取消', style: 'cancel' },
        ]);
      }}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </TouchableOpacity>
  );

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

      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>学习进度</Text>
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>选择难度</Text>

        {renderLevelCard('A1', 'A1 初级', '适合零基础学习者')}
        {renderLevelCard('A2', 'A2 基础', '掌握基本词汇和语法')}
        {renderLevelCard('B1', 'B1 进阶', '能够进行日常交流')}
        {renderLevelCard('B2', 'B2 中高级', '流利表达复杂想法')}
        {renderLevelCard('C1', 'C1 高级', '接近母语水平')}
        {renderLevelCard('C2', 'C2 精通', '完全掌握西班牙语')}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>游戏说明</Text>
          <Text style={styles.infoText}>
            • 根据提示填入正确的西语单词{'\n'}
            • 横向和纵向的单词会有交叉{'\n'}
            • 高亮字母是提示，不可修改{'\n'}
            • 尽量减少错误以获得更高分数{'\n'}
            • 需要帮助时可以使用提示功能
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
    progressCard: {
      margin: 16,
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
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    cardDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    infoSection: {
      marginTop: 24,
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

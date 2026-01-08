import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { PuzzleGenerator } from '@/utils/puzzleGenerator';
import { getRandomWords } from '@/data/words';
import { LanguageLevel, WordCategory } from '@/types/game';

interface HomeScreenProps {
  onStartGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const { userProgress, loadUserProgress, startGame } = useGameStore();

  useEffect(() => {
    loadUserProgress();
  }, []);

  const handleStartGame = (
    level: LanguageLevel,
    category: WordCategory,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    const words = getRandomWords(8, level, category);

    if (words.length < 5) {
      Alert.alert('提示', '该组合的单词数量不足，请选择其他选项');
      return;
    }

    const generator = new PuzzleGenerator(15);
    const puzzle = generator.generatePuzzle(words, difficulty);

    startGame(puzzle);
    onStartGame();
  };

  const renderLevelCard = (
    level: LanguageLevel,
    title: string,
    description: string
  ) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        Alert.alert(
          `选择${title}关卡`,
          '请选择主题和难度',
          [
            {
              text: '食物 - 简单',
              onPress: () => handleStartGame(level, 'food', 'easy'),
            },
            {
              text: '家庭 - 中等',
              onPress: () => handleStartGame(level, 'family', 'medium'),
            },
            {
              text: '旅行 - 困难',
              onPress: () => handleStartGame(level, 'travel', 'hard'),
            },
            { text: '取消', style: 'cancel' },
          ]
        );
      }}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BB 西语填字</Text>
        <Text style={styles.subtitle}>用填字游戏学西班牙语</Text>
      </View>

      {userProgress && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>学习进度</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProgress.totalScore}</Text>
              <Text style={styles.statLabel}>总分</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userProgress.statistics.totalWordsLearned}
              </Text>
              <Text style={styles.statLabel}>已学单词</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userProgress.statistics.totalGamesPlayed}
              </Text>
              <Text style={styles.statLabel}>完成游戏</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProgress.streak}</Text>
              <Text style={styles.statLabel}>连续天数</Text>
            </View>
          </View>
        </View>
      )}

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
            • 蓝色字母是提示，不可修改{'\n'}
            • 尽量减少错误以获得更高分数{'\n'}
            • 需要帮助时可以使用提示功能
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: '#1976D2',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBDEFB',
  },
  progressCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
    color: '#333',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});

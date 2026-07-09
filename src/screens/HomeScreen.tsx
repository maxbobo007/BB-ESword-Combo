import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Chip,
  List,
  Portal,
  Dialog,
  SegmentedButtons,
  Button,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProgressStore } from '@/store/progressStore';
import { useWordPackStore, getActiveWords, getActivePacks } from '@/store/wordPackStore';
import { countWords } from '@/core/data/words';
import { localDateString } from '@/core/progress/streak';
import { LanguageLevel, WordCategory, Difficulty } from '@/core/types/game';
import { RootStackParamList, GameParams } from '@/navigation/types';

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
  { category: 'food', label: '食物', icon: 'food-apple' },
  { category: 'family', label: '家庭', icon: 'account-group' },
  { category: 'travel', label: '旅行', icon: 'airplane' },
  { category: 'work', label: '工作', icon: 'briefcase' },
  { category: 'health', label: '健康', icon: 'heart-pulse' },
  { category: 'nature', label: '自然', icon: 'leaf' },
  { category: 'education', label: '教育', icon: 'school' },
  { category: 'sports', label: '运动', icon: 'soccer' },
  { category: 'technology', label: '科技', icon: 'laptop' },
  { category: 'culture', label: '文化', icon: 'drama-masks' },
];

const MIN_WORDS = 6;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const progress = useProgressStore(s => s.progress);
  const packState = useWordPackStore();
  const activeWords = useMemo(() => getActiveWords(packState), [packState]);
  const customPacks = useMemo(
    () => getActivePacks(packState).filter(p => !p.builtin),
    [packState],
  );
  const dailyDone = progress.dailyCompletedDates.includes(localDateString());

  const [pendingGame, setPendingGame] = useState<
    { mode: 'free'; level: LanguageLevel; category: WordCategory } | { mode: 'pack'; packId: string } | null
  >(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const startPending = () => {
    if (!pendingGame) {
      return;
    }
    const params = { ...pendingGame, difficulty } as GameParams;
    setPendingGame(null);
    navigation.navigate('Game', params);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <Appbar.Header mode="center-aligned" elevated>
        <Appbar.Content title="BB 西语填字" />
        <Appbar.Action icon="trophy-outline" onPress={() => navigation.navigate('Achievements')} />
        <Appbar.Action icon="cog-outline" onPress={() => navigation.navigate('Settings')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card
          mode="elevated"
          style={styles.card}
          onPress={dailyDone ? undefined : () => navigation.navigate('Game', { mode: 'daily' })}
        >
          <Card.Title
            title="今日挑战"
            subtitle={dailyDone ? '今天已完成，明天再来！' : '每天一题，全球同题'}
            left={props => (
              <List.Icon
                {...props}
                icon={dailyDone ? 'check-circle' : 'calendar-star'}
                color={dailyDone ? theme.colors.tertiary : theme.colors.primary}
              />
            )}
            right={props =>
              dailyDone ? null : <List.Icon {...props} icon="chevron-right" />
            }
          />
        </Card>

        <Card mode="contained" style={styles.card}>
          <Card.Content style={styles.statsRow}>
            {[
              { value: progress.totalScore, label: '总分' },
              { value: progress.statistics.totalWordsLearned, label: '已学单词' },
              { value: progress.statistics.totalGamesPlayed, label: '完成游戏' },
              { value: progress.streak, label: '连续天数' },
            ].map(item => (
              <View key={item.label} style={styles.statItem}>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                  {item.value}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={styles.sectionHeader}>
          <Text variant="titleMedium">选择等级和主题</Text>
          <Button
            compact
            mode="text"
            icon="bookshelf"
            onPress={() => navigation.navigate('WordPacks')}
          >
            词库管理
          </Button>
        </View>

        {LEVELS.map(({ level, title, description }) => {
          const levelTotal = countWords(activeWords, level);
          return (
            <List.Accordion
              key={level}
              title={title}
              description={description}
              right={props => (
                <Text
                  {...props}
                  variant="labelMedium"
                  style={{ color: theme.colors.onSurfaceVariant, alignSelf: 'center' }}
                >
                  {levelTotal} 词
                </Text>
              )}
              style={[styles.accordion, { backgroundColor: theme.colors.surface }]}
            >
              <View style={styles.chipGrid}>
                {CATEGORIES.map(({ category, label, icon }) => {
                  const count = countWords(activeWords, level, category);
                  const enabled = count >= MIN_WORDS;
                  return (
                    <Chip
                      key={category}
                      icon={icon}
                      disabled={!enabled}
                      style={styles.chip}
                      onPress={() => setPendingGame({ mode: 'free', level, category })}
                    >
                      {label} {count}
                    </Chip>
                  );
                })}
              </View>
            </List.Accordion>
          );
        })}

        {customPacks.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              我的词库
            </Text>
            {customPacks.map(pack => (
              <Card
                key={pack.id}
                mode="outlined"
                style={styles.card}
                onPress={
                  pack.words.length >= MIN_WORDS
                    ? () => setPendingGame({ mode: 'pack', packId: pack.id })
                    : undefined
                }
              >
                <Card.Title
                  title={pack.name}
                  subtitle={`${pack.words.length} 词`}
                  left={props => <List.Icon {...props} icon="book-open-variant" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                />
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={pendingGame !== null} onDismiss={() => setPendingGame(null)}>
          <Dialog.Title>选择难度</Dialog.Title>
          <Dialog.Content>
            <SegmentedButtons
              value={difficulty}
              onValueChange={v => setDifficulty(v as Difficulty)}
              buttons={[
                { value: 'easy', label: '简单' },
                { value: 'medium', label: '中等' },
                { value: 'hard', label: '困难' },
              ]}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPendingGame(null)}>取消</Button>
            <Button mode="contained" onPress={startPending}>
              开始游戏
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: { marginTop: 16, marginBottom: 8 },
  accordion: { marginBottom: 4, borderRadius: 12 },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: { marginRight: 0 },
});

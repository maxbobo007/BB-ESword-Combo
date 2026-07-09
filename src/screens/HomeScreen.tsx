import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProgressStore } from '@/store/progressStore';
import { useWordPackStore, getActiveWords, getActivePacks } from '@/store/wordPackStore';
import { countWords } from '@/core/data/words';
import { localDateString } from '@/core/progress/streak';
import { LanguageLevel, WordCategory, Difficulty } from '@/core/types/game';
import { RootStackParamList, GameParams } from '@/navigation/types';
import { useCupertino } from '@/theme/ThemeProvider';
import { type } from '@/theme/cupertino';
import { NavBar, NavAction } from '@/components/cupertino/NavBar';
import { Group, Row } from '@/components/cupertino/InsetGroup';
import { Icon } from '@/components/cupertino/Icon';
import { Segmented, CButton } from '@/components/cupertino/controls';
import { CAlert } from '@/components/cupertino/overlays';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const LEVELS: { level: LanguageLevel; title: string; description: string; color: string }[] = [
  { level: 'A1', title: 'A1 初级', description: '适合零基础学习者', color: '#34C759' },
  { level: 'A2', title: 'A2 基础', description: '掌握基本词汇和语法', color: '#30B0C7' },
  { level: 'B1', title: 'B1 进阶', description: '能够进行日常交流', color: '#007AFF' },
  { level: 'B2', title: 'B2 中高级', description: '流利表达复杂想法', color: '#5856D6' },
  { level: 'C1', title: 'C1 高级', description: '接近母语水平', color: '#AF52DE' },
  { level: 'C2', title: 'C2 精通', description: '完全掌握西班牙语', color: '#FF9500' },
];

const CATEGORIES: { category: WordCategory; label: string; icon: string }[] = [
  { category: 'food', label: '食物', icon: 'restaurant' },
  { category: 'family', label: '家庭', icon: 'people' },
  { category: 'travel', label: '旅行', icon: 'airplane' },
  { category: 'work', label: '工作', icon: 'briefcase' },
  { category: 'health', label: '健康', icon: 'fitness' },
  { category: 'nature', label: '自然', icon: 'leaf' },
  { category: 'education', label: '教育', icon: 'school' },
  { category: 'sports', label: '运动', icon: 'football' },
  { category: 'technology', label: '科技', icon: 'laptop' },
  { category: 'culture', label: '文化', icon: 'color-palette' },
];

const MIN_WORDS = 6;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useCupertino();
  const progress = useProgressStore(s => s.progress);
  const packState = useWordPackStore();
  const activeWords = useMemo(() => getActiveWords(packState), [packState]);
  const customPacks = useMemo(() => getActivePacks(packState).filter(p => !p.builtin), [packState]);
  const dailyDone = progress.dailyCompletedDates.includes(localDateString());

  const [expandedLevel, setExpandedLevel] = useState<LanguageLevel | null>(null);
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
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <NavBar
        title="西语填字"
        large
        right={
          <>
            <NavAction icon="trophy-outline" onPress={() => navigation.navigate('Achievements')} />
            <NavAction icon="settings-outline" onPress={() => navigation.navigate('Settings')} />
          </>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 今日挑战 */}
        <View style={styles.hero}>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={dailyDone}
            onPress={() => navigation.navigate('Game', { mode: 'daily' })}
            style={[styles.heroCard, { backgroundColor: dailyDone ? colors.card : colors.tint }]}
          >
            <Icon
              name={dailyDone ? 'checkmark-circle' : 'calendar'}
              size={30}
              color={dailyDone ? colors.green : colors.onTint}
            />
            <View style={styles.heroBody}>
              <Text style={[type.headline, { color: dailyDone ? colors.label : colors.onTint }]}>
                今日挑战
              </Text>
              <Text
                style={[
                  type.footnote,
                  { color: dailyDone ? colors.secondaryLabel : 'rgba(255,255,255,0.85)' },
                ]}
              >
                {dailyDone ? '今天已完成，明天再来！' : '每天一题，全球同题'}
              </Text>
            </View>
            {!dailyDone && <Icon name="chevron-forward" size={20} color={colors.onTint} />}
          </TouchableOpacity>
        </View>

        {/* 学习进度 */}
        <Group header="学习进度">
          <View style={styles.statsRow}>
            {[
              { value: progress.totalScore, label: '总分' },
              { value: progress.statistics.totalWordsLearned, label: '已学单词' },
              { value: progress.statistics.totalGamesPlayed, label: '完成游戏' },
              { value: progress.streak, label: '连续天数' },
            ].map(item => (
              <View key={item.label} style={styles.statItem}>
                <Text style={[type.title2, { color: colors.tint }]}>{item.value}</Text>
                <Text style={[type.caption, { color: colors.secondaryLabel }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Group>

        {/* 等级列表 */}
        <Group header="选择等级和主题" footer="点击等级展开主题；括号内为当前启用词库中的可用词数。">
          {LEVELS.map(({ level, title, description, color }) => {
            const expanded = expandedLevel === level;
            return (
              <View key={level}>
                <Row
                  title={title}
                  subtitle={description}
                  icon="book"
                  iconColor={color}
                  value={`${countWords(activeWords, level)} 词`}
                  chevron={!expanded}
                  onPress={() => setExpandedLevel(expanded ? null : level)}
                />
                {expanded && (
                  <View style={styles.chipGrid}>
                    {CATEGORIES.map(({ category, label, icon }) => {
                      const count = countWords(activeWords, level, category);
                      const enabled = count >= MIN_WORDS;
                      return (
                        <TouchableOpacity
                          key={category}
                          disabled={!enabled}
                          onPress={() => setPendingGame({ mode: 'free', level, category })}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.tintSoft, opacity: enabled ? 1 : 0.35 },
                          ]}
                        >
                          <Icon name={icon} size={15} color={colors.tint} />
                          <Text style={[type.subhead, { color: colors.tint, fontWeight: '600' }]}>
                            {label} {count}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </Group>

        {/* 自定义词库 */}
        {customPacks.length > 0 && (
          <Group header="我的词库">
            {customPacks.map(pack => (
              <Row
                key={pack.id}
                title={pack.name}
                icon="albums"
                iconColor="#FF9500"
                value={`${pack.words.length} 词`}
                chevron
                onPress={
                  pack.words.length >= MIN_WORDS
                    ? () => setPendingGame({ mode: 'pack', packId: pack.id })
                    : undefined
                }
              />
            ))}
          </Group>
        )}

        <Group>
          <Row
            title="词库管理"
            icon="library"
            iconColor="#5856D6"
            chevron
            onPress={() => navigation.navigate('WordPacks')}
          />
        </Group>
      </ScrollView>

      <CAlert
        visible={pendingGame !== null}
        title="选择难度"
        onDismiss={() => setPendingGame(null)}
        wide
        actions={[
          { text: '取消', style: 'cancel', onPress: () => setPendingGame(null) },
          { text: '开始游戏', onPress: startPending },
        ]}
      >
        <View style={styles.segWrap}>
          <Segmented
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: 'easy', label: '简单' },
              { value: 'medium', label: '中等' },
              { value: 'hard', label: '困难' },
            ]}
          />
        </View>
      </CAlert>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 4, paddingBottom: 32 },
  hero: { paddingHorizontal: 16, marginBottom: 22 },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 16,
  },
  heroBody: { flex: 1, gap: 2 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
  },
  statItem: { alignItems: 'center', gap: 2 },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
  },
  segWrap: { marginTop: 12 },
});

import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { BOARD_SIZES, generateForSettings } from '@/utils/newPuzzle';
import { getTopics, Mode } from '@/data/words';
import { BoardSize, GameSettings, LanguageLevel } from '@/types/game';
import { colors, latin, webFocus, radius, shadow, space, type } from '@/theme';
import { LetterTile, TileState } from '@/components/LetterTile';
import { Sheet } from '@/components/Sheet';
import { HowToPlay } from '@/components/HowToPlay';

type Difficulty = GameSettings['difficulty'];

const LEVELS: { id: LanguageLevel; description: string }[] = [
  { id: 'A1', description: '零基础' },
  { id: 'A2', description: '基本词汇' },
  { id: 'B1', description: '日常交流' },
  { id: 'B2', description: '复杂表达' },
  { id: 'C1', description: '接近母语' },
  { id: 'C2', description: '完全掌握' },
];

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'noun', label: '名词', hint: '按主题记名词，例如"苹果 → MANZANA"' },
  { id: 'verb', label: '动词', hint: '先记动词原形，例如"吃 → COMER"；变位练习即将推出' },
];

const DIFFICULTY_NAMES: Record<Difficulty, string> = { easy: '简单', medium: '中等', hard: '困难' };
const DIFFICULTY_HINTS: Record<Difficulty, string> = {
  easy: '约 40% 的字母已经给出',
  medium: '约 25% 的字母已经给出',
  hard: '约 15% 的字母已经给出',
};

// 主页品牌点缀：随手摆放的字母方块拼出 ¡HOLA!
const HERO: { letter: string; state: TileState; rotate: string; value?: number; color?: string }[] = [
  { letter: '¡', state: 'default', rotate: '-4deg' },
  { letter: 'H', state: 'default', rotate: '3deg', value: 4 },
  { letter: 'O', state: 'hint', rotate: '-2deg', value: 1 },
  { letter: 'L', state: 'selected', rotate: '4deg', value: 1 },
  { letter: 'A', state: 'default', rotate: '-3deg', value: 1, color: colors.warningTile },
  { letter: '!', state: 'default', rotate: '2deg' },
];


export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { userProgress, loadUserProgress, startGame } = useGameStore();

  const [mode, setMode] = useState<Mode>('noun');
  const [level, setLevel] = useState<LanguageLevel>('A1');
  const [topic, setTopic] = useState<string | null>(null);
  const [boardSize, setBoardSize] = useState<BoardSize>(width < 400 ? 9 : 11);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [helpOpen, setHelpOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2200);
    return () => clearTimeout(t);
  }, [notice]);

  // 能玩的等级排前面，"建设中"的排在最后
  const levels = useMemo(
    () =>
      LEVELS.map(l => ({ ...l, playable: getTopics(mode, l.id).length > 0 })).sort(
        (a, b) => Number(b.playable) - Number(a.playable)
      ),
    [mode]
  );
  // 切换模式后，原来选的等级可能没词了，自动落到第一个能玩的等级
  const activeLevel = levels.find(l => l.id === level && l.playable)?.id ?? levels[0].id;
  const topics = useMemo(() => getTopics(mode, activeLevel), [mode, activeLevel]);
  const selectedTopic = topics.find(t => t.id === topic) ?? topics[0] ?? null;

  const handleStart = () => {
    if (!selectedTopic) return;
    const settings: GameSettings = {
      mode,
      level: activeLevel,
      topic: selectedTopic.id,
      difficulty,
      boardSize,
    };
    const puzzle = generateForSettings(settings);
    if (!puzzle) {
      setNotice('这个组合的单词还不够，换一个试试');
      return;
    }
    startGame(puzzle, settings);
    router.push('/game');
  };

  const played = userProgress?.statistics.totalGamesPlayed ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable
            role="button"
            aria-label="玩法说明"
            onPress={() => setHelpOpen(true)}
            style={s => [styles.iconButton, s.pressed && styles.iconPressed, webFocus(s)]}
          >
            <Text style={styles.iconText}>?</Text>
          </Pressable>
        </View>

        <View style={styles.hero} aria-label="¡Hola!" role="img">
          {HERO.map(t => (
            <LetterTile
              key={t.letter + t.rotate}
              size={42}
              letter={t.letter}
              state={t.state}
              value={t.value}
              style={{
                transform: [{ rotate: t.rotate }],
                ...(t.color ? { backgroundColor: t.color, borderBottomColor: '#C99A1E' } : null),
              }}
            />
          ))}
        </View>
        <Text style={styles.brand}>BB ESword</Text>
        <Text style={styles.tagline}>用填字游戏记西语单词</Text>

        <View style={styles.statusCard}>
          {played > 0 ? (
            <Text style={styles.statusText}>
              已完成 <Text style={styles.statusNum}>{played}</Text> 局 · 见过{' '}
              <Text style={styles.statusNum}>{userProgress?.statistics.totalWordsLearned ?? 0}</Text>{' '}
              个单词
            </Text>
          ) : (
            <Text style={styles.statusText}>
              第一次玩？选好等级和主题就能开始，点右上角 ? 看玩法
            </Text>
          )}
        </View>

        <SectionLabel zh="模式" es="MODO" />
        <Segmented
          label="模式"
          options={MODES.map(m => ({ id: m.id, label: m.label }))}
          value={mode}
          onChange={id => setMode(id as Mode)}
        />
        <Text style={styles.difficultyHint}>{MODES.find(m => m.id === mode)!.hint}</Text>

        <SectionLabel zh="等级" es="NIVEL" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.levelRow}
          role="radiogroup"
          aria-label="等级"
        >
          {levels.map(l => {
            const selected = activeLevel === l.id;
            return (
              <Pressable
                key={l.id}
                role="radio"
                aria-checked={selected}
                aria-disabled={!l.playable}
                aria-label={`${l.id} ${l.description}${l.playable ? '' : '，词库建设中'}`}
                onPress={() =>
                  l.playable ? setLevel(l.id) : setNotice(`${l.id} 词库建设中，敬请期待`)
                }
                style={s => [
                  styles.levelCard,
                  selected && styles.optionSelected,
                  !l.playable && styles.optionLocked,
                  s.pressed && l.playable && styles.optionPressed,
                  webFocus(s),
                ]}
              >
                <Text
                  style={[
                    styles.levelId,
                    selected && styles.textSelected,
                    !l.playable && styles.textLocked,
                  ]}
                >
                  {l.id}
                </Text>
                <Text style={[styles.optionSub, selected && styles.subSelected]}>
                  {l.playable ? l.description : '🔒 建设中'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionLabel zh={mode === 'verb' ? '词尾' : '主题'} es={mode === 'verb' ? 'GRUPO' : 'TEMA'} />
        <View style={styles.topicGrid} role="radiogroup" aria-label="主题">
          {topics.map(t => {
            const selected = selectedTopic?.id === t.id;
            return (
              <Pressable
                key={t.id}
                role="radio"
                aria-checked={selected}
                aria-label={`${t.name}，${t.count} 个单词`}
                onPress={() => setTopic(t.id)}
                style={s => [
                  styles.topicCard,
                  width >= 600 && styles.topicCardWide,
                  selected && styles.optionSelected,
                  s.pressed && styles.optionPressed,
                  webFocus(s),
                ]}
              >
                <Text style={[styles.topicName, selected && styles.textSelected]}>{t.name}</Text>
                <Text style={[styles.optionSub, selected && styles.subSelected]}>
                  {t.count} 个单词
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionLabel zh="棋盘" es="TABLERO" />
        <Segmented
          label="棋盘大小"
          options={BOARD_SIZES.map(b => ({
            id: String(b.size),
            label: `${b.label} ${b.size}×${b.size}`,
            a11y: `${b.label}棋盘，${b.size} 乘 ${b.size}，最多 ${b.maxWords} 个词`,
          }))}
          value={String(boardSize)}
          onChange={id => setBoardSize(Number(id) as BoardSize)}
        />
        <Text style={styles.difficultyHint}>
          最多放 {BOARD_SIZES.find(b => b.size === boardSize)!.maxWords} 个词
        </Text>

        <SectionLabel zh="难度" es="DIFICULTAD" />
        <Segmented
          label="难度"
          options={(Object.keys(DIFFICULTY_NAMES) as Difficulty[]).map(d => ({
            id: d,
            label: DIFFICULTY_NAMES[d],
            a11y: `${DIFFICULTY_NAMES[d]}，${DIFFICULTY_HINTS[d]}`,
          }))}
          value={difficulty}
          onChange={id => setDifficulty(id as Difficulty)}
        />
        <Text style={styles.difficultyHint}>{DIFFICULTY_HINTS[difficulty]}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        {notice ? (
          <Text style={styles.notice} aria-live="polite">
            {notice}
          </Text>
        ) : null}
        <Pressable
          role="button"
          aria-label={`开始，${activeLevel} ${selectedTopic?.name ?? ''}，${boardSize}×${boardSize}，${DIFFICULTY_NAMES[difficulty]}`}
          aria-disabled={!selectedTopic}
          disabled={!selectedTopic}
          onPress={handleStart}
          style={s => [
            styles.startButton,
            s.pressed && styles.startPressed,
            !selectedTopic && styles.startDisabled,
            webFocus(s),
          ]}
        >
          <Text style={styles.startText}>开始</Text>
          {selectedTopic && (
            <Text style={styles.startMeta}>
              {activeLevel} · {selectedTopic.name} · {boardSize}×{boardSize} · {DIFFICULTY_NAMES[difficulty]}
            </Text>
          )}
        </Pressable>
      </View>

      <Sheet visible={helpOpen} title="怎么玩" onClose={() => setHelpOpen(false)}>
        <HowToPlay />
      </Sheet>
    </SafeAreaView>
  );
};

interface SegmentedProps {
  label: string;
  options: { id: string; label: string; a11y?: string }[];
  value: string;
  onChange: (id: string) => void;
}

const Segmented: React.FC<SegmentedProps> = ({ label, options, value, onChange }) => (
  <View style={styles.segmented} role="radiogroup" aria-label={label}>
    {options.map(o => {
      const selected = value === o.id;
      return (
        <Pressable
          key={o.id}
          role="radio"
          aria-checked={selected}
          aria-label={o.a11y ?? o.label}
          onPress={() => onChange(o.id)}
          style={s => [styles.segment, selected && styles.segmentSelected, webFocus(s)]}
        >
          <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{o.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const SectionLabel: React.FC<{ zh: string; es: string }> = ({ zh, es }) => (
  <Text role="heading" style={styles.sectionLabel}>
    {zh} <Text style={[styles.sectionEs, latin(700)]}>· {es}</Text>
  </Text>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: space.sm },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: { backgroundColor: colors.surfaceAlt },
  iconText: { fontSize: 18, fontWeight: '700', color: colors.inkMuted },
  hero: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: space.xs,
  },
  brand: {
    ...type.display,
    ...latin(800),
    color: colors.ink,
    textAlign: 'center',
    marginTop: space.lg,
  },
  tagline: { ...type.body, color: colors.inkMuted, textAlign: 'center', marginTop: space.xs },
  statusCard: {
    marginTop: space.xl,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  statusText: { ...type.body, color: colors.inkMuted, textAlign: 'center' },
  statusNum: { ...latin(800), color: colors.ink },
  sectionLabel: {
    ...type.caption,
    color: colors.inkMuted,
    letterSpacing: 1,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  sectionEs: { color: colors.inkDisabled, letterSpacing: 1.5 },
  levelRow: { gap: space.sm, paddingRight: space.lg },
  levelCard: {
    width: 96,
    minHeight: 72,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  levelId: { ...latin(800), fontSize: 22, lineHeight: 28, color: colors.ink },
  optionSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 2 },
  optionLocked: { backgroundColor: colors.surfaceAlt, borderStyle: 'dashed', borderColor: colors.borderStrong },
  optionPressed: { opacity: 0.85 },
  textSelected: { color: colors.primaryPressed },
  textLocked: { color: colors.inkDisabled },
  optionSub: { ...type.caption, color: colors.inkMuted, marginTop: 2 },
  subSelected: { color: colors.primary },
  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  topicCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 64,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  topicCardWide: { flexBasis: '30%' },
  topicName: { ...type.heading, color: colors.ink },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: { backgroundColor: colors.surface, boxShadow: shadow.card },
  segmentText: { ...type.label, color: colors.inkMuted },
  segmentTextSelected: { color: colors.primaryPressed, fontWeight: '700' },
  difficultyHint: { ...type.caption, color: colors.inkMuted, marginTop: space.sm, textAlign: 'center' },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
    alignItems: 'center',
  },
  notice: {
    ...type.caption,
    color: colors.warning,
    backgroundColor: colors.warningSoft,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    marginBottom: space.sm,
    overflow: 'hidden',
  },
  startButton: {
    width: '100%',
    maxWidth: 528,
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.sm,
    boxShadow: shadow.primary,
  },
  startPressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: 0.98 }] },
  startDisabled: { opacity: 0.4, boxShadow: 'none' },
  startText: { fontSize: 18, fontWeight: '800', color: colors.onPrimary },
  startMeta: { ...type.caption, ...latin(700), color: colors.onPrimary, opacity: 0.9, marginTop: 1 },
});

import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Word } from '@/types/game';
import { colors, latin, radius, shadow, space, type, webFocus } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// 把例句拆成 [前, 高亮, 后]（不区分大小写，只高亮第一次出现）
export const splitHighlight = (sentence: string, highlight?: string): [string, string, string] => {
  if (!highlight) return [sentence, '', ''];
  const i = sentence.toLocaleLowerCase('es').indexOf(highlight.toLocaleLowerCase('es'));
  if (i < 0) return [sentence, '', ''];
  return [sentence.slice(0, i), sentence.slice(i, i + highlight.length), sentence.slice(i + highlight.length)];
};

export const ExampleSentence: React.FC<{ word: Word; compact?: boolean }> = ({ word, compact }) => {
  if (!word.exampleSentence) return null;
  const [before, hit, after] = splitHighlight(word.exampleSentence, word.exampleHighlight ?? word.spanish);
  return (
    <View>
      <Text style={[compact ? styles.esCompact : styles.es, latin(600)]} accessibilityLanguage="es-ES">
        {before}
        <Text style={[styles.hit, latin(800)]}>{hit}</Text>
        {after}
      </Text>
      {word.exampleTranslation ? (
        <Text style={compact ? styles.zhCompact : styles.zh}>{word.exampleTranslation}</Text>
      ) : null}
    </View>
  );
};

interface Props {
  word: Word | null;
  onClose: () => void;
  onReport?: (word: Word) => void;
}

// 答对一个词后，暂时替换线索栏显示的例句卡片
export const ExampleCard: React.FC<Props> = ({ word, onClose, onReport }) => {
  const reducedMotion = useReducedMotion();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!word) return;
    anim.setValue(reducedMotion ? 1 : 0);
    if (!reducedMotion) {
      Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }
  }, [word, anim, reducedMotion]);

  if (!word?.exampleSentence) return null;

  return (
    <Animated.View
      role="status"
      aria-live="polite"
      style={[
        styles.card,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.badge}>✓ {word.spanish}</Text>
        <Text style={styles.label}>例句</Text>
      </View>
      <ExampleSentence word={word} />
      <View style={styles.actions}>
        {onReport && (
          <Pressable
            role="button"
            aria-label={`报错：${word.spanish}`}
            onPress={() => onReport(word)}
            style={s => [styles.reportButton, webFocus(s)]}
          >
            <Text style={styles.reportText}>报错</Text>
          </Pressable>
        )}
        <Pressable
          role="button"
          aria-label="继续"
          onPress={onClose}
          style={s => [styles.continueButton, s.pressed && styles.continuePressed, webFocus(s)]}
        >
          <Text style={styles.continueText}>继续</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space.sm,
    marginBottom: space.sm,
    minHeight: 52,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.tileCorrectEdge,
    borderLeftWidth: 4,
    boxShadow: shadow.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xs },
  badge: {
    ...type.caption,
    fontWeight: '800',
    color: colors.onSuccessSoft,
    backgroundColor: colors.successSoft,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  label: { ...type.caption, color: colors.inkMuted, flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  reportButton: { minHeight: 44, paddingHorizontal: space.md, justifyContent: 'center' },
  reportText: { ...type.caption, color: colors.inkMuted, textDecorationLine: 'underline' },
  continueButton: {
    minHeight: 44,
    minWidth: 96,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continuePressed: { opacity: 0.85 },
  continueText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
  es: { fontSize: 17, lineHeight: 24, color: colors.ink },
  esCompact: { fontSize: 14, lineHeight: 20, color: colors.ink },
  hit: { color: colors.primary },
  zh: { ...type.body, color: colors.inkMuted, marginTop: 2 },
  zhCompact: { ...type.caption, color: colors.inkMuted, marginTop: 1 },
});

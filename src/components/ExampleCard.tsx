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
}

// 答对一个词后，从键盘上方弹出的例句卡片
export const ExampleCard: React.FC<Props> = ({ word, onClose }) => {
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
        <Pressable
          role="button"
          aria-label="关闭例句"
          hitSlop={10}
          onPress={onClose}
          style={s => [styles.close, webFocus(s)]}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      <ExampleSentence word={word} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space.sm,
    marginBottom: space.sm,
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
  close: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 14, color: colors.inkMuted },
  es: { fontSize: 17, lineHeight: 24, color: colors.ink },
  esCompact: { fontSize: 14, lineHeight: 20, color: colors.ink },
  hit: { color: colors.primary },
  zh: { ...type.body, color: colors.inkMuted, marginTop: 2 },
  zhCompact: { ...type.caption, color: colors.inkMuted, marginTop: 1 },
});

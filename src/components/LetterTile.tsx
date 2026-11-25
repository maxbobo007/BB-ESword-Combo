import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, latin, type } from '@/theme';

export type TileState = 'default' | 'hint' | 'active' | 'selected' | 'correct' | 'wrong';

interface LetterTileProps {
  size: number;
  letter?: string | null;
  number?: number;
  state?: TileState;
  // 游戏中用"提示"揭示的字母：右上角加小圆点，和开局给出的字母区分
  revealed?: boolean;
  // 主页装饰用：拼字游戏风格的分值
  value?: number;
  style?: ViewStyle;
}

const PALETTE: Record<TileState, { bg: string; border: string; edge: string; text: string }> = {
  default: { bg: colors.tile, border: colors.tileBorder, edge: colors.tileEdge, text: colors.tileText },
  hint: { bg: colors.tileHintBg, border: colors.tileBorder, edge: colors.tileEdge, text: colors.tileHintText },
  active: { bg: colors.tileActiveWord, border: colors.tileActiveBorder, edge: colors.tileActiveBorder, text: colors.tileText },
  selected: { bg: colors.tileSelected, border: colors.tileSelectedEdge, edge: colors.tileSelectedEdge, text: colors.onPrimary },
  correct: { bg: colors.tileCorrectBg, border: colors.tileCorrectEdge, edge: colors.tileCorrectEdge, text: colors.tileCorrectText },
  wrong: { bg: colors.dangerSoft, border: colors.danger, edge: colors.danger, text: colors.ink },
};

// 有"厚度"的字母方块：上左右细边 + 更深更厚的底边，不用阴影，三端一致
export const LetterTile: React.FC<LetterTileProps> = ({
  size,
  letter,
  number,
  state = 'default',
  revealed,
  value,
  style,
}) => {
  const p = PALETTE[state];
  const borderWidth = state === 'selected' ? 2.5 : state === 'active' || state === 'wrong' ? 2 : 1.5;
  const edgeWidth = Math.max(3, Math.round(size * 0.07));
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.16),
          backgroundColor: p.bg,
          borderColor: p.border,
          borderWidth,
          borderBottomWidth: edgeWidth,
          borderBottomColor: p.edge,
          paddingTop: edgeWidth - borderWidth,
        },
        state === 'selected' && styles.lifted,
        style,
      ]}
    >
      {number !== undefined && (
        <Text
          maxFontSizeMultiplier={1}
          style={[
            styles.number,
            latin(700),
            {
              fontSize: Math.max(9, Math.round(size * type.tileNumberRatio)),
              lineHeight: Math.max(10, Math.round(size * type.tileNumberRatio) + 2),
              color: state === 'selected' ? colors.onPrimary : colors.tileNumber,
            },
          ]}
        >
          {number}
        </Text>
      )}
      {revealed && (
        <View
          style={[
            styles.dot,
            { backgroundColor: state === 'selected' ? colors.onPrimary : colors.tileHintText },
          ]}
        />
      )}
      <Text
        maxFontSizeMultiplier={1.15}
        style={[latin(800), { fontSize: Math.round(size * type.tileLetterRatio), color: p.text }]}
      >
        {letter ?? ''}
      </Text>
      {/* 错误状态除了颜色还有下划线 */}
      {state === 'wrong' && <View style={styles.wrongMark} />}
      {value !== undefined && (
        <Text style={[styles.value, latin(700), { color: p.text }]}>{value}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
  lifted: { transform: [{ scale: 1.06 }], zIndex: 1 },
  number: { position: 'absolute', top: 1, left: 3 },
  dot: { position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: 3 },
  wrongMark: {
    position: 'absolute',
    bottom: 3,
    left: '22%',
    right: '22%',
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.danger,
  },
  value: { position: 'absolute', right: 3, bottom: 1, fontSize: 9 },
});

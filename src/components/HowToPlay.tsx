import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '@/theme';
import { LetterTile, TileState } from '@/components/LetterTile';

const STEPS: { state: TileState; letter: string; revealed?: boolean; title: string; text: string }[] = [
  { state: 'selected', letter: 'P', title: '点格子开始填', text: '再点一次同一格，可以在横向和纵向之间切换。' },
  { state: 'active', letter: 'A', title: '看键盘上方的线索', text: '线索是中文意思，填出对应的西语单词。点线索条两侧的 ‹ › 换一个词。' },
  { state: 'hint', letter: 'N', title: '浅棕色格子是送你的字母', text: '它们不能修改。用"提示"揭示的字母右上角有一个小圆点。' },
  { state: 'correct', letter: 'E', title: '整个词填对会变绿', text: '填满但不对时，错的字母会标红并加下划线，改掉就行。' },
];

export const HowToPlay: React.FC = () => (
  <View style={styles.list}>
    {STEPS.map(s => (
      <View key={s.title} style={styles.item}>
        <LetterTile size={40} letter={s.letter} state={s.state} revealed={s.revealed} />
        <View style={styles.textCol}>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.text}>{s.text}</Text>
        </View>
      </View>
    ))}
    <Text style={styles.note}>
      键盘最上面一行是带重音的字母（Á É Í Ó Ú Ü）。重音也算对错：漏写重音的格子会变黄并带「´」记号，改成带重音的字母就行。电脑上可以直接用键盘打字。
    </Text>
  </View>
);

const styles = StyleSheet.create({
  list: { gap: space.lg },
  item: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  textCol: { flex: 1 },
  title: { ...type.heading, color: colors.ink },
  text: { ...type.body, color: colors.inkMuted, marginTop: 2 },
  note: {
    ...type.body,
    color: colors.inkMuted,
    backgroundColor: colors.surfaceAlt,
    padding: space.md,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

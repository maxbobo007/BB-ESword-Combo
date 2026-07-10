import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CrosswordWord } from '@/core/types/game';
import { useCupertino } from '@/theme/ThemeProvider';
import { type } from '@/theme/cupertino';
import { Icon } from '@/components/cupertino/Icon';

interface ClueListProps {
  words: CrosswordWord[];
  onSpeakWord?: (word: CrosswordWord) => void; // 提供时显示发音按钮
}

export const ClueList: React.FC<ClueListProps> = ({ words, onSpeakWord }) => {
  const { colors } = useCupertino();
  const horizontalWords = words.filter(w => w.direction === 'horizontal');
  const verticalWords = words.filter(w => w.direction === 'vertical');

  const renderClue = (word: CrosswordWord) => (
    <View key={word.id} style={styles.clueRow}>
      <Text
        style={[
          type.subhead,
          styles.clueText,
          { color: word.isCompleted ? colors.green : colors.secondaryLabel },
        ]}
      >
        {word.clueNumber}. {word.wordData.english}（{word.wordData.chinese}）
        {word.isCompleted ? ` → ${word.wordData.spanish}` : ''}
      </Text>
      {onSpeakWord && word.isCompleted && (
        <TouchableOpacity
          onPress={() => onSpeakWord(word)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`朗读 ${word.wordData.spanish}`}
        >
          <Icon name="volume-medium" size={19} color={colors.tint} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSection = (header: string, sectionWords: CrosswordWord[]) => (
    <View style={styles.section}>
      <Text style={[type.footnote, styles.header, { color: colors.secondaryLabel }]}>
        {header.toUpperCase()}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {sectionWords.map(renderClue)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderSection('横向 Horizontal', horizontalWords)}
      {renderSection('纵向 Vertical', verticalWords)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    gap: 18,
  },
  section: {},
  header: {
    marginLeft: 16,
    marginBottom: 6,
  },
  card: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  clueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 26,
  },
  clueText: {
    flex: 1,
  },
});

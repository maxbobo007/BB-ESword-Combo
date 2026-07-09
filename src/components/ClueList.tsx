import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, List, IconButton, Text, useTheme } from 'react-native-paper';
import { CrosswordWord } from '@/core/types/game';

interface ClueListProps {
  words: CrosswordWord[];
  onSpeakWord?: (word: CrosswordWord) => void; // 提供时显示发音按钮
}

export const ClueList: React.FC<ClueListProps> = ({ words, onSpeakWord }) => {
  const theme = useTheme();
  const horizontalWords = words.filter(w => w.direction === 'horizontal');
  const verticalWords = words.filter(w => w.direction === 'vertical');

  const renderClue = (word: CrosswordWord) => (
    <View key={word.id} style={styles.clueRow}>
      <Text
        variant="bodyMedium"
        style={[
          styles.clueText,
          {
            color: word.isCompleted ? theme.colors.tertiary : theme.colors.onSurfaceVariant,
          },
        ]}
      >
        {word.clueNumber}. {word.wordData.english}（{word.wordData.chinese}）
        {word.isCompleted ? ` → ${word.wordData.spanish}` : ''}
      </Text>
      {onSpeakWord && word.isCompleted && (
        <IconButton
          icon="volume-high"
          size={18}
          style={styles.speakButton}
          iconColor={theme.colors.primary}
          onPress={() => onSpeakWord(word)}
          accessibilityLabel={`朗读 ${word.wordData.spanish}`}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Card mode="contained" style={styles.card}>
        <List.Subheader>横向 Horizontal</List.Subheader>
        <Card.Content style={styles.cardContent}>{horizontalWords.map(renderClue)}</Card.Content>
      </Card>
      <Card mode="contained" style={styles.card}>
        <List.Subheader>纵向 Vertical</List.Subheader>
        <Card.Content style={styles.cardContent}>{verticalWords.map(renderClue)}</Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 12,
  },
  card: {},
  cardContent: {
    paddingTop: 0,
  },
  clueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 32,
  },
  clueText: {
    flex: 1,
  },
  speakButton: {
    margin: 0,
  },
});

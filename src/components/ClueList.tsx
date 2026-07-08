import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CrosswordWord } from '@/core/types/game';
import { Theme } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

interface ClueListProps {
  words: CrosswordWord[];
  onSpeakWord?: (word: CrosswordWord) => void; // 提供时显示发音按钮
}

export const ClueList: React.FC<ClueListProps> = ({ words, onSpeakWord }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const horizontalWords = words.filter(w => w.direction === 'horizontal');
  const verticalWords = words.filter(w => w.direction === 'vertical');

  const renderClue = (word: CrosswordWord) => (
    <View key={word.id} style={styles.clueRow}>
      <Text style={[styles.clue, word.isCompleted && styles.clueCompleted]}>
        {word.clueNumber}. {word.wordData.english}（{word.wordData.chinese}）
        {word.isCompleted ? ` → ${word.wordData.spanish}` : ''}
      </Text>
      {onSpeakWord && word.isCompleted && (
        <TouchableOpacity
          style={styles.speakButton}
          onPress={() => onSpeakWord(word)}
          accessibilityLabel={`朗读 ${word.wordData.spanish}`}
        >
          <Text style={styles.speakButtonText}>🔊</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.cluesContainer}>
      <View style={styles.clueSection}>
        <Text style={styles.clueTitle}>横向 (Horizontal)</Text>
        {horizontalWords.map(renderClue)}
      </View>
      <View style={styles.clueSection}>
        <Text style={styles.clueTitle}>纵向 (Vertical)</Text>
        {verticalWords.map(renderClue)}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    cluesContainer: {
      marginTop: 24,
      gap: 16,
    },
    clueSection: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 8,
    },
    clueTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    clueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    clue: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    clueCompleted: {
      color: theme.colors.success,
      fontWeight: '600',
    },
    speakButton: {
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    speakButtonText: {
      fontSize: 16,
    },
  });

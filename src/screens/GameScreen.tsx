import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { CrosswordCell } from '@/types/game';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min((width - 40) / 15, 30);

export const GameScreen: React.FC = () => {
  const {
    currentPuzzle,
    currentSession,
    updateCell,
    useHint,
    resetGame,
  } = useGameStore();

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (currentSession?.isCompleted) {
      Alert.alert(
        '恭喜完成!',
        `得分: ${currentSession.score}\n错误: ${currentSession.mistakes}\n提示使用: ${currentSession.hintsUsed}`,
        [{ text: '返回', onPress: resetGame }]
      );
    }
  }, [currentSession?.isCompleted]);

  if (!currentPuzzle || !currentSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>请从主菜单选择游戏</Text>
      </View>
    );
  }

  const handleCellPress = (row: number, col: number) => {
    const cell = currentSession.currentCells[row][col];
    if (!cell.correctLetter) return;
    setSelectedCell({ row, col });
  };

  const handleLetterInput = (letter: string) => {
    if (!selectedCell) return;
    updateCell(selectedCell.row, selectedCell.col, letter);
  };

  const renderCell = (cell: CrosswordCell) => {
    const isSelected =
      selectedCell?.row === cell.row && selectedCell?.col === cell.col;
    const isEmpty = !cell.correctLetter;

    return (
      <TouchableOpacity
        key={`${cell.row}-${cell.col}`}
        style={[
          styles.cell,
          isEmpty && styles.emptyCell,
          isSelected && styles.selectedCell,
          cell.isFixed && styles.fixedCell,
        ]}
        onPress={() => handleCellPress(cell.row, cell.col)}
        disabled={isEmpty || cell.isFixed}
      >
        <Text
          style={[
            styles.cellText,
            cell.isFixed && styles.fixedCellText,
          ]}
        >
          {cell.letter || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderKeyboard = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÑ'.split('');

    return (
      <View style={styles.keyboard}>
        <View style={styles.keyboardRow}>
          {alphabet.slice(0, 10).map(letter => (
            <TouchableOpacity
              key={letter}
              style={styles.key}
              onPress={() => handleLetterInput(letter)}
            >
              <Text style={styles.keyText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyboardRow}>
          {alphabet.slice(10, 19).map(letter => (
            <TouchableOpacity
              key={letter}
              style={styles.key}
              onPress={() => handleLetterInput(letter)}
            >
              <Text style={styles.keyText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyboardRow}>
          {alphabet.slice(19).map(letter => (
            <TouchableOpacity
              key={letter}
              style={styles.key}
              onPress={() => handleLetterInput(letter)}
            >
              <Text style={styles.keyText}>{letter}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.key, styles.deleteKey]}
            onPress={() => handleLetterInput('')}
          >
            <Text style={styles.keyText}>DEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderClues = () => {
    const horizontalWords = currentPuzzle.words.filter(w => w.direction === 'horizontal');
    const verticalWords = currentPuzzle.words.filter(w => w.direction === 'vertical');

    return (
      <View style={styles.cluesContainer}>
        <View style={styles.clueSection}>
          <Text style={styles.clueTitle}>横向 (Horizontal)</Text>
          {horizontalWords.map(word => (
            <Text key={word.id} style={styles.clue}>
              {word.clueNumber}. {word.wordData.english} ({word.wordData.chinese})
            </Text>
          ))}
        </View>
        <View style={styles.clueSection}>
          <Text style={styles.clueTitle}>纵向 (Vertical)</Text>
          {verticalWords.map(word => (
            <Text key={word.id} style={styles.clue}>
              {word.clueNumber}. {word.wordData.english} ({word.wordData.chinese})
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>西语填字</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>错误: {currentSession.mistakes}</Text>
          <Text style={styles.statText}>提示: {currentSession.hintsUsed}</Text>
          <TouchableOpacity style={styles.hintButton} onPress={useHint}>
            <Text style={styles.hintButtonText}>使用提示</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.gridContainer}>
          {currentSession.currentCells.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map(cell => renderCell(cell))}
            </View>
          ))}
        </View>

        {renderClues()}
      </ScrollView>

      {renderKeyboard()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  hintButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  hintButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  gridContainer: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyCell: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  selectedCell: {
    backgroundColor: '#BBDEFB',
  },
  fixedCell: {
    backgroundColor: '#E3F2FD',
  },
  cellText: {
    fontSize: CELL_SIZE * 0.6,
    fontWeight: '600',
    color: '#333',
  },
  fixedCellText: {
    color: '#1976D2',
  },
  cluesContainer: {
    marginTop: 24,
    gap: 16,
  },
  clueSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  clueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  clue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  keyboard: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 4,
  },
  key: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  deleteKey: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
  },
  keyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

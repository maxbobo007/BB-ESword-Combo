import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CrosswordCell } from '@/core/types/game';
import { GameTheme } from '@/theme/tokens';
import { useGameTheme } from '@/theme/ThemeProvider';

interface GridProps {
  cells: CrosswordCell[][];
  selectedCell: { row: number; col: number } | null;
  onCellPress: (row: number, col: number) => void;
}

export const Grid: React.FC<GridProps> = ({ cells, selectedCell, onCellPress }) => {
  const theme = useGameTheme();
  const gridSize = cells.length || 15;
  const cellSize = Math.min((Dimensions.get('window').width - 40) / gridSize, 30);
  const styles = useMemo(() => createStyles(theme, cellSize), [theme, cellSize]);

  return (
    <View style={styles.gridContainer}>
      {cells.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(cell => {
            const isSelected = selectedCell?.row === cell.row && selectedCell?.col === cell.col;
            const isEmpty = !cell.correctLetter;
            const isCorrect =
              !isEmpty && !cell.isFixed && cell.letter === cell.correctLetter;
            return (
              <TouchableOpacity
                key={`${cell.row}-${cell.col}`}
                style={[
                  styles.cell,
                  isEmpty && styles.emptyCell,
                  isCorrect && styles.correctCell,
                  cell.isFixed && styles.fixedCell,
                  isSelected && styles.selectedCell,
                ]}
                onPress={() => onCellPress(cell.row, cell.col)}
                disabled={isEmpty || cell.isFixed}
              >
                <Text style={[styles.cellText, cell.isFixed && styles.fixedCellText]}>
                  {cell.letter || ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const createStyles = (theme: GameTheme, cellSize: number) =>
  StyleSheet.create({
    gridContainer: {
      alignSelf: 'center',
      backgroundColor: theme.cell.bg,
      padding: 4,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    row: {
      flexDirection: 'row',
    },
    cell: {
      width: cellSize,
      height: cellSize,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.cell.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.cell.bg,
    },
    emptyCell: {
      backgroundColor: theme.cell.blocked,
      borderColor: theme.cell.blocked,
    },
    selectedCell: {
      backgroundColor: theme.cell.selected,
    },
    fixedCell: {
      backgroundColor: theme.cell.fixedBg,
    },
    correctCell: {
      backgroundColor: theme.cell.correctBg,
    },
    cellText: {
      fontSize: cellSize * 0.6,
      fontWeight: '600',
      color: theme.cell.text,
    },
    fixedCellText: {
      color: theme.cell.fixedText,
    },
  });

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CrosswordCell } from '@/core/types/game';
import { Theme } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

interface GridProps {
  cells: CrosswordCell[][];
  selectedCell: { row: number; col: number } | null;
  onCellPress: (row: number, col: number) => void;
}

export const Grid: React.FC<GridProps> = ({ cells, selectedCell, onCellPress }) => {
  const theme = useTheme();
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
            return (
              <TouchableOpacity
                key={`${cell.row}-${cell.col}`}
                style={[
                  styles.cell,
                  isEmpty && styles.emptyCell,
                  isSelected && styles.selectedCell,
                  cell.isFixed && styles.fixedCell,
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

const createStyles = (theme: Theme, cellSize: number) =>
  StyleSheet.create({
    gridContainer: {
      alignSelf: 'center',
      backgroundColor: theme.colors.surface,
      padding: 4,
      borderRadius: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    row: {
      flexDirection: 'row',
    },
    cell: {
      width: cellSize,
      height: cellSize,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.cellBg,
    },
    emptyCell: {
      backgroundColor: theme.colors.cellBlocked,
      borderColor: theme.colors.cellBlocked,
    },
    selectedCell: {
      backgroundColor: theme.colors.cellSelected,
    },
    fixedCell: {
      backgroundColor: theme.colors.cellFixedBg,
    },
    cellText: {
      fontSize: cellSize * 0.6,
      fontWeight: '600',
      color: theme.colors.cellText,
    },
    fixedCellText: {
      color: theme.colors.cellFixedText,
    },
  });

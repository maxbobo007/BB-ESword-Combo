import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CrosswordCell } from '@/core/types/game';
import { GameTheme } from '@/theme/tokens';
import { useGameTheme } from '@/theme/ThemeProvider';

interface GridProps {
  cells: CrosswordCell[][];
  selectedCell: { row: number; col: number } | null;
  /** 当前单词的格子（"row-col"），整词淡高亮 */
  activeWordKeys?: Set<string>;
  onCellPress: (row: number, col: number) => void;
}

export const Grid: React.FC<GridProps> = ({ cells, selectedCell, activeWordKeys, onCellPress }) => {
  const theme = useGameTheme();

  // 裁剪到实际有单词的包围盒，不渲染四周的空白区域
  const visible = useMemo(() => {
    let minR = cells.length, maxR = -1, minC = cells.length, maxC = -1;
    cells.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell.correctLetter) {
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
        }
      }),
    );
    if (maxR < 0) {
      return cells;
    }
    return cells.slice(minR, maxR + 1).map(row => row.slice(minC, maxC + 1));
  }, [cells]);

  const colCount = visible[0]?.length || 1;
  const cellSize = Math.min((Dimensions.get('window').width - 56) / colCount, 40);
  const styles = useMemo(() => createStyles(theme, cellSize), [theme, cellSize]);

  return (
    <View style={styles.gridContainer}>
      {visible.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(cell => {
            const isSelected = selectedCell?.row === cell.row && selectedCell?.col === cell.col;
            const isEmpty = !cell.correctLetter;
            const isCorrect =
              !isEmpty && !cell.isFixed && cell.letter === cell.correctLetter;
            const inActiveWord = activeWordKeys?.has(`${cell.row}-${cell.col}`) ?? false;
            return (
              <TouchableOpacity
                key={`${cell.row}-${cell.col}`}
                style={[
                  styles.cell,
                  isEmpty && styles.emptyCell,
                  inActiveWord && styles.activeWordCell,
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
      // 稀疏布局下空档透明，只显示单词格子（避免整块黑板观感）
      backgroundColor: 'transparent',
      borderColor: 'transparent',
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
    activeWordCell: {
      backgroundColor: theme.cell.wordHighlight,
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

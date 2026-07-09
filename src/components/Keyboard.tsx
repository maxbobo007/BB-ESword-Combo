import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

// 归一化后的谜面只含 A-Z 和 Ñ（重音在生成时去除）
const ROWS = ['ABCDEFGHIJ', 'KLMNOPQRS', 'TUVWXYZÑ'];

interface KeyboardProps {
  onKeyPress: (letter: string) => void;
  onDelete: () => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, onDelete }) => {
  const theme = useTheme();

  return (
    <View style={[styles.keyboard, { backgroundColor: theme.colors.surface }]}>
      {ROWS.map((row, index) => (
        <View key={row} style={styles.keyboardRow}>
          {row.split('').map(letter => (
            <TouchableRipple
              key={letter}
              style={[styles.key, { backgroundColor: theme.colors.surfaceVariant }]}
              borderless
              onPress={() => onKeyPress(letter)}
            >
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {letter}
              </Text>
            </TouchableRipple>
          ))}
          {index === ROWS.length - 1 && (
            <TouchableRipple
              style={[styles.key, styles.deleteKey, { backgroundColor: theme.colors.errorContainer }]}
              borderless
              onPress={onDelete}
            >
              <Text variant="titleSmall" style={{ color: theme.colors.onErrorContainer }}>
                ⌫
              </Text>
            </TouchableRipple>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
    gap: 5,
  },
  key: {
    minWidth: 33,
    height: 46, // MD3 最小触控高度
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  deleteKey: {
    paddingHorizontal: 14,
  },
});

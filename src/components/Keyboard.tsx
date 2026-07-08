import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

// 归一化后的谜面只含 A-Z 和 Ñ（重音在生成时去除）
const ROWS = ['ABCDEFGHIJ', 'KLMNOPQRS', 'TUVWXYZÑ'];

interface KeyboardProps {
  onKeyPress: (letter: string) => void;
  onDelete: () => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, onDelete }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.keyboard}>
      {ROWS.map((row, index) => (
        <View key={row} style={styles.keyboardRow}>
          {row.split('').map(letter => (
            <TouchableOpacity key={letter} style={styles.key} onPress={() => onKeyPress(letter)}>
              <Text style={styles.keyText}>{letter}</Text>
            </TouchableOpacity>
          ))}
          {index === ROWS.length - 1 && (
            <TouchableOpacity style={[styles.key, styles.deleteKey]} onPress={onDelete}>
              <Text style={[styles.keyText, styles.deleteKeyText]}>DEL</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    keyboard: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    keyboardRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 4,
      gap: 4,
    },
    key: {
      backgroundColor: theme.colors.keyBg,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 4,
      minWidth: 32,
      alignItems: 'center',
    },
    deleteKey: {
      backgroundColor: theme.colors.warning,
      paddingHorizontal: 12,
    },
    keyText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.keyText,
    },
    deleteKeyText: {
      color: theme.dark ? '#1a1a1a' : '#ffffff',
    },
  });

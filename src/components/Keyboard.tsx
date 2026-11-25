import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useCupertino } from '@/theme/ThemeProvider';
import { Icon } from '@/components/cupertino/Icon';

// 归一化后的谜面只含 A-Z 和 Ñ（重音在生成时去除）；样式仿 iOS 系统键盘
const ROWS = ['ABCDEFGHIJ', 'KLMNOPQRS', 'TUVWXYZÑ'];

interface KeyboardProps {
  onKeyPress: (letter: string) => void;
  onDelete: () => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, onDelete }) => {
  const { dark, colors } = useCupertino();
  const keyBg = dark ? '#3A3A3C' : '#FFFFFF';
  const deleteBg = dark ? '#2C2C2E' : '#B4BCC8';

  return (
    <View style={[styles.keyboard, { backgroundColor: dark ? '#1C1C1E' : '#D1D5DB' }]}>
      {ROWS.map((row, index) => (
        <View key={row} style={styles.keyboardRow}>
          {row.split('').map(letter => (
            <Pressable
              key={letter}
              style={({ pressed }) => [
                styles.key,
                { backgroundColor: keyBg, opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={() => onKeyPress(letter)}
            >
              <Text style={[styles.keyText, { color: colors.label }]}>{letter}</Text>
            </Pressable>
          ))}
          {index === ROWS.length - 1 && (
            <Pressable
              style={({ pressed }) => [
                styles.key,
                styles.deleteKey,
                { backgroundColor: deleteBg, opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={onDelete}
            >
              <Icon name="backspace-outline" size={22} color={colors.label} />
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    paddingVertical: 8,
    paddingHorizontal: 3,
    paddingBottom: 18,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 5,
  },
  key: {
    minWidth: 33,
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 0.5,
    elevation: 1,
  },
  keyText: {
    fontSize: 20,
    fontWeight: '400',
  },
  deleteKey: {
    paddingHorizontal: 12,
  },
});

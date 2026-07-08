import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useSettingsStore, ThemeMode } from '@/store/settingsStore';
import { Theme } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: '跟随系统' },
  { mode: 'light', label: '浅色' },
  { mode: 'dark', label: '深色' },
];

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { themeMode, ttsEnabled, setThemeMode, setTtsEnabled } = useSettingsStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>外观</Text>
      <View style={styles.card}>
        {THEME_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.mode}
            style={styles.optionRow}
            onPress={() => setThemeMode(option.mode)}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.radio}>{themeMode === option.mode ? '●' : '○'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>发音</Text>
      <View style={styles.card}>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>完成单词时自动朗读</Text>
          <Switch
            value={ttsEnabled}
            onValueChange={setTtsEnabled}
            trackColor={{ true: theme.colors.primary }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      marginTop: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
    },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    optionLabel: {
      fontSize: 16,
      color: theme.colors.textPrimary,
    },
    radio: {
      fontSize: 18,
      color: theme.colors.primary,
    },
  });

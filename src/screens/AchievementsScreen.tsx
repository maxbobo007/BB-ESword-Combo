import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useProgressStore } from '@/store/progressStore';
import { ACHIEVEMENTS } from '@/core/achievements/definitions';
import { Theme } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export const AchievementsScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const progress = useProgressStore(s => s.progress);
  const unlockedCount = ACHIEVEMENTS.filter(a => a.id in progress.achievements).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.summary}>
        已解锁 {unlockedCount} / {ACHIEVEMENTS.length}
      </Text>
      {ACHIEVEMENTS.map(def => {
        const unlockedAt = progress.achievements[def.id];
        const unlocked = unlockedAt !== undefined;
        return (
          <View key={def.id} style={[styles.card, !unlocked && styles.cardLocked]}>
            <Text style={[styles.icon, !unlocked && styles.iconLocked]}>
              {unlocked ? def.icon : '🔒'}
            </Text>
            <View style={styles.cardBody}>
              <Text style={[styles.title, !unlocked && styles.titleLocked]}>{def.title}</Text>
              <Text style={styles.description}>{def.description}</Text>
              {unlocked && (
                <Text style={styles.unlockedAt}>
                  解锁于 {new Date(unlockedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        );
      })}
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
    summary: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 16,
      textAlign: 'center',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
    },
    cardLocked: {
      opacity: 0.6,
    },
    icon: {
      fontSize: 28,
      marginRight: 14,
    },
    iconLocked: {
      opacity: 0.7,
    },
    cardBody: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    titleLocked: {
      color: theme.colors.textSecondary,
    },
    description: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    unlockedAt: {
      fontSize: 12,
      color: theme.colors.success,
      marginTop: 4,
    },
  });

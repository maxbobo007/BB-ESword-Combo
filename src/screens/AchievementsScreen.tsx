import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Appbar, Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProgressStore } from '@/store/progressStore';
import { ACHIEVEMENTS } from '@/core/achievements/definitions';
import { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Achievements'>;

export const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const progress = useProgressStore(s => s.progress);
  const unlockedCount = ACHIEVEMENTS.filter(a => a.id in progress.achievements).length;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <Appbar.Header mode="small" elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="成就" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressHeader}>
          <Text variant="titleMedium">
            已解锁 {unlockedCount} / {ACHIEVEMENTS.length}
          </Text>
          <ProgressBar
            progress={ACHIEVEMENTS.length ? unlockedCount / ACHIEVEMENTS.length : 0}
            style={styles.progressBar}
          />
        </View>

        {ACHIEVEMENTS.map(def => {
          const unlockedAt = progress.achievements[def.id];
          const unlocked = unlockedAt !== undefined;
          return (
            <Card
              key={def.id}
              mode={unlocked ? 'elevated' : 'contained'}
              style={[styles.card, !unlocked && styles.cardLocked]}
            >
              <Card.Title
                title={def.title}
                subtitle={
                  unlocked
                    ? `${def.description} · ${new Date(unlockedAt).toLocaleDateString()}`
                    : def.description
                }
                left={() => <Text style={styles.icon}>{unlocked ? def.icon : '🔒'}</Text>}
                titleStyle={unlocked ? undefined : { color: theme.colors.onSurfaceVariant }}
              />
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  progressHeader: { marginBottom: 16 },
  progressBar: { marginTop: 8, borderRadius: 4 },
  card: { marginBottom: 10 },
  cardLocked: { opacity: 0.65 },
  icon: { fontSize: 28 },
});

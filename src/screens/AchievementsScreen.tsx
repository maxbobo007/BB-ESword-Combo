import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProgressStore } from '@/store/progressStore';
import { ACHIEVEMENTS } from '@/core/achievements/definitions';
import { RootStackParamList } from '@/navigation/types';
import { useCupertino } from '@/theme/ThemeProvider';
import { type } from '@/theme/cupertino';
import { NavBar } from '@/components/cupertino/NavBar';
import { Group, Row } from '@/components/cupertino/InsetGroup';

type Props = NativeStackScreenProps<RootStackParamList, 'Achievements'>;

export const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useCupertino();
  const progress = useProgressStore(s => s.progress);
  const unlockedCount = ACHIEVEMENTS.filter(a => a.id in progress.achievements).length;
  const ratio = ACHIEVEMENTS.length ? unlockedCount / ACHIEVEMENTS.length : 0;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <NavBar title="成就" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressWrap}>
          <Text style={[type.subhead, { color: colors.secondaryLabel }]}>
            已解锁 {unlockedCount} / {ACHIEVEMENTS.length}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.fill }]}>
            <View
              style={[styles.bar, { backgroundColor: colors.tint, width: `${ratio * 100}%` }]}
            />
          </View>
        </View>

        <Group>
          {ACHIEVEMENTS.map(def => {
            const unlockedAt = progress.achievements[def.id];
            const unlocked = unlockedAt !== undefined;
            return (
              <View key={def.id} style={[styles.row, { opacity: unlocked ? 1 : 0.5 }]}>
                <Text style={styles.emoji}>{unlocked ? def.icon : '🔒'}</Text>
                <View style={styles.rowBody}>
                  <Text style={[type.body, { color: colors.label }]}>{def.title}</Text>
                  <Text style={[type.footnote, { color: colors.secondaryLabel }]}>
                    {def.description}
                    {unlocked ? ` · ${new Date(unlockedAt).toLocaleDateString()}` : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 32 },
  progressWrap: {
    paddingHorizontal: 32,
    marginBottom: 18,
    gap: 8,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: 4,
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowBody: {
    flex: 1,
    gap: 1,
  },
  emoji: {
    fontSize: 26,
  },
});

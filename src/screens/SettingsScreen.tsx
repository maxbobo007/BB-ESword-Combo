import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSettingsStore, ThemeMode } from '@/store/settingsStore';
import { RootStackParamList } from '@/navigation/types';
import { useCupertino } from '@/theme/ThemeProvider';
import { NavBar } from '@/components/cupertino/NavBar';
import { Group, Row } from '@/components/cupertino/InsetGroup';
import { CSwitch } from '@/components/cupertino/controls';
import { Icon } from '@/components/cupertino/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'system', label: '跟随系统', icon: 'contrast' },
  { mode: 'light', label: '浅色', icon: 'sunny' },
  { mode: 'dark', label: '深色', icon: 'moon' },
];

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useCupertino();
  const {
    themeMode,
    ttsEnabled,
    useSystemKeyboard,
    setThemeMode,
    setTtsEnabled,
    setUseSystemKeyboard,
  } = useSettingsStore();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <NavBar title="设置" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Group header="外观">
          {THEME_OPTIONS.map(option => (
            <Row
              key={option.mode}
              title={option.label}
              icon={option.icon}
              iconColor="#5856D6"
              right={
                themeMode === option.mode ? (
                  <Icon name="checkmark" size={20} color={colors.tint} />
                ) : undefined
              }
              onPress={() => setThemeMode(option.mode)}
            />
          ))}
        </Group>

        <Group header="发音" footer="使用系统西语语音（es-ES），首次使用可能需下载语音数据。">
          <Row
            title="完成单词时自动朗读"
            icon="volume-high"
            iconColor="#FF9500"
            right={<CSwitch value={ttsEnabled} onValueChange={setTtsEnabled} />}
          />
        </Group>

        <Group
          header="输入"
          footer="开启后以手机输入法代替内置小键盘；重音字母自动归一化，ñ 可长按 N 输入。"
        >
          <Row
            title="使用系统键盘"
            icon="keypad"
            iconColor="#34C759"
            right={<CSwitch value={useSystemKeyboard} onValueChange={setUseSystemKeyboard} />}
          />
        </Group>

        <Group header="词库">
          <Row
            title="词库管理"
            subtitle="开关内置词库、导入自定义词库"
            icon="library"
            iconColor="#007AFF"
            chevron
            onPress={() => navigation.navigate('WordPacks')}
          />
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 16, paddingBottom: 32 },
});

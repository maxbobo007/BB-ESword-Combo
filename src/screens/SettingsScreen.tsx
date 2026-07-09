import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Appbar, List, RadioButton, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSettingsStore, ThemeMode } from '@/store/settingsStore';
import { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'system', label: '跟随系统', icon: 'theme-light-dark' },
  { mode: 'light', label: '浅色', icon: 'white-balance-sunny' },
  { mode: 'dark', label: '深色', icon: 'weather-night' },
];

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    themeMode,
    ttsEnabled,
    useSystemKeyboard,
    setThemeMode,
    setTtsEnabled,
    setUseSystemKeyboard,
  } = useSettingsStore();

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <Appbar.Header mode="small" elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="设置" />
      </Appbar.Header>

      <ScrollView>
        <List.Section>
          <List.Subheader>外观</List.Subheader>
          <RadioButton.Group
            value={themeMode}
            onValueChange={value => setThemeMode(value as ThemeMode)}
          >
            {THEME_OPTIONS.map(option => (
              <List.Item
                key={option.mode}
                title={option.label}
                left={props => <List.Icon {...props} icon={option.icon} />}
                right={() => <RadioButton value={option.mode} />}
                onPress={() => setThemeMode(option.mode)}
              />
            ))}
          </RadioButton.Group>
        </List.Section>

        <List.Section>
          <List.Subheader>发音</List.Subheader>
          <List.Item
            title="完成单词时自动朗读"
            description="使用系统西语语音（es-ES）"
            left={props => <List.Icon {...props} icon="volume-high" />}
            right={() => <Switch value={ttsEnabled} onValueChange={setTtsEnabled} />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>输入</List.Subheader>
          <List.Item
            title="使用系统键盘"
            description="以手机输入法代替内置小键盘（重音字母自动归一化，ñ 可长按 N 输入）"
            left={props => <List.Icon {...props} icon="keyboard-outline" />}
            right={() => (
              <Switch value={useSystemKeyboard} onValueChange={setUseSystemKeyboard} />
            )}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>词库</List.Subheader>
          <List.Item
            title="词库管理"
            description="开关内置词库、导入自定义词库"
            left={props => <List.Icon {...props} icon="bookshelf" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('WordPacks')}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

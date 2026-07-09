import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Appbar,
  List,
  Switch,
  Text,
  Button,
  Portal,
  Dialog,
  TextInput,
  IconButton,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWordPackStore, isPackEnabled } from '@/store/wordPackStore';
import { BUILTIN_PACKS } from '@/core/data/words';
import { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WordPacks'>;

const EXAMPLE = `示例 JSON：
[{"spanish":"gato","english":"cat","chinese":"猫"}, …]

示例 CSV（首行表头可省略）：
spanish,english,chinese
gato,cat,猫`;

export const WordPacksScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const store = useWordPackStore();
  const [importVisible, setImportVisible] = useState(false);
  const [packName, setPackName] = useState('');
  const [packText, setPackText] = useState('');
  const [importError, setImportError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleImport = () => {
    const result = store.importPack(packText, packName.trim() || '我的词库');
    if (!result.ok) {
      setImportError(result.error ?? '导入失败');
      return;
    }
    setImportVisible(false);
    setPackName('');
    setPackText('');
    setImportError('');
    setSnackbar(`导入成功：${result.count} 个单词`);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <Appbar.Header mode="small" elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="词库管理" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <List.Section>
          <List.Subheader>内置词库</List.Subheader>
          {BUILTIN_PACKS.map(pack => (
            <List.Item
              key={pack.id}
              title={pack.name}
              description={`${pack.description ?? ''} · ${pack.words.length} 词`}
              left={props => <List.Icon {...props} icon="book" />}
              right={() => (
                <Switch
                  value={isPackEnabled(store, pack.id)}
                  onValueChange={() => store.togglePack(pack.id)}
                />
              )}
            />
          ))}
        </List.Section>

        <List.Section>
          <List.Subheader>我的词库</List.Subheader>
          {store.customPacks.length === 0 && (
            <Text
              variant="bodyMedium"
              style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}
            >
              还没有自定义词库，点击下方按钮导入
            </Text>
          )}
          {store.customPacks.map(pack => (
            <List.Item
              key={pack.id}
              title={pack.name}
              description={`${pack.words.length} 词`}
              left={props => <List.Icon {...props} icon="book-open-variant" />}
              right={() => (
                <View style={styles.rowActions}>
                  <Switch
                    value={isPackEnabled(store, pack.id)}
                    onValueChange={() => store.togglePack(pack.id)}
                  />
                  <IconButton
                    icon="delete-outline"
                    onPress={() => setDeleteTarget(pack.id)}
                    accessibilityLabel={`删除 ${pack.name}`}
                  />
                </View>
              )}
            />
          ))}
        </List.Section>

        <Button
          mode="contained"
          icon="import"
          style={styles.importButton}
          onPress={() => setImportVisible(true)}
        >
          导入词库
        </Button>
        <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          注：每日挑战始终使用全部内置词库，不受开关影响，保证全球同题。
        </Text>
      </ScrollView>

      <Portal>
        <Dialog visible={importVisible} onDismiss={() => setImportVisible(false)}>
          <Dialog.Title>导入词库</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="词库名称"
              mode="outlined"
              value={packName}
              onChangeText={setPackName}
              style={styles.input}
            />
            <TextInput
              label="粘贴 JSON 或 CSV 内容"
              mode="outlined"
              value={packText}
              onChangeText={t => {
                setPackText(t);
                setImportError('');
              }}
              multiline
              numberOfLines={6}
              style={styles.input}
            />
            {importError ? (
              <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                {importError}
              </Text>
            ) : (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {EXAMPLE}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImportVisible(false)}>取消</Button>
            <Button mode="contained" onPress={handleImport} disabled={!packText.trim()}>
              导入
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteTarget !== null} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>删除词库？</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">删除后无法恢复。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>取消</Button>
            <Button
              textColor={theme.colors.error}
              onPress={() => {
                if (deleteTarget) {
                  store.removeCustomPack(deleteTarget);
                }
                setDeleteTarget(null);
              }}
            >
              删除
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={snackbar !== ''} onDismiss={() => setSnackbar('')} duration={2500}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 32 },
  empty: { paddingHorizontal: 16, paddingVertical: 8 },
  rowActions: { flexDirection: 'row', alignItems: 'center' },
  importButton: { marginHorizontal: 16, marginTop: 8 },
  hint: { paddingHorizontal: 16, paddingTop: 12 },
  input: { marginBottom: 12 },
});

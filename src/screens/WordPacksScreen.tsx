import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWordPackStore, isPackEnabled } from '@/store/wordPackStore';
import { LEVEL_PACKS, SCENE_PACKS } from '@/core/data/words';
import { RootStackParamList } from '@/navigation/types';
import { useCupertino } from '@/theme/ThemeProvider';
import { type } from '@/theme/cupertino';
import { NavBar, NavAction } from '@/components/cupertino/NavBar';
import { Group, Row } from '@/components/cupertino/InsetGroup';
import { CSwitch } from '@/components/cupertino/controls';
import { CAlert, CToast } from '@/components/cupertino/overlays';

type Props = NativeStackScreenProps<RootStackParamList, 'WordPacks'>;

const PACK_COLORS = ['#34C759', '#30B0C7', '#007AFF', '#5856D6', '#AF52DE', '#FF9500'];

export const WordPacksScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useCupertino();
  const store = useWordPackStore();
  const [importVisible, setImportVisible] = useState(false);
  const [packName, setPackName] = useState('');
  const [packText, setPackText] = useState('');
  const [importError, setImportError] = useState('');
  const [toast, setToast] = useState('');
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
    setToast(`导入成功：${result.count} 个单词`);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <NavBar
        title="词库管理"
        onBack={() => navigation.goBack()}
        right={
          <NavAction
            icon="add-circle-outline"
            onPress={() => setImportVisible(true)}
            accessibilityLabel="导入词库"
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Group header="等级词库" footer="参与主页“等级×主题”选词。每日挑战始终使用全部内置词库，不受开关影响。">
          {LEVEL_PACKS.map((pack, i) => (
            <Row
              key={pack.id}
              title={pack.name}
              subtitle={`${pack.description ?? ''} · ${pack.words.length} 词`}
              icon="book"
              iconColor={PACK_COLORS[i % PACK_COLORS.length]}
              right={
                <CSwitch
                  value={isPackEnabled(store, pack.id)}
                  onValueChange={() => store.togglePack(pack.id)}
                />
              }
            />
          ))}
        </Group>

        <Group header="场景词库" footer="在主页“场景练习”中整包开局，词汇跨等级。">
          {SCENE_PACKS.map((pack, i) => (
            <Row
              key={pack.id}
              title={pack.name.replace(/^场景：/, '')}
              subtitle={`${pack.description ?? ''} · ${pack.words.length} 词`}
              icon="sparkles"
              iconColor={PACK_COLORS[(i + 3) % PACK_COLORS.length]}
              right={
                <CSwitch
                  value={isPackEnabled(store, pack.id)}
                  onValueChange={() => store.togglePack(pack.id)}
                />
              }
            />
          ))}
        </Group>

        <Group
          header="我的词库"
          footer={
            store.customPacks.length === 0
              ? '点击右上角 ＋ 导入词库：粘贴 JSON（[{"spanish":"gato","english":"cat","chinese":"猫"},…]）或 CSV（gato,cat,猫 每行一词）。'
              : '开关控制是否参与选词；点按词库可删除。'
          }
        >
          {store.customPacks.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={[type.body, { color: colors.secondaryLabel }]}>还没有自定义词库</Text>
            </View>
          ) : (
            store.customPacks.map(pack => (
              <Row
                key={pack.id}
                title={pack.name}
                subtitle={`${pack.words.length} 词`}
                icon="albums"
                iconColor="#FF9500"
                right={
                  <View style={styles.rowActions}>
                    <CSwitch
                      value={isPackEnabled(store, pack.id)}
                      onValueChange={() => store.togglePack(pack.id)}
                    />
                  </View>
                }
                onPress={() => setDeleteTarget(pack.id)}
              />
            ))
          )}
        </Group>
      </ScrollView>

      <CAlert
        visible={importVisible}
        title="导入词库"
        onDismiss={() => setImportVisible(false)}
        wide
        actions={[
          { text: '取消', style: 'cancel', onPress: () => setImportVisible(false) },
          { text: '导入', onPress: handleImport },
        ]}
      >
        <View style={styles.form}>
          <TextInput
            placeholder="词库名称"
            placeholderTextColor={colors.tertiaryLabel}
            value={packName}
            onChangeText={setPackName}
            style={[
              styles.input,
              { backgroundColor: colors.fill, color: colors.label },
            ]}
          />
          <TextInput
            placeholder='粘贴 JSON 或 CSV 内容，如：gato,cat,猫'
            placeholderTextColor={colors.tertiaryLabel}
            value={packText}
            onChangeText={t => {
              setPackText(t);
              setImportError('');
            }}
            multiline
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.fill, color: colors.label },
            ]}
          />
          {importError ? (
            <Text style={[type.footnote, { color: colors.red }]}>{importError}</Text>
          ) : null}
        </View>
      </CAlert>

      <CAlert
        visible={deleteTarget !== null}
        title="删除这个词库？"
        message="删除后无法恢复。"
        onDismiss={() => setDeleteTarget(null)}
        actions={[
          { text: '取消', style: 'cancel', onPress: () => setDeleteTarget(null) },
          {
            text: '删除',
            style: 'destructive',
            onPress: () => {
              if (deleteTarget) {
                store.removeCustomPack(deleteTarget);
              }
              setDeleteTarget(null);
            },
          },
        ]}
      />

      <CToast message={toast} onHide={() => setToast('')} duration={2500} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 16, paddingBottom: 32 },
  emptyRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  form: {
    marginTop: 12,
    gap: 10,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});

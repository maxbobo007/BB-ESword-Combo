import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Sheet } from '@/components/Sheet';
import { useSettingsStore } from '@/store/settingsStore';
import { TENSES } from '@/conjugation/tenses';
import { buildExample } from '@/conjugation/examples';
import { colors, latin, radius, space, type, webFocus } from '@/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LEVEL_LABEL = { A1: 'A1', A2: 'A2', B1: 'B1 · 进阶' } as const;

export const SettingsSheet: React.FC<Props> = ({ visible, onClose }) => {
  const { tenses, vosotros, toggleTense, setVosotros } = useSettingsStore();

  return (
    <Sheet visible={visible} title="设置" onClose={onClose}>
      <Text role="heading" style={styles.section}>
        变位练习的时态
      </Text>
      <Text style={styles.hint}>至少保留一个。每个时态下面是 hablar 的例子（命令式是“你”，其余是“我”）。</Text>
      <View style={styles.list}>
        {TENSES.map(t => {
          const on = tenses.includes(t.id);
          const sample = buildExample('hablar', t.id, t.id === 'imperativo' ? 1 : 0);
          return (
            <Pressable
              key={t.id}
              role="checkbox"
              aria-checked={on}
              aria-label={`${t.zh}，${t.es}，${LEVEL_LABEL[t.level]}`}
              onPress={() => toggleTense(t.id)}
              style={s => [styles.row, on && styles.rowOn, webFocus(s)]}
            >
              <View style={[styles.box, on && styles.boxOn]}>
                {on && <Text style={styles.check}>✓</Text>}
              </View>
              <View style={styles.rowText}>
                <Text style={styles.name}>
                  {t.zh} <Text style={[styles.es, latin(600)]}>{t.es}</Text>
                </Text>
                {sample && (
                  <Text style={[styles.sample, latin(600)]} accessibilityLanguage="es-ES">
                    {sample.form}
                  </Text>
                )}
              </View>
              <Text style={[styles.level, t.level === 'B1' && styles.levelB1]}>{t.level}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text role="heading" style={styles.section}>
        人称
      </Text>
      <Pressable
        role="switch"
        aria-checked={vosotros}
        aria-label="包含 vosotros（你们，西班牙用法）"
        onPress={() => setVosotros(!vosotros)}
        style={s => [styles.row, vosotros && styles.rowOn, webFocus(s)]}
      >
        <View style={[styles.box, vosotros && styles.boxOn]}>
          {vosotros && <Text style={styles.check}>✓</Text>}
        </View>
        <View style={styles.rowText}>
          <Text style={styles.name}>
            包含 <Text style={[styles.es, latin(700)]}>vosotros</Text>
          </Text>
          <Text style={styles.sample}>“你们”的西班牙用法；拉美通常用 ustedes 代替</Text>
        </View>
      </Pressable>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  section: { ...type.caption, color: colors.inkMuted, letterSpacing: 1, marginTop: space.md, marginBottom: space.xs },
  hint: { ...type.caption, color: colors.inkMuted, marginBottom: space.sm },
  list: { gap: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 52,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: colors.onPrimary, fontSize: 15, fontWeight: '800', lineHeight: 18 },
  rowText: { flex: 1 },
  name: { ...type.label, color: colors.ink },
  es: { fontSize: 13, color: colors.inkMuted },
  sample: { ...type.caption, color: colors.primaryPressed, marginTop: 2 },
  level: {
    ...type.caption,
    fontWeight: '700',
    color: colors.inkMuted,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  levelB1: { color: colors.accent, backgroundColor: colors.accentSoft },
});

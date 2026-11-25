import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, webFocus, radius, shadow, space, type } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useEscape } from '@/components/Dialog';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// 从底部弹出的面板：线索列表、玩法说明、结果页共用
export const Sheet: React.FC<SheetProps> = ({ visible, title, onClose, children, footer }) => {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  useEscape(visible, onClose);

  return (
    <Modal
      transparent
      animationType={reducedMotion ? 'none' : 'slide'}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} aria-label="关闭" />
        <View
          role="dialog"
          aria-modal
          aria-label={title}
          style={[styles.panel, { paddingBottom: Math.max(insets.bottom, space.lg) }]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text role="heading" style={styles.title}>
              {title}
            </Text>
            <Pressable
              role="button"
              aria-label="关闭"
              onPress={onClose}
              hitSlop={8}
              style={state => [
                styles.close,
                state.pressed && styles.closePressed,
                webFocus(state),
              ]}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  panel: {
    maxHeight: '80%',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    boxShadow: shadow.raised,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginTop: space.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
  title: { ...type.title, color: colors.ink },
  close: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: { backgroundColor: colors.surfaceAlt },
  closeText: { fontSize: 18, color: colors.inkMuted },
  body: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.sm },
});

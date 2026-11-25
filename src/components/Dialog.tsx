import React, { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, webFocus, radius, shadow, space, type } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: DialogAction[];
  onRequestClose?: () => void;
}

// React Native 的 Alert 在 Web 上不工作，用 Modal 做一个三端一致的对话框
export const Dialog: React.FC<DialogProps> = ({ visible, title, message, actions, onRequestClose }) => {
  const reducedMotion = useReducedMotion();
  useEscape(visible, onRequestClose);

  return (
    <Modal
      transparent
      animationType={reducedMotion ? 'none' : 'fade'}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card} role="alertdialog" aria-modal aria-label={title}>
          <Text role="heading" style={styles.title}>
            {title}
          </Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {actions.map(action => (
              <Button key={action.label} {...action} />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const Button: React.FC<DialogAction & { compact?: boolean }> = ({
  label,
  onPress,
  variant = 'secondary',
  compact,
}) => (
  <Pressable
    role="button"
    aria-label={label}
    onPress={onPress}
    style={state => [
      styles.button,
      compact && styles.compact,
      variant === 'primary' && styles.primary,
      variant === 'danger' && styles.danger,
      variant === 'secondary' && styles.secondary,
      state.pressed && (variant === 'secondary' ? styles.secondaryPressed : styles.solidPressed),
      webFocus(state),
    ]}
  >
    <Text style={[styles.buttonText, variant !== 'secondary' && styles.buttonTextLight]}>
      {label}
    </Text>
  </Pressable>
);

// Web 上按 Esc 关闭
export const useEscape = (active: boolean, onClose?: () => void) => {
  useEffect(() => {
    if (!active || !onClose || Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, onClose]);
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    boxShadow: shadow.raised,
  },
  title: { ...type.title, color: colors.ink, marginBottom: space.sm },
  message: { ...type.body, color: colors.inkMuted, marginBottom: space.lg },
  actions: { gap: space.sm, marginTop: space.xs },
  button: {
    minHeight: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { minHeight: 44, borderRadius: radius.md },
  primary: { backgroundColor: colors.primary, boxShadow: shadow.primary },
  danger: { backgroundColor: colors.danger },
  secondary: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  secondaryPressed: { backgroundColor: colors.primarySoft },
  solidPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  buttonTextLight: { color: colors.onPrimary },
});
